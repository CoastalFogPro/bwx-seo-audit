import { useState, useRef, useEffect } from "react";

const BAYWORX_LOGO = "https://www.bayworx.com/assets/bayworx.png";
const PHASES = [
  { key: "analyze", label: "Researching & Analyzing", icon: "🔍" },
  { key: "report", label: "Generating Report", icon: "📊" },
];
const BW = {
  bg: "#0a0e17", surface: "rgba(20,30,50,0.6)", border: "rgba(56,130,246,0.12)",
  accent: "#3882f6", accentLight: "#60a5fa", accentGlow: "rgba(56,130,246,0.15)",
  orange: "#f97316", green: "#22c55e", red: "#ef4444", yellow: "#f59e0b",
  text: "#e2e8f0", textMuted: "#7c8ba5", textDim: "#4a5568",
};

const SectionCard = ({ title, icon, children, accent }) => (
  <div style={{ background: BW.surface, border: `1px solid ${BW.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 20, position: "relative", overflow: "hidden", backdropFilter: "blur(12px)" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent || `linear-gradient(90deg, ${BW.accent}, ${BW.accentLight})` }} />
    <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: BW.text, margin: "0 0 18px 0", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>{icon}</span> {title}
    </h3>
    {children}
  </div>
);

const ScoreBar = ({ label, score, color }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: BW.textMuted }}>{label}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color }}>{score}/100</span>
    </div>
    <div style={{ height: 6, background: "rgba(56,130,246,0.08)", borderRadius: 3 }}>
      <div style={{ height: "100%", borderRadius: 3, width: `${score}%`, background: color, transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)" }} />
    </div>
  </div>
);

const IssueItem = ({ severity, text }) => {
  const colors = { critical: BW.red, warning: BW.yellow, info: BW.accent };
  const labels = { critical: "CRITICAL", warning: "WARNING", info: "INFO" };
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${BW.border}` }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700, color: colors[severity], background: `${colors[severity]}15`, padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap", marginTop: 2 }}>{labels[severity]}</span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: BW.text, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
};

// ─── HTML Report Generator ────────────────
const generateReport = (report) => {
  const gc = (s) => s >= 70 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";
  const grade = (s) => s >= 90 ? "A+" : s >= 80 ? "A" : s >= 70 ? "B" : s >= 55 ? "C" : s >= 40 ? "D" : "F";
  const bar = (label, score) => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="color:#7c8ba5;font-size:13px">${label}</span>
        <span style="font-family:monospace;font-weight:700;color:${gc(score)}">${score}/100</span>
      </div>
      <div style="height:8px;background:#1a2744;border-radius:4px">
        <div style="height:100%;width:${score}%;background:${gc(score)};border-radius:4px"></div>
      </div>
    </div>`;
  const issue = (sev, text) => {
    const c = sev === "critical" ? "#ef4444" : sev === "warning" ? "#f59e0b" : "#3882f6";
    return `<div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #1a2744">
      <span style="font-family:monospace;font-size:10px;font-weight:700;color:${c};background:${c}18;padding:3px 8px;border-radius:4px;white-space:nowrap">${sev.toUpperCase()}</span>
      <span style="font-size:13px;color:#e2e8f0;line-height:1.5">${text}</span>
    </div>`;
  };
  const bullet = (text, color, ch = "→") => `<div style="display:flex;gap:8px;margin-bottom:8px"><span style="color:${color};font-size:15px">${ch}</span><span style="font-size:13px;color:#e2e8f0;line-height:1.5">${text}</span></div>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SEO Audit - ${report.seo.business_name}</title>
<style>
  @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .page-break { page-break-before: always; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0e17; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 0; }
  .page { max-width: 800px; margin: 0 auto; padding: 50px 60px; }
  .section { margin-bottom: 36px; }
  .section-title { font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid #3882f6; }
  .card { background: #0f1a2e; border: 1px solid #1a2744; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
  .footer { text-align: center; padding: 30px 0; color: #4a5568; font-size: 11px; border-top: 1px solid #1a2744; margin-top: 40px; }
</style></head><body>
<div class="page">
  <div style="text-align:center;padding:60px 0 40px">
    <img src="${BAYWORX_LOGO}" alt="BAYWORX" style="height:50px;margin-bottom:30px" onerror="this.outerHTML='<div style=font-size:32px;font-weight:800;color:#3882f6;letter-spacing:3px>BAYWORX</div>'"/>
    <div style="width:50px;height:3px;background:#3882f6;margin:0 auto 30px"></div>
    <h1 style="font-size:36px;font-weight:300;color:#fff;margin-bottom:8px">SEO Audit Report</h1>
    <p style="font-size:18px;color:#60a5fa;margin-bottom:6px">${report.seo.business_name}</p>
    <p style="font-family:monospace;font-size:12px;color:#7c8ba5">${report.url}</p>
    <p style="font-size:12px;color:#4a5568;margin-top:6px">Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
    <div style="margin:40px auto;width:120px;height:120px;border-radius:50%;border:4px solid ${gc(report.seo.overall_score)};display:flex;flex-direction:column;align-items:center;justify-content:center">
      <span style="font-family:monospace;font-size:40px;font-weight:700;color:${gc(report.seo.overall_score)}">${grade(report.seo.overall_score)}</span>
      <span style="font-size:12px;color:#7c8ba5">${report.seo.overall_score}/100</span>
    </div>
    <p style="font-size:14px;color:#e2e8f0;max-width:520px;margin:0 auto;line-height:1.7">${report.seo.business_description}</p>
    <div style="display:inline-block;margin-top:14px;padding:6px 16px;background:#3882f618;border-radius:20px;font-family:monospace;font-size:12px;color:#60a5fa">Market: ${report.seo.market}</div>
  </div>
  <div class="footer">Prepared by BAYWORX LLC | 11740 Dublin Blvd Suite 205, Dublin, CA 94568 | (925) 875-0504 | bayworx.com<br/>Confidential — Prepared exclusively for ${report.seo.business_name}</div>
</div>
<div class="page page-break">
  <div class="section">
    <div class="section-title">📈 SEO Performance Scores</div>
    ${bar("Technical SEO", report.seo.scores.technical_seo)}
    ${bar("Content Quality", report.seo.scores.content_quality)}
    ${bar("On-Page SEO", report.seo.scores.on_page_seo)}
    ${bar("Backlink Profile", report.seo.scores.backlink_profile)}
    ${bar("Mobile & UX", report.seo.scores.mobile_ux)}
    ${bar("Page Speed", report.seo.scores.page_speed)}
  </div>
  <div class="section">
    <div class="section-title">⚠️ Issues & Failures Found</div>
    ${(report.seo.critical_issues || []).map(t => issue("critical", t)).join("")}
    ${(report.seo.warnings || []).map(t => issue("warning", t)).join("")}
    ${(report.seo.info_items || []).map(t => issue("info", t)).join("")}
  </div>
  <div class="section">
    <div class="section-title">🚫 Missing SEO Elements</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      ${(report.seo.missing_elements || []).map(el => `<span style="padding:8px 14px;border-radius:8px;background:#ec489918;border:1px solid #ec489930;font-family:monospace;font-size:12px;color:#f9a8d4">${el}</span>`).join("")}
    </div>
  </div>
  <div class="footer">Prepared by BAYWORX LLC | bayworx.com | (925) 875-0504</div>
</div>
<div class="page page-break">
  <div class="section">
    <div class="section-title">🚀 Why You Need Landing Page Funnels</div>
    <div class="card" style="border-left:4px solid #f97316;margin-bottom:24px">
      <p style="font-size:18px;font-style:italic;color:#fed7aa;line-height:1.5">"${report.market.landing_page_pitch.headline}"</p>
    </div>
    <h4 style="font-size:12px;font-weight:700;color:#f97316;letter-spacing:1px;text-transform:uppercase;margin:20px 0 12px">Problems This Solves</h4>
    ${(report.market.landing_page_pitch.problems_solved || []).map(p => bullet(p, "#f97316")).join("")}
    <h4 style="font-size:12px;font-weight:700;color:#22c55e;letter-spacing:1px;text-transform:uppercase;margin:20px 0 12px">Expected Results</h4>
    ${(report.market.landing_page_pitch.expected_results || []).map(r => bullet(r, "#22c55e", "✓")).join("")}
    <h4 style="font-size:12px;font-weight:700;color:#60a5fa;letter-spacing:1px;text-transform:uppercase;margin:20px 0 12px">Recommended Funnel Types</h4>
    ${(report.market.landing_page_pitch.funnel_types || []).map((f, i) => `<div class="card" style="margin-bottom:8px"><span style="color:#60a5fa;font-weight:700">${i + 1}.</span> <span style="color:#e2e8f0;font-size:13px">${f}</span></div>`).join("")}
  </div>
  <div class="footer">Prepared by BAYWORX LLC | bayworx.com | (925) 875-0504</div>
</div>
<div class="page page-break">
  <div class="section">
    <div class="section-title">💡 Additional Services & BAYWORX Solutions</div>
    <p style="font-size:13px;color:#7c8ba5;line-height:1.6;margin-bottom:24px">${report.market.market_analysis}</p>
    ${(report.market.additional_services || []).map((svc, i) => `
      <div class="card" style="margin-bottom:20px;border-top:3px solid #3882f6">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <span style="font-family:monospace;font-size:11px;font-weight:700;color:#0a0e17;background:#06b6d4;padding:2px 10px;border-radius:4px">${i + 1}</span>
          <span style="font-size:17px;font-weight:600;color:#fff">${svc.service}</span>
        </div>
        <p style="font-size:13px;color:#e2e8f0;line-height:1.6;margin-bottom:8px;padding-left:36px">${svc.description}</p>
        <div style="padding-left:36px;margin-bottom:12px">
          <span style="display:inline-block;padding:4px 12px;background:#22c55e18;border-radius:6px;font-family:monospace;font-size:11px;color:#86efac">Lead Impact: ${svc.lead_impact}</span>
        </div>
        ${svc.bayworx_solution ? `<div style="margin-left:36px;padding:14px 18px;background:#3882f618;border-radius:10px;border-left:3px solid #3882f6">
          <div style="font-family:monospace;font-size:10px;font-weight:700;color:#3882f6;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">How BAYWORX Delivers This</div>
          <p style="font-size:12px;color:#e2e8f0;line-height:1.6">${svc.bayworx_solution}</p>
        </div>` : ""}
      </div>`).join("")}
  </div>
  <div class="section" style="margin-top:30px">
    <div class="section-title">📞 Next Steps</div>
    <div style="font-size:14px;color:#e2e8f0;line-height:2">
      <p>1. Review this audit with your team and prioritize the critical issues identified.</p>
      <p>2. Schedule a strategy call with BAYWORX to discuss a tailored action plan.</p>
      <p>3. We'll build and deploy landing page funnels and additional services to drive leads.</p>
    </div>
  </div>
  <div class="card" style="text-align:center;margin-top:30px;border-top:3px solid #3882f6">
    <p style="font-size:18px;font-weight:700;color:#fff;margin-bottom:4px">BAYWORX LLC</p>
    <p style="font-size:13px;color:#7c8ba5">11740 Dublin Blvd Suite 205, Dublin, CA 94568</p>
    <p style="font-size:13px;color:#7c8ba5">(925) 875-0504 | bayworx.com</p>
  </div>
  <div class="footer">Prepared by BAYWORX LLC | Confidential</div>
</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `BAYWORX_SEO_Audit_${report.seo.business_name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
};

// ─── Main Component ────────────────────
export default function SEOAuditTool() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState(null);
  const [phaseIdx, setPhaseIdx] = useState(-1);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [dots, setDots] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    if (phase) {
      const iv = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 400);
      return () => clearInterval(iv);
    }
  }, [phase]);

  const normalizeUrl = (input) => { let u = input.trim(); if (!/^https?:\/\//i.test(u)) u = "https://" + u; return u; };

  // Calls our Netlify Function proxy — no API key in the browser
  const callClaude = async (systemPrompt, userPrompt, useSearch = false) => {
    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    };
    if (useSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];

    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) throw new Error(typeof data.error === "string" ? data.error : data.error.message || "API error");
    return data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
  };

  const extractJSON = (text) => {
    let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    try { return JSON.parse(cleaned); } catch (e) { /* */ }
    const f = cleaned.indexOf("{"), l = cleaned.lastIndexOf("}");
    if (f !== -1 && l > f) { try { return JSON.parse(cleaned.slice(f, l + 1)); } catch (e) { /* */ } }
    return null;
  };

  const runAudit = async () => {
    if (!url.trim()) return;
    setError(null); setReport(null);
    const targetUrl = normalizeUrl(url);
    try {
      setPhase("analyze"); setPhaseIdx(0);

      const seoPromise = callClaude(
        `You are an elite SEO auditor. Search for the given website, then return your full analysis as a single JSON object. Do ONE quick search, then immediately produce JSON.

SCORING CALIBRATION — align with Google PageSpeed Insights methodology:
- 90-100 = Excellent (site follows nearly all best practices, fast, mobile-optimized, strong content)
- 70-89 = Good (solid foundation with some room for improvement — most well-built business sites land here)
- 50-69 = Needs Work (notable gaps in SEO strategy, missing key elements)
- 0-49 = Poor (major fundamental problems, barely optimized)

IMPORTANT: Be consistent. A typical professional business website with decent design, some blog content, proper HTTPS, and basic meta tags should score in the 55-75 range. A well-optimized site with schema markup, fast loading, strong content strategy scores 75-90. Only truly broken or abandoned sites score below 40. Do NOT default to low scores — evaluate each dimension fairly based on what you find.

Your ENTIRE text response must be ONLY a valid JSON object. No other text, no markdown. Schema:
{"business_name":"string","business_description":"2-3 sentences","market":"industry/niche","scores":{"technical_seo":65,"content_quality":60,"on_page_seo":65,"backlink_profile":55,"mobile_ux":70,"page_speed":70},"overall_score":64,"critical_issues":["3-5 critical SEO problems found"],"warnings":["3-5 moderate issues"],"info_items":["2-3 minor suggestions"],"missing_elements":["specific missing SEO elements like schema markup, XML sitemap, etc"],"competitors":["comp1","comp2","comp3"]}`,
        `Audit this website's SEO: ${targetUrl}`, true);

      const marketPromise = callClaude(
        `You are a digital marketing strategist who works for BAYWORX LLC, an IT solutions and custom development company with 20+ years of experience. BAYWORX offers: Managed IT, Custom App Development, System Integration, Process Automation, Cloud Hosting, and SEO/Landing Page services.
Search for the given website, then return JSON. Your ENTIRE text response must be ONLY a valid JSON object. No other text, no markdown. Schema:
{"market_analysis":"3-4 sentences about market position and opportunity","landing_page_pitch":{"headline":"compelling one-liner about why they need landing page funnels","problems_solved":["5 specific problems landing pages solve"],"expected_results":["4 measurable outcomes"],"funnel_types":["3 recommended funnel types with descriptions"]},"additional_services":[{"service":"name","description":"2 sentences about the service","lead_impact":"expected impact","bayworx_solution":"2-3 sentences explaining specifically how BAYWORX would implement this using their custom development, integration, automation, managed IT, or hosting capabilities. Be specific and compelling."}]}
Provide exactly 5 items in additional_services.`,
        `Analyze this website's market and lead generation opportunities: ${targetUrl}`, true);

      const [seoRaw, marketRaw] = await Promise.all([seoPromise, marketPromise]);
      setPhase("report"); setPhaseIdx(1);

      const seoData = extractJSON(seoRaw);
      if (!seoData || !seoData.scores) throw new Error("SEO analysis failed to parse. Please try again.");
      seoData.critical_issues = seoData.critical_issues || ["No data"];
      seoData.warnings = seoData.warnings || ["No data"];
      seoData.info_items = seoData.info_items || ["No data"];
      seoData.missing_elements = seoData.missing_elements || ["Unknown"];
      seoData.competitors = seoData.competitors || ["Unknown"];
      seoData.business_name = seoData.business_name || targetUrl;
      seoData.business_description = seoData.business_description || "Description unavailable.";
      seoData.market = seoData.market || "General";
      seoData.overall_score = seoData.overall_score || Math.round(Object.values(seoData.scores).reduce((a, b) => a + b, 0) / 6);

      const marketInfo = extractJSON(marketRaw);
      if (!marketInfo || !marketInfo.landing_page_pitch) throw new Error("Market analysis failed to parse. Please try again.");
      marketInfo.market_analysis = marketInfo.market_analysis || "Analysis unavailable.";
      marketInfo.additional_services = marketInfo.additional_services || [];
      marketInfo.landing_page_pitch.problems_solved = marketInfo.landing_page_pitch.problems_solved || [];
      marketInfo.landing_page_pitch.expected_results = marketInfo.landing_page_pitch.expected_results || [];
      marketInfo.landing_page_pitch.funnel_types = marketInfo.landing_page_pitch.funnel_types || [];

      await new Promise(r => setTimeout(r, 400));
      setReport({ url: targetUrl, seo: seoData, market: marketInfo });
      setPhase(null); setPhaseIdx(-1);
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setPhase(null); setPhaseIdx(-1);
    }
  };

  const handleDownload = () => {
    setPdfLoading(true);
    try { generateReport(report); } catch (e) { alert("Download failed: " + e.message); }
    setPdfLoading(false);
  };

  const getScoreColor = (s) => s >= 70 ? BW.green : s >= 50 ? BW.yellow : BW.red;
  const getGrade = (s) => s >= 90 ? "A+" : s >= 80 ? "A" : s >= 70 ? "B" : s >= 55 ? "C" : s >= 40 ? "D" : "F";

  return (
    <div style={{ minHeight: "100vh", background: BW.bg, color: BW.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ padding: "48px 32px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,130,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ marginBottom: 20 }}>
          <img src={BAYWORX_LOGO} alt="BAYWORX" style={{ height: 44, objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
          <span style={{ display: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: BW.accent, letterSpacing: 2 }}>BAYWORX</span>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: BW.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Internal SEO Intelligence Tool</div>
        <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 400, margin: "0 0 10px 0", lineHeight: 1.1 }}>
          Client SEO <span style={{ fontStyle: "italic", color: BW.accent }}>Audit</span>
        </h1>
        <p style={{ fontSize: 15, color: BW.textMuted, maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.6 }}>
          Enter a prospect's URL to generate a comprehensive SEO audit with actionable upsell opportunities.
        </p>

        <div style={{ display: "flex", gap: 0, maxWidth: 540, margin: "0 auto", background: BW.surface, border: `1px solid ${BW.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "0 14px", display: "flex", alignItems: "center", color: BW.textMuted, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>https://</div>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && !phase && runAudit()} placeholder="clientwebsite.com" disabled={!!phase}
            style={{ flex: 1, padding: "15px 0", background: "transparent", border: "none", outline: "none", color: BW.text, fontSize: 15, fontFamily: "'DM Mono', monospace" }} />
          <button onClick={runAudit} disabled={!!phase || !url.trim()}
            style={{ padding: "15px 26px", border: "none", cursor: phase ? "wait" : "pointer", background: phase ? BW.textDim : BW.accent, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, transition: "all 0.3s", opacity: (!url.trim() || phase) ? 0.5 : 1 }}>
            {phase ? "Auditing..." : "Run Audit"}
          </button>
        </div>

        {phase && (
          <div style={{ marginTop: 36, maxWidth: 360, margin: "36px auto 0" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 48, marginBottom: 20 }}>
              {PHASES.map((p, i) => (
                <div key={p.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: i <= phaseIdx ? 1 : 0.3, transition: "opacity 0.5s" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: i < phaseIdx ? BW.green : i === phaseIdx ? BW.accent : "rgba(56,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: i === phaseIdx ? `2px solid ${BW.accent}` : "2px solid transparent", animation: i === phaseIdx ? "pulse 1.5s infinite" : "none" }}>
                    {i < phaseIdx ? "✓" : p.icon}
                  </div>
                  <span style={{ fontSize: 11, color: i === phaseIdx ? BW.accent : BW.textMuted, fontWeight: 500 }}>{p.label}{i === phaseIdx ? dots : ""}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 3, background: "rgba(56,130,246,0.08)", borderRadius: 2 }}>
              <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${BW.accent}, ${BW.accentLight})`, width: `${((phaseIdx + 0.5) / PHASES.length) * 100}%`, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 24, padding: "14px 22px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 14, maxWidth: 540, margin: "24px auto 0" }}>{error}</div>
        )}
      </div>

      {report && (
        <div ref={reportRef} style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 80px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "16px 24px", marginBottom: 24, background: BW.accentGlow, border: `1px solid ${BW.border}`, borderRadius: 12 }}>
            <span style={{ fontSize: 14, color: BW.text }}>📄 Report ready — download to send to the client</span>
            <button onClick={handleDownload} disabled={pdfLoading} style={{ padding: "10px 24px", border: "none", borderRadius: 8, background: BW.accent, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {pdfLoading ? "Generating..." : "Download Report"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", marginBottom: 24, background: BW.surface, border: `1px solid ${BW.border}`, borderRadius: 16 }}>
            <div>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, margin: "0 0 4px 0", color: BW.text }}>{report.seo.business_name}</h2>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: BW.textMuted }}>{report.url}</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", border: `3px solid ${getScoreColor(report.seo.overall_score)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700, color: getScoreColor(report.seo.overall_score) }}>{getGrade(report.seo.overall_score)}</span>
                <span style={{ fontSize: 10, color: BW.textMuted }}>{report.seo.overall_score}/100</span>
              </div>
            </div>
          </div>

          <SectionCard title="Business Overview" icon="🏢" accent={`linear-gradient(90deg, ${BW.accent}, #818cf8)`}>
            <p style={{ fontSize: 14, color: BW.text, lineHeight: 1.7, margin: 0 }}>{report.seo.business_description}</p>
            <div style={{ display: "inline-block", marginTop: 12, padding: "6px 14px", background: BW.accentGlow, borderRadius: 20, fontFamily: "'DM Mono', monospace", fontSize: 12, color: BW.accentLight }}>Market: {report.seo.market}</div>
          </SectionCard>

          <SectionCard title="SEO Performance Scores" icon="📈" accent={`linear-gradient(90deg, ${BW.green}, #14b8a6)`}>
            <ScoreBar label="Technical SEO" score={report.seo.scores.technical_seo} color={getScoreColor(report.seo.scores.technical_seo)} />
            <ScoreBar label="Content Quality" score={report.seo.scores.content_quality} color={getScoreColor(report.seo.scores.content_quality)} />
            <ScoreBar label="On-Page SEO" score={report.seo.scores.on_page_seo} color={getScoreColor(report.seo.scores.on_page_seo)} />
            <ScoreBar label="Backlink Profile" score={report.seo.scores.backlink_profile} color={getScoreColor(report.seo.scores.backlink_profile)} />
            <ScoreBar label="Mobile & UX" score={report.seo.scores.mobile_ux} color={getScoreColor(report.seo.scores.mobile_ux)} />
            <ScoreBar label="Page Speed" score={report.seo.scores.page_speed} color={getScoreColor(report.seo.scores.page_speed)} />
          </SectionCard>

          <SectionCard title="Issues & Failures Found" icon="⚠️" accent={`linear-gradient(90deg, ${BW.red}, ${BW.yellow})`}>
            {report.seo.critical_issues.map((t, i) => <IssueItem key={`c${i}`} severity="critical" text={t} />)}
            {report.seo.warnings.map((t, i) => <IssueItem key={`w${i}`} severity="warning" text={t} />)}
            {report.seo.info_items.map((t, i) => <IssueItem key={`i${i}`} severity="info" text={t} />)}
          </SectionCard>

          <SectionCard title="Missing SEO Elements" icon="🚫" accent={`linear-gradient(90deg, #ec4899, ${BW.red})`}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {report.seo.missing_elements.map((el, i) => (
                <span key={i} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.15)", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#f9a8d4" }}>{el}</span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Why They Need Landing Page Funnels" icon="🚀" accent={`linear-gradient(90deg, ${BW.orange}, #eab308)`}>
            <div style={{ padding: "20px 24px", marginBottom: 20, background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,179,8,0.05))", borderRadius: 12, borderLeft: `4px solid ${BW.orange}` }}>
              <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontStyle: "italic", color: "#fed7aa", margin: 0, lineHeight: 1.5 }}>"{report.market.landing_page_pitch.headline}"</p>
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: BW.orange, margin: "20px 0 12px", letterSpacing: 1, textTransform: "uppercase" }}>Problems Landing Pages Solve</h4>
            {report.market.landing_page_pitch.problems_solved.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ color: BW.orange, fontSize: 16, lineHeight: 1.4 }}>→</span>
                <span style={{ fontSize: 14, color: BW.text, lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
            <h4 style={{ fontSize: 13, fontWeight: 600, color: BW.green, margin: "24px 0 12px", letterSpacing: 1, textTransform: "uppercase" }}>Expected Results</h4>
            {report.market.landing_page_pitch.expected_results.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ color: BW.green, fontSize: 16, lineHeight: 1.4 }}>✓</span>
                <span style={{ fontSize: 14, color: BW.text, lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
            <h4 style={{ fontSize: 13, fontWeight: 600, color: BW.accentLight, margin: "24px 0 12px", letterSpacing: 1, textTransform: "uppercase" }}>Recommended Funnel Types</h4>
            {report.market.landing_page_pitch.funnel_types.map((f, i) => (
              <div key={i} style={{ padding: "12px 16px", marginBottom: 8, background: BW.accentGlow, borderRadius: 10, border: `1px solid ${BW.border}`, fontSize: 14, color: BW.text, lineHeight: 1.5 }}>
                <span style={{ color: BW.accentLight, fontWeight: 600 }}>{i + 1}.</span> {f}
              </div>
            ))}
          </SectionCard>

          <SectionCard title="Additional Services & BAYWORX Solutions" icon="💡" accent={`linear-gradient(90deg, #06b6d4, ${BW.accent})`}>
            <p style={{ fontSize: 14, color: BW.textMuted, margin: "0 0 20px", lineHeight: 1.6 }}>{report.market.market_analysis}</p>
            {report.market.additional_services.map((svc, i) => (
              <div key={i} style={{ padding: "20px 24px", marginBottom: 16, background: "rgba(6,182,212,0.04)", borderRadius: 12, border: "1px solid rgba(6,182,212,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, color: BW.bg, background: "#06b6d4", padding: "2px 10px", borderRadius: 4 }}>{i + 1}</span>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: BW.text }}>{svc.service}</span>
                </div>
                <p style={{ fontSize: 14, color: BW.text, margin: "0 0 8px", lineHeight: 1.6, paddingLeft: 38 }}>{svc.description}</p>
                <div style={{ paddingLeft: 38, marginBottom: 12 }}>
                  <span style={{ display: "inline-block", padding: "4px 12px", background: "rgba(34,197,94,0.08)", borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#86efac" }}>Lead Impact: {svc.lead_impact}</span>
                </div>
                {svc.bayworx_solution && (
                  <div style={{ marginLeft: 38, padding: "14px 18px", background: BW.accentGlow, borderRadius: 10, borderLeft: `3px solid ${BW.accent}` }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600, color: BW.accent, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>How BAYWORX Delivers This</div>
                    <p style={{ fontSize: 13, color: BW.text, margin: 0, lineHeight: 1.6 }}>{svc.bayworx_solution}</p>
                  </div>
                )}
              </div>
            ))}
          </SectionCard>

          <div style={{ textAlign: "center", padding: "40px 32px", background: BW.accentGlow, borderRadius: 20, border: `1px solid ${BW.border}`, marginTop: 12 }}>
            <img src={BAYWORX_LOGO} alt="BAYWORX" style={{ height: 36, marginBottom: 20, objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, margin: "0 0 10px" }}>
              Ready to send this to <span style={{ color: BW.accent, fontStyle: "italic" }}>{report.seo.business_name}?</span>
            </h3>
            <p style={{ fontSize: 14, color: BW.textMuted, maxWidth: 420, margin: "0 auto 24px" }}>Download the branded report and send it to the prospect. Opens in any browser and prints beautifully.</p>
            <button onClick={handleDownload} style={{ padding: "14px 36px", border: "none", borderRadius: 10, background: BW.accent, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5 }}>
              📄  Download Client Report
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(56,130,246,0.3); } 50% { box-shadow: 0 0 0 8px rgba(56,130,246,0); } }
        input::placeholder { color: ${BW.textDim}; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
