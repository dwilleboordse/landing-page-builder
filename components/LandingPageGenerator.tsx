"use client";

import { useState, useRef } from "react";

const AWARENESS_LEVELS = [
  { id: "unaware", label: "Unaware", desc: "Don't know they have a problem", color: "#ef4444" },
  { id: "problem", label: "Problem Aware", desc: "Know the problem, not the solution", color: "#f97316" },
  { id: "solution", label: "Solution Aware", desc: "Know solutions exist, not yours", color: "#eab308" },
  { id: "product", label: "Product Aware", desc: "Know your product, need convincing", color: "#22c55e" },
  { id: "most", label: "Most Aware", desc: "Ready to buy, need the offer", color: "#3b82f6" },
];

const PAGE_TYPES = [
  { id: "advertorial", label: "Advertorial", icon: "📰", desc: "Story-driven editorial style" },
  { id: "listicle", label: "Listicle", icon: "📋", desc: "Top X / Best of format" },
  { id: "comparison", label: "Comparison", icon: "⚔️", desc: "Us vs them breakdown" },
];

const STYLE_MODES = [
  { id: "editorial", label: "Editorial", desc: "Native news/health site look" },
  { id: "branded", label: "Branded", desc: "Client colors, logo, fonts" },
];

const STRUCTURE_HINTS: Record<string, Record<string, string>> = {
  unaware: {
    advertorial: "Emotional hook → Story → Problem reveal → Agitate → Solution category → Bridge to product → Soft CTA",
    listicle: "Curiosity headline → Surprising facts → Problem education → Solution hints → Product as discovery → CTA",
    comparison: "Educational hook → Problem context → Method comparison → Winner reveal → Product intro → CTA",
  },
  problem: {
    advertorial: "Problem headline → Agitation → Cost of inaction → Solution category → Product as answer → Proof → CTA",
    listicle: "Problem-naming headline → Recap → Solutions ranked → Product wins → Proof → CTA",
    comparison: "Problem headline → Failed approaches → Why they fail → Product approach → Proof → CTA",
  },
  solution: {
    advertorial: "Mechanism headline → Why others fall short → Breakthrough → How it works → Product → Proof → CTA",
    listicle: "Comparison headline → Criteria → Ranked list → Product wins → Deep dive → Proof → CTA",
    comparison: "Versus headline → Criteria → Side-by-side → Where product wins → Social proof → CTA",
  },
  product: {
    advertorial: "Results headline → Proof stack → Specific results → Testimonials → Offer reveal → Urgency → CTA",
    listicle: "Results headline → Proof points → Testimonials → Cumulative impact → Offer → CTA",
    comparison: "Comparison headline → Feature matrix → Benefit comparison → Proof per claim → Offer → CTA",
  },
  most: {
    advertorial: "Offer headline → Value stack → Bonuses → Social proof → Urgency/scarcity → CTA → Risk reversal",
    listicle: "Offer headline → Value items → Mini-proof each → Total value → Price reveal → CTA",
    comparison: "Value headline → Alternative costs → Your offer → Savings math → Bonuses → CTA",
  },
};

interface Brief {
  brandName: string;
  productUrl: string;
  pageType: string;
  awareness: string;
  styleMode: string;
  brandPrimary: string;
  brandSecondary: string;
  brandAccent: string;
  brandLogo: string;
  coreOffer: string;
  targetAudience: string;
  winningAngles: string;
  competitorWeaknesses: string;
  proofElements: string;
  objections: string;
  additionalContext: string;
  uploadedContent: string;
  listicleCount: string;
  listiclePosition: string;
  compareAgainst: string;
}

interface HistoryItem {
  timestamp: string;
  brandName: string;
  pageType: string;
  awareness: string;
  html: string;
}

const defaultBrief: Brief = {
  brandName: "", productUrl: "", pageType: "advertorial", awareness: "problem",
  styleMode: "editorial", brandPrimary: "#1a1a2e", brandSecondary: "#ffffff",
  brandAccent: "#e63946", brandLogo: "", coreOffer: "", targetAudience: "",
  winningAngles: "", competitorWeaknesses: "", proofElements: "", objections: "",
  additionalContext: "", uploadedContent: "", listicleCount: "5",
  listiclePosition: "#1", compareAgainst: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", fontSize: 13, fontFamily: "inherit",
  border: "1px solid #1a1a1e", borderRadius: 8, background: "#111114",
  color: "#e0e0e0", outline: "none", transition: "border-color 0.15s",
};

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, color: "#888", marginBottom: 5, fontWeight: 500 }}>{children}</div>;
}

export default function LandingPageGenerator() {
  const [activeTab, setActiveTab] = useState("brief");
  const [brief, setBrief] = useState<Brief>(defaultBrief);
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateBrief = (key: keyof Brief, value: string) =>
    setBrief((prev) => ({ ...prev, [key]: value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      updateBrief("uploadedContent", text.slice(0, 15000));
      updateBrief(
        "additionalContext",
        (brief.additionalContext ? brief.additionalContext + "\n\n" : "") +
          `[Uploaded: ${file.name}]`
      );
    } catch {
      setError("Could not read file. Try pasting the content instead.");
    }
  };

  const handleGenerate = async () => {
    if (!brief.brandName && !brief.coreOffer) {
      setError("At minimum, provide a brand name and core offer.");
      return;
    }
    setIsGenerating(true);
    setError("");
    setGenProgress("Building page structure...");

    try {
      setGenProgress("Generating copy and layout...");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      const html = data.html;

      if (!html || (!html.includes("<!DOCTYPE") && !html.includes("<html"))) {
        throw new Error("Generation did not produce valid HTML. Try again.");
      }

      setGeneratedHTML(html);
      setHistory((prev) => [
        {
          timestamp: new Date().toLocaleString(),
          brandName: brief.brandName,
          pageType: brief.pageType,
          awareness: brief.awareness,
          html,
        },
        ...prev.slice(0, 19),
      ]);
      setActiveTab("preview");
      setGenProgress("");
    } catch (err: any) {
      setError(err.message || "Generation failed. Check your connection and try again.");
      setGenProgress("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (!generatedHTML) return;
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brief.brandName || "page"}-${brief.pageType}-${brief.awareness}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyHTML = () => {
    if (!generatedHTML) return;
    navigator.clipboard.writeText(generatedHTML).then(() => {
      setGenProgress("Copied to clipboard");
      setTimeout(() => setGenProgress(""), 2000);
    });
  };

  const emptyPreview = `<!DOCTYPE html><html><head><style>
    body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;color:#666;background:#fafaf8;}
    .e{text-align:center;padding:40px;} .e h2{font-size:20px;font-weight:400;margin-bottom:8px;color:#333;} .e p{font-size:14px;line-height:1.6;max-width:300px;}
  </style></head><body><div class="e"><h2>No page generated yet</h2><p>Fill out the brief and hit Generate to preview your landing page here.</p></div></body></html>`;

  const iframeContent = generatedHTML || emptyPreview;
  const briefComplete = !!(brief.brandName && brief.coreOffer && brief.targetAudience);

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: "#0a0a0b",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid #1a1a1e",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0d0d0f", flexShrink: 0, flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "linear-gradient(135deg, #e63946, #ff6b6b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
          }}>LP</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>Page Builder</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>Advertorials / Listicles / Comparisons</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {generatedHTML && (
            <>
              <button onClick={handleCopyHTML} style={{
                padding: "7px 14px", fontSize: 12, fontWeight: 500, border: "1px solid #2a2a2e",
                borderRadius: 6, background: "#141418", color: "#ccc", cursor: "pointer",
              }}>Copy HTML</button>
              <button onClick={handleExport} style={{
                padding: "7px 14px", fontSize: 12, fontWeight: 600, border: "none",
                borderRadius: 6, background: "#e63946", color: "#fff", cursor: "pointer",
              }}>Export .html</button>
            </>
          )}
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{
        display: "flex", borderBottom: "1px solid #1a1a1e", background: "#0d0d0f",
        padding: "0 24px", flexShrink: 0, overflowX: "auto",
      }}>
        {([
          { id: "brief", label: "Brief", badge: null },
          { id: "preview", label: "Preview", badge: generatedHTML ? "1" : null },
          { id: "history", label: "History", badge: history.length > 0 ? String(history.length) : null },
        ] as const).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "12px 20px", fontSize: 13,
            fontWeight: activeTab === tab.id ? 600 : 400,
            color: activeTab === tab.id ? "#fff" : "#666",
            background: "none", border: "none", cursor: "pointer",
            borderBottom: activeTab === tab.id ? "2px solid #e63946" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
          }}>
            {tab.label}
            {tab.badge && (
              <span style={{
                fontSize: 10, background: "#e63946", color: "#fff", borderRadius: 10,
                padding: "1px 6px", fontWeight: 600,
              }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>

        {/* ——— BRIEF TAB ——— */}
        {activeTab === "brief" && (
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
            {error && (
              <div style={{
                padding: "12px 16px", background: "#1c0a0a", border: "1px solid #3d1515",
                borderRadius: 8, color: "#f87171", fontSize: 13, marginBottom: 20,
              }}>{error}</div>
            )}

            {/* Page Type */}
            <Section title="Page Type">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {PAGE_TYPES.map((pt) => (
                  <button key={pt.id} onClick={() => updateBrief("pageType", pt.id)} style={{
                    flex: "1 1 180px", padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                    border: brief.pageType === pt.id ? "2px solid #e63946" : "2px solid #1a1a1e",
                    background: brief.pageType === pt.id ? "#1a0a0c" : "#111114",
                    textAlign: "left", transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>{pt.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: brief.pageType === pt.id ? "#fff" : "#aaa" }}>{pt.label}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{pt.desc}</div>
                  </button>
                ))}
              </div>
            </Section>

            {/* Awareness Level */}
            <Section title="Awareness Level" subtitle="Drives page structure automatically">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {AWARENESS_LEVELS.map((al) => (
                  <button key={al.id} onClick={() => updateBrief("awareness", al.id)} style={{
                    flex: "1 1 120px", padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                    border: brief.awareness === al.id ? `2px solid ${al.color}` : "2px solid #1a1a1e",
                    background: brief.awareness === al.id ? `${al.color}11` : "#111114",
                    textAlign: "left", transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: brief.awareness === al.id ? al.color : "#888" }}>{al.label}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{al.desc}</div>
                  </button>
                ))}
              </div>
              <div style={{
                marginTop: 12, padding: "12px 14px", background: "#111114", borderRadius: 8,
                border: "1px solid #1a1a1e", fontSize: 12, color: "#888", lineHeight: 1.6,
              }}>
                <span style={{ color: "#e63946", fontWeight: 600 }}>Structure: </span>
                {STRUCTURE_HINTS[brief.awareness]?.[brief.pageType] || "Select awareness and page type"}
              </div>
            </Section>

            {/* Style Mode */}
            <Section title="Styling">
              <div style={{ display: "flex", gap: 10 }}>
                {STYLE_MODES.map((sm) => (
                  <button key={sm.id} onClick={() => updateBrief("styleMode", sm.id)} style={{
                    flex: 1, padding: "12px 16px", borderRadius: 8, cursor: "pointer",
                    border: brief.styleMode === sm.id ? "2px solid #e63946" : "2px solid #1a1a1e",
                    background: brief.styleMode === sm.id ? "#1a0a0c" : "#111114",
                    textAlign: "left",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: brief.styleMode === sm.id ? "#fff" : "#aaa" }}>{sm.label}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{sm.desc}</div>
                  </button>
                ))}
              </div>
              {brief.styleMode === "branded" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                  {([
                    { key: "brandPrimary" as const, label: "Primary Color" },
                    { key: "brandSecondary" as const, label: "Secondary" },
                    { key: "brandAccent" as const, label: "Accent" },
                  ]).map((c) => (
                    <div key={c.key}>
                      <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4 }}>{c.label}</label>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="color" value={brief[c.key]} onChange={(e) => updateBrief(c.key, e.target.value)}
                          style={{ width: 32, height: 32, border: "none", borderRadius: 4, cursor: "pointer", background: "none" }} />
                        <input type="text" value={brief[c.key]} onChange={(e) => updateBrief(c.key, e.target.value)}
                          style={{ ...inputStyle, flex: 1, padding: "6px 8px", fontSize: 11 }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 4 }}>Logo URL (optional)</label>
                    <input type="text" value={brief.brandLogo} onChange={(e) => updateBrief("brandLogo", e.target.value)}
                      placeholder="https://brand.com/logo.png" style={inputStyle} />
                  </div>
                </div>
              )}
            </Section>

            {/* Core Info */}
            <Section title="Core Info">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <Label>Brand / Product Name *</Label>
                  <input type="text" value={brief.brandName} onChange={(e) => updateBrief("brandName", e.target.value)}
                    placeholder="e.g. GlowSkin Pro" style={inputStyle} />
                </div>
                <div>
                  <Label>Product URL</Label>
                  <input type="text" value={brief.productUrl} onChange={(e) => updateBrief("productUrl", e.target.value)}
                    placeholder="https://..." style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Label>Core Offer *</Label>
                <textarea value={brief.coreOffer} onChange={(e) => updateBrief("coreOffer", e.target.value)}
                  placeholder="What's the main offer? e.g. 'Get 2 bottles for the price of 1 + free shipping + 60-day guarantee'"
                  rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ marginTop: 12 }}>
                <Label>Target Audience *</Label>
                <textarea value={brief.targetAudience} onChange={(e) => updateBrief("targetAudience", e.target.value)}
                  placeholder="Be specific. e.g. 'Women 35-55 with hormonal acne who have tried prescription treatments and are frustrated with side effects'"
                  rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </Section>

            {/* Creative Intel */}
            <Section title="Creative Intel">
              <div>
                <Label>Winning Angles</Label>
                <textarea value={brief.winningAngles} onChange={(e) => updateBrief("winningAngles", e.target.value)}
                  placeholder="What angles have worked in ads? e.g. 'The dermatologist-secret angle performs best. Also: frustration with prescription side effects, the natural-but-actually-works angle'"
                  rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ marginTop: 12 }}>
                <Label>Competitor Weaknesses</Label>
                <textarea value={brief.competitorWeaknesses} onChange={(e) => updateBrief("competitorWeaknesses", e.target.value)}
                  placeholder="Where do competitors fall short? e.g. 'Most competitors use harsh chemicals, take 12+ weeks to work, don't address root cause'"
                  rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ marginTop: 12 }}>
                <Label>Proof Elements</Label>
                <textarea value={brief.proofElements} onChange={(e) => updateBrief("proofElements", e.target.value)}
                  placeholder="Testimonials, stats, press mentions, clinical data. e.g. '4.8 stars from 2,300+ reviews. Featured in Allure. 94% saw results in 4 weeks.'"
                  rows={4} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ marginTop: 12 }}>
                <Label>Objections to Overcome</Label>
                <textarea value={brief.objections} onChange={(e) => updateBrief("objections", e.target.value)}
                  placeholder="What stops people from buying? e.g. 'Price seems high, skeptical of natural products, worried it won't work for their skin type'"
                  rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </Section>

            {/* Conditional: Listicle */}
            {brief.pageType === "listicle" && (
              <Section title="Listicle Settings">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label>Number of Items</Label>
                    <input type="text" value={brief.listicleCount} onChange={(e) => updateBrief("listicleCount", e.target.value)}
                      placeholder="5" style={inputStyle} />
                  </div>
                  <div>
                    <Label>Product Position</Label>
                    <input type="text" value={brief.listiclePosition} onChange={(e) => updateBrief("listiclePosition", e.target.value)}
                      placeholder="#1" style={inputStyle} />
                  </div>
                </div>
              </Section>
            )}

            {/* Conditional: Comparison */}
            {brief.pageType === "comparison" && (
              <Section title="Comparison Settings">
                <Label>Compare Against</Label>
                <textarea value={brief.compareAgainst} onChange={(e) => updateBrief("compareAgainst", e.target.value)}
                  placeholder="Which specific competitors or alternatives? e.g. 'Proactiv, CeraVe, Curology, prescription retinoids'"
                  rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </Section>
            )}

            {/* Upload + Context */}
            <Section title="Additional Context">
              <div style={{ marginBottom: 12 }}>
                <Label>Upload Product Docs / Briefs</Label>
                <div onClick={() => fileInputRef.current?.click()} style={{
                  padding: "20px", borderRadius: 8, border: "2px dashed #1a1a1e",
                  background: "#111114", textAlign: "center", cursor: "pointer",
                }}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {brief.uploadedContent ? "File uploaded — click to replace" : "Click to upload .txt, .csv, or paste content below"}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept=".txt,.csv,.md,.json" onChange={handleFileUpload} style={{ display: "none" }} />
              </div>
              <div>
                <Label>Extra Context / Notes</Label>
                <textarea value={brief.additionalContext} onChange={(e) => updateBrief("additionalContext", e.target.value)}
                  placeholder="Anything else — brand voice notes, specific phrases to use, things to avoid, etc."
                  rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </Section>

            {/* Generate */}
            <div style={{ marginTop: 32, marginBottom: 40 }}>
              <button onClick={handleGenerate} disabled={isGenerating || !briefComplete} style={{
                width: "100%", padding: "16px", fontSize: 15, fontWeight: 700,
                border: "none", borderRadius: 10,
                cursor: briefComplete && !isGenerating ? "pointer" : "not-allowed",
                background: briefComplete && !isGenerating
                  ? "linear-gradient(135deg, #e63946, #ff6b6b)"
                  : "#1a1a1e",
                color: briefComplete && !isGenerating ? "#fff" : "#555",
                transition: "all 0.2s", letterSpacing: "-0.01em",
              }}>
                {isGenerating ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{
                      width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "spin 0.7s linear infinite", display: "inline-block",
                    }} />
                    {genProgress}
                  </span>
                ) : "Generate Landing Page"}
              </button>
              {!briefComplete && (
                <div style={{ textAlign: "center", fontSize: 11, color: "#555", marginTop: 8 }}>
                  Fill in brand name, core offer, and target audience to generate
                </div>
              )}
            </div>
          </div>
        )}

        {/* ——— PREVIEW TAB ——— */}
        {activeTab === "preview" && (
          <div style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
            <div style={{
              padding: "10px 24px", borderBottom: "1px solid #1a1a1e",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#0d0d0f", flexShrink: 0, flexWrap: "wrap", gap: 8,
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {(["desktop", "tablet", "mobile"] as const).map((mode) => (
                  <button key={mode} onClick={() => setPreviewMode(mode)} style={{
                    padding: "6px 14px", fontSize: 11, fontWeight: 500,
                    border: "1px solid #1a1a1e", borderRadius: 6, cursor: "pointer",
                    background: previewMode === mode ? "#1a1a1e" : "transparent",
                    color: previewMode === mode ? "#fff" : "#666",
                  }}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              {genProgress && <div style={{ fontSize: 11, color: "#22c55e" }}>{genProgress}</div>}
            </div>
            <div style={{
              flex: 1, display: "flex", justifyContent: "center",
              padding: 20, background: "#18181b", overflow: "auto",
            }}>
              <div style={{
                width: previewMode === "desktop" ? "100%" : previewMode === "tablet" ? 768 : 390,
                maxWidth: "100%", height: "100%", borderRadius: 8, overflow: "hidden",
                border: "1px solid #2a2a2e", background: "#fff",
                transition: "width 0.3s ease",
              }}>
                <iframe ref={iframeRef} srcDoc={iframeContent} title="Preview"
                  style={{ width: "100%", height: "100%", border: "none" }}
                  sandbox="allow-scripts allow-same-origin" />
              </div>
            </div>
          </div>
        )}

        {/* ——— HISTORY TAB ——— */}
        {activeTab === "history" && (
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#555", fontSize: 14 }}>
                No pages generated yet. History appears here.
              </div>
            ) : (
              history.map((item, i) => (
                <div key={i} onClick={() => { setGeneratedHTML(item.html); setActiveTab("preview"); }}
                  style={{
                    padding: "16px", marginBottom: 10, borderRadius: 8, cursor: "pointer",
                    border: "1px solid #1a1a1e", background: "#111114",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a2e")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a1e")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{item.brandName || "Untitled"}</div>
                      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                        {item.pageType} / {item.awareness} aware
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#555" }}>{item.timestamp}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
