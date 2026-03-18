// Netlify Edge Function — proxies requests to Anthropic API
// Fetches target website HTML so Claude can analyze the ACTUAL business
// API key is read from Netlify env vars, never exposed to the browser

/** Try fetching a URL with full browser-like headers */
async function tryFetch(url, signal) {
  return fetch(url, {
    signal,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Ch-Ua": '"Chromium";v="131", "Not_A Brand";v="24"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"macOS"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    },
    redirect: "follow",
  });
}

/** Fetch a website and extract key text content */
async function scrapeWebsite(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    let res = await tryFetch(url, controller.signal);

    // If blocked, try www variant or vice versa
    if (res.status === 403 || res.status === 406) {
      const urlObj = new URL(url);
      if (urlObj.hostname.startsWith("www.")) {
        urlObj.hostname = urlObj.hostname.slice(4);
      } else {
        urlObj.hostname = "www." + urlObj.hostname;
      }
      res = await tryFetch(urlObj.toString(), controller.signal);
    }

    clearTimeout(timer);

    if (!res.ok) {
      return `[Website returned HTTP ${res.status}. URL: ${url}. Analyze based on the domain name and URL structure.]`;
    }

    const html = await res.text();
    if (!html || html.length < 100) {
      return `[Website returned very little content. URL: ${url}. The site may use JavaScript rendering.]`;
    }

    // Extract single match
    const extract = (regex, fallback = "") => {
      const m = html.match(regex);
      return m ? m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : fallback;
    };

    // Extract multiple matches
    const extractAll = (regex, max = 20) => {
      const results = [];
      const re = new RegExp(regex, "gi");
      let m;
      while ((m = re.exec(html)) !== null && results.length < max) {
        const text = m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        if (text && text.length > 1) results.push(text);
      }
      return results;
    };

    const title = extract(/<title[^>]*>([\s\S]*?)<\/title>/i, "No title found");

    // Meta tags — try both attribute orders (name before content, content before name)
    const metaDesc =
      extract(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i) ||
      extract(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i);
    const ogTitle =
      extract(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i) ||
      extract(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:title["']/i);
    const ogDesc =
      extract(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i) ||
      extract(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:description["']/i);

    const h1s = extractAll(/<h1[^>]*>([\s\S]*?)<\/h1>/i, 5);
    const h2s = extractAll(/<h2[^>]*>([\s\S]*?)<\/h2>/i, 10);
    const h3s = extractAll(/<h3[^>]*>([\s\S]*?)<\/h3>/i, 10);
    const paragraphs = extractAll(/<p[^>]*>([\s\S]*?)<\/p>/i, 20);
    const listItems = extractAll(/<li[^>]*>([\s\S]*?)<\/li>/i, 15);
    const links = extractAll(/<a[^>]*>([\s\S]*?)<\/a>/i, 25);
    const schemaTypes = extractAll(/"@type"\s*:\s*"([^"]+)"/i, 5);

    // Build content summary — keep it under ~3000 chars to leave room for tokens
    let out = `=== WEBSITE CONTENT FROM ${url} ===\n`;
    out += `TITLE: ${title}\n`;
    if (metaDesc) out += `DESCRIPTION: ${metaDesc}\n`;
    if (ogTitle && ogTitle !== title) out += `OG TITLE: ${ogTitle}\n`;
    if (ogDesc && ogDesc !== metaDesc) out += `OG DESC: ${ogDesc}\n`;
    if (schemaTypes.length) out += `SCHEMA TYPES: ${schemaTypes.join(", ")}\n`;
    out += "\n";

    if (h1s.length) out += `H1: ${h1s.join(" | ")}\n`;
    if (h2s.length) out += `H2: ${h2s.join(" | ")}\n`;
    if (h3s.length) out += `H3: ${h3s.join(" | ")}\n`;
    out += "\n";

    // Only include meaningful paragraphs (filter out tiny/empty ones)
    const goodParas = paragraphs.filter((p) => p.length > 20).slice(0, 12);
    if (goodParas.length) out += `CONTENT:\n${goodParas.join("\n")}\n\n`;

    if (listItems.length) out += `LIST ITEMS: ${listItems.join(" | ")}\n\n`;

    const uniqueLinks = [...new Set(links.filter((l) => l.length > 2 && l.length < 50))].slice(0, 12);
    if (uniqueLinks.length) out += `NAV: ${uniqueLinks.join(" | ")}\n`;

    out += `=== END ===`;

    // Hard cap to prevent token overflow
    if (out.length > 4000) out = out.slice(0, 4000) + "\n[...truncated]";

    return out;
  } catch (err) {
    if (err.name === "AbortError") {
      return `[Website fetch timed out. URL: ${url}. Analyze based on the domain name.]`;
    }
    return `[Could not fetch website (${err.message}). URL: ${url}. Analyze based on the domain name.]`;
  }
}

export default async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = (Deno.env.get("ANTHROPIC_API_KEY") || "").trim();
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured — missing API key" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    if (!body.messages || !body.model) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // If a targetUrl is provided, scrape it and prepend content to the user message
    let messages = [...body.messages];
    if (body.targetUrl) {
      const scraped = await scrapeWebsite(body.targetUrl);
      messages = messages.map((msg, i) => {
        if (i === messages.length - 1 && msg.role === "user") {
          return { ...msg, content: scraped + "\n\n" + msg.content };
        }
        return msg;
      });
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model,
        max_tokens: body.max_tokens || 2048,
        system: body.system || "",
        messages,
      }),
    });

    const data = await anthropicRes.json();

    return new Response(JSON.stringify(data), {
      status: anthropicRes.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Proxy error: " + err.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

export const config = {
  path: "/api/claude",
};
