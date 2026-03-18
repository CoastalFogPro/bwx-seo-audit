import { useState, useRef, useEffect } from "react";
import "./App.css";

const BAYWORX_LOGO = "https://www.bayworx.com/assets/bayworx.png";
const PHASES = [
  { key: "analyze", label: "Researching & Analyzing", icon: "🔍" },
  { key: "report", label: "Generating Report", icon: "📊" },
];

// ─── Helpers ────────────────────
const getScoreHex = (s) => s >= 70 ? "#22c55e" : s >= 50 ? "#eab308" : "#ef4444";
const getGrade = (s) => s >= 90 ? "A+" : s >= 80 ? "A" : s >= 70 ? "B" : s >= 55 ? "C" : s >= 40 ? "D" : "F";
const normalizeUrl = (input) => { let u = input.trim(); if (!/^https?:\/\//i.test(u)) u = "https://" + u; return u; };

// ─── Score Ring Component ────────────────
const ScoreRing = ({ score, size = 84, stroke = 4 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);
  const color = getScoreHex(score);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg className="score-ring__svg" width={size} height={size}>
        <circle className="score-ring__track" cx={size / 2} cy={size / 2} r={radius} />
        <circle className="score-ring__fill" cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="score-ring__content">
        <span className="score-ring__grade" style={{ color }}>{getGrade(score)}</span>
        <span className="score-ring__value">{score}/100</span>
      </div>
    </div>
  );
};

// ─── Score Tile (Bento Grid) ────────────────
const ScoreTile = ({ label, score, delay = 0 }) => {
  const color = getScoreHex(score);
  return (
    <div className="score-tile stagger-item" style={{ animationDelay: `${delay}ms` }}>
      <div className="score-tile__label">{label}</div>
      <div className="score-tile__value" style={{ color }}>{score}</div>
      <div className="score-tile__bar">
        <div className="score-tile__bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
};

// ─── Section Card ────────────────
const SectionCard = ({ title, icon, iconBg, accentGradient, children, delay = 0 }) => (
  <div className="section-card stagger-item" style={{ animationDelay: `${delay}ms` }}>
    <div className="section-card__accent" style={{ background: accentGradient }} />
    <h3 className="section-card__title">
      <span className="section-card__icon" style={{ background: iconBg || "rgba(59,130,246,0.1)" }}>{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

// ─── Issue Item ────────────────
const IssueItem = ({ severity, text }) => (
  <div className="issue-item">
    <span className={`issue-badge issue-badge--${severity}`}>
      {severity === "critical" ? "CRITICAL" : severity === "warning" ? "WARNING" : "INFO"}
    </span>
    <span className="issue-text">{text}</span>
  </div>
);

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

  const callClaude = async (systemPrompt, userPrompt) => {
    const body = {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    };
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      const err = data.error;
      const msg = typeof err === "string" ? err : `${err?.type || "error"}: ${err?.message || `API error (${res.status})`}`;
      throw new Error(msg);
    }
    if (!data.content || !Array.isArray(data.content)) {
      throw new Error("Unexpected API response format");
    }
    return data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
  };

  const extractJSON = (text) => {
    let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    try { return JSON.parse(cleaned); } catch { /* */ }
    const f = cleaned.indexOf("{"), l = cleaned.lastIndexOf("}");
    if (f !== -1 && l > f) { try { return JSON.parse(cleaned.slice(f, l + 1)); } catch { /* */ } }
    return null;
  };

  const runAudit = async () => {
    if (!url.trim()) return;
    setError(null); setReport(null);
    const targetUrl = normalizeUrl(url);
    try {
      setPhase("analyze"); setPhaseIdx(0);

      const raw = await callClaude(
        `You are an SEO auditor and digital marketing strategist for BAYWORX LLC (Managed IT, Custom Dev, Integration, Automation, Cloud, SEO/Landing Pages — 20+ years experience).

Analyze the given URL. Return ONLY a JSON object with this exact schema — no other text:
{"seo":{"business_name":"string","business_description":"1-2 sentences","market":"industry","scores":{"technical_seo":0,"content_quality":0,"on_page_seo":0,"backlink_profile":0,"mobile_ux":0,"page_speed":0},"overall_score":0,"critical_issues":["3 items"],"warnings":["3 items"],"info_items":["2 items"],"missing_elements":["3-4 items"],"competitors":["3 items"]},"market":{"market_analysis":"2-3 sentences","landing_page_pitch":{"headline":"one-liner","problems_solved":["4 items"],"expected_results":["3 items"],"funnel_types":["3 items"]},"additional_services":[{"service":"name","description":"1 sentence","lead_impact":"short","bayworx_solution":"1-2 sentences on how BAYWORX delivers this"}]}}

Scoring: 70-89=Good, 50-69=Needs Work, below 50=Poor. Typical business sites score 55-75. Provide exactly 4 additional_services.`,
        `Full SEO audit and market analysis for: ${targetUrl}`);

      setPhase("report"); setPhaseIdx(1);

      const result = extractJSON(raw);
      if (!result || !result.seo?.scores) throw new Error("Analysis failed to parse. Please try again.");

      const seoData = result.seo;
      seoData.critical_issues = seoData.critical_issues || ["No data"];
      seoData.warnings = seoData.warnings || ["No data"];
      seoData.info_items = seoData.info_items || ["No data"];
      seoData.missing_elements = seoData.missing_elements || ["Unknown"];
      seoData.competitors = seoData.competitors || ["Unknown"];
      seoData.business_name = seoData.business_name || targetUrl;
      seoData.business_description = seoData.business_description || "Description unavailable.";
      seoData.market = seoData.market || "General";
      seoData.overall_score = seoData.overall_score || Math.round(Object.values(seoData.scores).reduce((a, b) => a + b, 0) / 6);

      const marketInfo = result.market;
      if (!marketInfo || !marketInfo.landing_page_pitch) throw new Error("Market analysis failed to parse. Please try again.");
      marketInfo.market_analysis = marketInfo.market_analysis || "Analysis unavailable.";
      marketInfo.additional_services = marketInfo.additional_services || [];
      marketInfo.landing_page_pitch.problems_solved = marketInfo.landing_page_pitch.problems_solved || [];
      marketInfo.landing_page_pitch.expected_results = marketInfo.landing_page_pitch.expected_results || [];
      marketInfo.landing_page_pitch.funnel_types = marketInfo.landing_page_pitch.funnel_types || [];

      await new Promise(r => setTimeout(r, 300));
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

  const scores = report ? [
    { label: "Technical SEO", score: report.seo.scores.technical_seo },
    { label: "Content Quality", score: report.seo.scores.content_quality },
    { label: "On-Page SEO", score: report.seo.scores.on_page_seo },
    { label: "Backlink Profile", score: report.seo.scores.backlink_profile },
    { label: "Mobile & UX", score: report.seo.scores.mobile_ux },
    { label: "Page Speed", score: report.seo.scores.page_speed },
  ] : [];

  return (
    <>
      {/* Ambient background */}
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb--blue" />
        <div className="ambient-orb--purple ambient-orb" />
        <div className="ambient-orb--cyan ambient-orb" />
      </div>
      <div className="noise-overlay" />

      <div className="app-shell">
        {/* ─── Header ─── */}
        <header className="header">
          <div>
            <img src={BAYWORX_LOGO} alt="BAYWORX" className="header__logo"
              onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
            <span className="header__logo-fallback">BAYWORX</span>
          </div>

          <div className="header__badge">
            <span className="header__badge-dot" />
            Internal SEO Intelligence
          </div>

          <h1 className="header__title">
            Client SEO <em>Audit</em>
          </h1>

          <p className="header__subtitle">
            Enter a prospect's URL to generate a comprehensive SEO audit with actionable upsell opportunities.
          </p>

          {/* Search bar */}
          <div className="search-bar">
            <span className="search-bar__prefix">https://</span>
            <input
              className="search-bar__input"
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !phase && runAudit()}
              placeholder="clientwebsite.com"
              disabled={!!phase}
            />
            <button
              className={`search-bar__btn ${phase ? "search-bar__btn--loading" : ""}`}
              onClick={runAudit}
              disabled={!!phase || !url.trim()}
            >
              {phase ? "Auditing..." : "Run Audit"}
            </button>
          </div>

          {/* Loading */}
          {phase && (
            <div className="loading-section">
              <div className="loading-phases">
                {PHASES.map((p, i) => (
                  <div key={p.key} className={`loading-phase ${i > phaseIdx ? "loading-phase--inactive" : ""}`}>
                    <div className={`loading-phase__icon ${i < phaseIdx ? "loading-phase__icon--done" : i === phaseIdx ? "loading-phase__icon--active" : "loading-phase__icon--pending"}`}>
                      {i < phaseIdx ? "✓" : p.icon}
                    </div>
                    <span className={`loading-phase__label ${i === phaseIdx ? "loading-phase__label--active" : ""}`}>
                      {p.label}{i === phaseIdx ? dots : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="loading-track">
                <div className="loading-track__fill" style={{ width: `${((phaseIdx + 0.5) / PHASES.length) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && <div className="error-banner">{error}</div>}
        </header>

        {/* ─── Report ─── */}
        {report && (
          <div ref={reportRef} className="report">
            {/* Download banner */}
            <div className="download-banner stagger-item">
              <span className="download-banner__text">
                Report ready <span>— download the branded version for your client</span>
              </span>
              <button className="btn btn--primary" onClick={handleDownload} disabled={pdfLoading}>
                {pdfLoading ? "Generating..." : "Download Report"}
              </button>
            </div>

            {/* Report header with score ring */}
            <div className="report-header stagger-item" style={{ animationDelay: "50ms" }}>
              <div className="report-header__info">
                <h2>{report.seo.business_name}</h2>
                <span className="report-header__url">{report.url}</span>
              </div>
              <ScoreRing score={report.seo.overall_score} />
            </div>

            {/* Business Overview */}
            <SectionCard title="Business Overview" icon="🏢" iconBg="rgba(99,102,241,0.1)" accentGradient="linear-gradient(90deg, #6366f1, #818cf8)" delay={100}>
              <p className="overview-text">{report.seo.business_description}</p>
              <span className="overview-market">Market: {report.seo.market}</span>
            </SectionCard>

            {/* Score Grid */}
            <SectionCard title="SEO Performance" icon="📈" iconBg="rgba(34,197,94,0.1)" accentGradient="linear-gradient(90deg, #22c55e, #14b8a6)" delay={150}>
              <div className="score-grid">
                {scores.map((s, i) => (
                  <ScoreTile key={s.label} label={s.label} score={s.score} delay={200 + i * 60} />
                ))}
              </div>
            </SectionCard>

            {/* Issues */}
            <SectionCard title="Issues Found" icon="⚠️" iconBg="rgba(239,68,68,0.1)" accentGradient="linear-gradient(90deg, #ef4444, #eab308)" delay={200}>
              {report.seo.critical_issues.map((t, i) => <IssueItem key={`c${i}`} severity="critical" text={t} />)}
              {report.seo.warnings.map((t, i) => <IssueItem key={`w${i}`} severity="warning" text={t} />)}
              {report.seo.info_items.map((t, i) => <IssueItem key={`i${i}`} severity="info" text={t} />)}
            </SectionCard>

            {/* Missing Elements */}
            <SectionCard title="Missing SEO Elements" icon="🚫" iconBg="rgba(236,72,153,0.1)" accentGradient="linear-gradient(90deg, #ec4899, #ef4444)" delay={250}>
              <div className="tag-grid">
                {report.seo.missing_elements.map((el, i) => (
                  <span key={i} className="tag tag--pink">{el}</span>
                ))}
              </div>
            </SectionCard>

            {/* Landing Page Pitch */}
            <SectionCard title="Why They Need Landing Pages" icon="🚀" iconBg="rgba(249,115,22,0.1)" accentGradient="linear-gradient(90deg, #f97316, #eab308)" delay={300}>
              <div className="pitch-quote">
                <p className="pitch-quote__text">"{report.market.landing_page_pitch.headline}"</p>
              </div>

              <div className="pitch-heading" style={{ color: "var(--orange)" }}>Problems Landing Pages Solve</div>
              {report.market.landing_page_pitch.problems_solved.map((p, i) => (
                <div key={i} className="pitch-item">
                  <span className="pitch-item__icon" style={{ color: "var(--orange)" }}>{"→"}</span>
                  <span className="pitch-item__text">{p}</span>
                </div>
              ))}

              <div className="pitch-heading" style={{ color: "var(--green)" }}>Expected Results</div>
              {report.market.landing_page_pitch.expected_results.map((r, i) => (
                <div key={i} className="pitch-item">
                  <span className="pitch-item__icon" style={{ color: "var(--green)" }}>{"✓"}</span>
                  <span className="pitch-item__text">{r}</span>
                </div>
              ))}

              <div className="pitch-heading" style={{ color: "var(--accent-light)" }}>Recommended Funnels</div>
              {report.market.landing_page_pitch.funnel_types.map((f, i) => (
                <div key={i} className="funnel-card">
                  <span className="funnel-card__number">{i + 1}.</span>{f}
                </div>
              ))}
            </SectionCard>

            {/* Additional Services */}
            <SectionCard title="Services & BAYWORX Solutions" icon="💡" iconBg="rgba(6,182,212,0.1)" accentGradient="linear-gradient(90deg, #06b6d4, #3b82f6)" delay={350}>
              <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 20px", lineHeight: 1.65 }}>{report.market.market_analysis}</p>
              {report.market.additional_services.map((svc, i) => (
                <div key={i} className="service-card">
                  <div className="service-card__header">
                    <span className="service-card__number">{i + 1}</span>
                    <span className="service-card__name">{svc.service}</span>
                  </div>
                  <p className="service-card__desc">{svc.description}</p>
                  <div><span className="service-card__impact">Lead Impact: {svc.lead_impact}</span></div>
                  {svc.bayworx_solution && (
                    <div className="service-card__solution">
                      <div className="service-card__solution-label">How BAYWORX Delivers This</div>
                      <p className="service-card__solution-text">{svc.bayworx_solution}</p>
                    </div>
                  )}
                </div>
              ))}
            </SectionCard>

            {/* CTA Footer */}
            <div className="cta-footer stagger-item" style={{ animationDelay: "400ms" }}>
              <img src={BAYWORX_LOGO} alt="BAYWORX" className="cta-footer__logo"
                onError={(e) => { e.target.style.display = "none"; }} />
              <h3 className="cta-footer__title">
                Ready to send this to <em>{report.seo.business_name}?</em>
              </h3>
              <p className="cta-footer__sub">
                Download the branded report and send it to the prospect. Opens in any browser and prints beautifully.
              </p>
              <button className="cta-footer__btn" onClick={handleDownload}>
                Download Client Report
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
