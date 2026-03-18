// Netlify Edge Function — proxies requests to Anthropic API
// Fetches target website HTML so Claude can analyze the ACTUAL business
// API key is read from Netlify env vars, never exposed to the browser

/** Fetch a website and extract key text content */
async function scrapeWebsite(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s max for scrape

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BayworxSEOAudit/1.0; +https://bayworx.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) return `[Could not fetch website: HTTP ${res.status}]`;

    const html = await res.text();

    // Extract useful content from HTML
    const extract = (regex, fallback = "") => {
      const m = html.match(regex);
      return m ? m[1].replace(/<[^>]*>/g, "").trim() : fallback;
    };

    const extractAll = (regex, limit = 20) => {
      const results = [];
      let m;
      const re = new RegExp(regex, "gi");
      while ((m = re.exec(html)) !== null && results.length < limit) {
        const text = m[1].replace(/<[^>]*>/g, "").trim();
        if (text) results.push(text);
      }
      return results;
    };

    const title = extract(/<title[^>]*>([\s\S]*?)<\/title>/i, "No title");
    const metaDesc = extract(
      /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i,
      ""
    );
    const metaKeywords = extract(
      /<meta[^>]*name=["']keywords["'][^>]*content=["']([\s\S]*?)["']/i,
      ""
    );
    const ogTitle = extract(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i,
      ""
    );
    const ogDesc = extract(
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i,
      ""
    );
    const ogType = extract(
      /<meta[^>]*property=["']og:type["'][^>]*content=["']([\s\S]*?)["']/i,
      ""
    );

    const h1s = extractAll(/<h1[^>]*>([\s\S]*?)<\/h1>/i, 5);
    const h2s = extractAll(/<h2[^>]*>([\s\S]*?)<\/h2>/i, 10);
    const h3s = extractAll(/<h3[^>]*>([\s\S]*?)<\/h3>/i, 10);

    // Extract visible text from paragraphs, list items, spans in main content
    const paragraphs = extractAll(/<p[^>]*>([\s\S]*?)<\/p>/i, 15);
    const listItems = extractAll(/<li[^>]*>([\s\S]*?)<\/li>/i, 10);

    // Extract nav/menu links for site structure
    const links = extractAll(/<a[^>]*>([\s\S]*?)<\/a>/i, 20);

    // Check for structured data
    const schemaTypes = extractAll(
      /"@type"\s*:\s*"([^"]+)"/i,
      5
    );

    // Build a clean content summary
    let content = `=== ACTUAL WEBSITE CONTENT SCRAPED FROM ${url} ===\n\n`;
    content += `PAGE TITLE: ${title}\n`;
    if (metaDesc) content += `META DESCRIPTION: ${metaDesc}\n`;
    if (metaKeywords) content += `META KEYWORDS: ${metaKeywords}\n`;
    if (ogTitle) content += `OG TITLE: ${ogTitle}\n`;
    if (ogDesc) content += `OG DESCRIPTION: ${ogDesc}\n`;
    if (ogType) content += `OG TYPE: ${ogType}\n`;
    if (schemaTypes.length)
      content += `SCHEMA.ORG TYPES: ${schemaTypes.join(", ")}\n`;
    content += "\n";

    if (h1s.length) content += `H1 HEADINGS:\n${h1s.map((h) => `  - ${h}`).join("\n")}\n\n`;
    if (h2s.length) content += `H2 HEADINGS:\n${h2s.map((h) => `  - ${h}`).join("\n")}\n\n`;
    if (h3s.length) content += `H3 HEADINGS:\n${h3s.map((h) => `  - ${h}`).join("\n")}\n\n`;

    if (paragraphs.length)
      content += `PAGE CONTENT (paragraphs):\n${paragraphs.map((p) => `  ${p}`).join("\n")}\n\n`;
    if (listItems.length)
      content += `LIST ITEMS:\n${listItems.map((l) => `  - ${l}`).join("\n")}\n\n`;

    if (links.length) {
      const uniqueLinks = [...new Set(links.filter((l) => l.length > 1 && l.length < 60))];
      content += `NAVIGATION/LINKS:\n${uniqueLinks.slice(0, 15).map((l) => `  - ${l}`).join("\n")}\n\n`;
    }

    content += `=== END OF SCRAPED CONTENT ===`;

    return content;
  } catch (err) {
    if (err.name === "AbortError") {
      return `[Website fetch timed out after 8 seconds — analyze based on URL and domain name]`;
    }
    return `[Could not fetch website: ${err.message}]`;
  }
}

export default async (req) => {
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
    let messages = body.messages;
    if (body.targetUrl) {
      const scrapedContent = await scrapeWebsite(body.targetUrl);
      // Prepend scraped content to the last user message
      messages = messages.map((msg, i) => {
        if (i === messages.length - 1 && msg.role === "user") {
          return {
            ...msg,
            content: `${scrapedContent}\n\n${msg.content}`,
          };
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
        messages: messages,
      }),
    });

    const data = await anthropicRes.json();

    return new Response(JSON.stringify(data), {
      status: anthropicRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Proxy error: " + err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = {
  path: "/api/claude",
};
