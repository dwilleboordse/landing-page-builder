"use client";

import { useState, useRef, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface ClientProfile {
  id: string;
  brandName: string;
  productUrl: string;
  targetAudience: string;
  coreOffer: string;
  winningAngles: string;
  competitorWeaknesses: string;
  proofElements: string;
  objections: string;
  knowledgeBase: string;
  styleMode: "editorial" | "branded";
  brandPrimary: string;
  brandSecondary: string;
  brandAccent: string;
  brandLogo: string;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  clientId: string;
  brandName: string;
  pageType: string;
  awareness: string;
  instruction: string;
  html: string;
  timestamp: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const AWARENESS_LEVELS = [
  { id: "unaware", label: "Unaware", short: "Don't know they have a problem", color: "#ef4444" },
  { id: "problem", label: "Problem", short: "Know the pain, not the fix", color: "#f97316" },
  { id: "solution", label: "Solution", short: "Know fixes exist, not yours", color: "#eab308" },
  { id: "product", label: "Product", short: "Know you, need proof", color: "#22c55e" },
  { id: "most", label: "Most", short: "Ready — just need the offer", color: "#3b82f6" },
];

const PAGE_TYPES = [
  { id: "advertorial", label: "Advertorial", icon: "📰" },
  { id: "listicle", label: "Listicle", icon: "📋" },
  { id: "comparison", label: "Comparison", icon: "⚔️" },
];

const QUICK_TEMPLATES = [
  "Write from the dermatologist-secret angle",
  "Lead with a customer transformation story",
  "Compare us to top 3 competitors",
  "Focus on the frustration with current solutions",
  "Use the too-good-to-be-true hook then prove it",
  "Target the skeptic who's tried everything",
  "Lead with the clinical study data",
  "Write for someone who just saw our ad for the first time",
];

// ── Helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadClients(): ClientProfile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("lp_clients") || "[]");
  } catch { return []; }
}

function saveClients(clients: ClientProfile[]) {
  localStorage.setItem("lp_clients", JSON.stringify(clients));
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("lp_history") || "[]");
  } catch { return []; }
}

function saveHistory(history: HistoryItem[]) {
  localStorage.setItem("lp_history", JSON.stringify(history.slice(0, 50)));
}

const emptyClient = (): ClientProfile => ({
  id: uid(), brandName: "", productUrl: "", targetAudience: "", coreOffer: "",
  winningAngles: "", competitorWeaknesses: "", proofElements: "", objections: "",
  knowledgeBase: "", styleMode: "editorial", brandPrimary: "#1a1a2e",
  brandSecondary: "#ffffff", brandAccent: "#e63946", brandLogo: "",
  createdAt: new Date().toISOString(),
});

// ── Styles ─────────────────────────────────────────────────────────────────

const inputS: React.CSSProperties = {
  width: "100%", padding: "9px 12px", fontSize: 13, fontFamily: "inherit",
  border: "1px solid #1e1e24", borderRadius: 7, background: "#111116",
  color: "#e0e0e0", outline: "none", transition: "border-color 0.15s",
};

const textareaS: React.CSSProperties = { ...inputS, resize: "vertical" as const };

const pill = (active: boolean, color?: string): React.CSSProperties => ({
  padding: "8px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600,
  border: active ? `2px solid ${color || "#e63946"}` : "2px solid #1e1e24",
  background: active ? `${color || "#e63946"}11` : "#111116",
  color: active ? (color || "#e63946") : "#777", transition: "all 0.15s",
  textAlign: "left" as const,
});

// ── Component ──────────────────────────────────────────────────────────────

export default function LandingPageGenerator() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [view, setView] = useState<"generate" | "client-edit" | "preview" | "history">("generate");
  const [editClient, setEditClient] = useState<ClientProfile | null>(null);

  const [pageType, setPageType] = useState("advertorial");
  const [awareness, setAwareness] = useState("problem");
  const [instruction, setInstruction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const [previewHTML, setPreviewHTML] = useState("");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [toastMsg, setToastMsg] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setClients(loadClients());
    setHistory(loadHistory());
  }, []);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  // ── Client CRUD ──

  const handleSaveClient = (c: ClientProfile) => {
    const exists = clients.find((x) => x.id === c.id);
    let updated: ClientProfile[];
    if (exists) {
      updated = clients.map((x) => (x.id === c.id ? c : x));
    } else {
      updated = [c, ...clients];
    }
    setClients(updated);
    saveClients(updated);
    setSelectedClientId(c.id);
    setEditClient(null);
    setView("generate");
    toast("Client saved");
  };

  const handleDeleteClient = (id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    saveClients(updated);
    if (selectedClientId === id) setSelectedClientId(updated[0]?.id || null);
    toast("Client removed");
  };

  // ── Generate ──

  const handleGenerate = async () => {
    if (!selectedClient) { setError("Select or create a client first."); return; }
    setIsGenerating(true);
    setError("");
    setProgress("Generating page...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: selectedClient.brandName,
          productUrl: selectedClient.productUrl,
          targetAudience: selectedClient.targetAudience,
          coreOffer: selectedClient.coreOffer,
          winningAngles: selectedClient.winningAngles,
          competitorWeaknesses: selectedClient.competitorWeaknesses,
          proofElements: selectedClient.proofElements,
          objections: selectedClient.objections,
          knowledgeBase: selectedClient.knowledgeBase,
          styleMode: selectedClient.styleMode,
          brandPrimary: selectedClient.brandPrimary,
          brandSecondary: selectedClient.brandSecondary,
          brandAccent: selectedClient.brandAccent,
          brandLogo: selectedClient.brandLogo,
          pageType,
          awareness,
          instruction,
        }),
      });

      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch {
        throw new Error(text.length < 200 ? text : "Server returned an invalid response.");
      }
      if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
      if (!data.html) throw new Error("Empty response. Try again.");

      setPreviewHTML(data.html);

      const item: HistoryItem = {
        id: uid(), clientId: selectedClient.id, brandName: selectedClient.brandName,
        pageType, awareness, instruction, html: data.html,
        timestamp: new Date().toLocaleString(),
      };
      const newHistory = [item, ...history].slice(0, 50);
      setHistory(newHistory);
      saveHistory(newHistory);
      setView("preview");
      setProgress("");
    } catch (err: any) {
      setError(err.message || "Generation failed.");
      setProgress("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (!previewHTML) return;
    const blob = new Blob([previewHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedClient?.brandName || "page"}-${pageType}-${awareness}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!previewHTML) return;
    navigator.clipboard.writeText(previewHTML).then(() => toast("HTML copied"));
  };

  const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2000); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editClient) return;
    try {
      const text = await file.text();
      setEditClient({
        ...editClient,
        knowledgeBase: (editClient.knowledgeBase ? editClient.knowledgeBase + "\n\n---\n\n" : "") +
          `[${file.name}]\n${text.slice(0, 20000)}`,
      });
    } catch { setError("Could not read file."); }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", height: "100vh", background: "#09090b", color: "#e0e0e0", fontFamily: "'Söhne','Helvetica Neue',system-ui,sans-serif" }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: 260, flexShrink: 0, borderRight: "1px solid #1a1a1e", background: "#0c0c0f",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #1a1a1e", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg,#e63946,#ff6b6b)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff",
          }}>LP</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Page Builder</div>
        </div>

        <div style={{ padding: "12px 14px" }}>
          <button onClick={() => { setEditClient(emptyClient()); setView("client-edit"); }} style={{
            width: "100%", padding: "9px", fontSize: 12, fontWeight: 600, border: "1px dashed #2a2a30",
            borderRadius: 7, background: "transparent", color: "#888", cursor: "pointer",
          }}>+ New Client</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "0 10px 10px" }}>
          {clients.length === 0 && (
            <div style={{ padding: "20px 8px", fontSize: 12, color: "#444", lineHeight: 1.6, textAlign: "center" }}>
              No clients yet.
            </div>
          )}
          {clients.map((c) => (
            <div key={c.id} onClick={() => { setSelectedClientId(c.id); setView("generate"); }}
              style={{
                padding: "10px 12px", marginBottom: 4, borderRadius: 7, cursor: "pointer",
                background: selectedClientId === c.id ? "#161619" : "transparent",
                border: selectedClientId === c.id ? "1px solid #1e1e24" : "1px solid transparent",
                transition: "all 0.12s",
              }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: selectedClientId === c.id ? "#fff" : "#aaa" }}>
                {c.brandName || "Untitled"}
              </div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                {c.targetAudience?.slice(0, 60) || "No audience set"}
                {(c.targetAudience?.length || 0) > 60 ? "..." : ""}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #1a1a1e", padding: "8px 10px", display: "flex", gap: 4 }}>
          <button onClick={() => setView("generate")} style={{
            flex: 1, padding: "8px", fontSize: 11, fontWeight: 500, border: "none", borderRadius: 6,
            background: view === "generate" ? "#1a1a1e" : "transparent",
            color: view === "generate" ? "#fff" : "#555", cursor: "pointer",
          }}>Generate</button>
          <button onClick={() => setView("history")} style={{
            flex: 1, padding: "8px", fontSize: 11, fontWeight: 500, border: "none", borderRadius: 6,
            background: view === "history" ? "#1a1a1e" : "transparent",
            color: view === "history" ? "#fff" : "#555", cursor: "pointer",
          }}>History</button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {toastMsg && (
          <div style={{
            position: "fixed", top: 16, right: 16, padding: "8px 16px", borderRadius: 7,
            background: "#22c55e", color: "#fff", fontSize: 12, fontWeight: 600, zIndex: 999,
            animation: "fadeIn 0.2s ease",
          }}>{toastMsg}</div>
        )}

        {/* ═══ GENERATE ═══ */}
        {view === "generate" && (
          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 24px" }}>

              {!selectedClient ? (
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Select a client to start</div>
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>Create a client profile first. You only do this once per brand.</div>
                  <button onClick={() => { setEditClient(emptyClient()); setView("client-edit"); }} style={{
                    padding: "10px 24px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 8,
                    background: "#e63946", color: "#fff", cursor: "pointer",
                  }}>Create First Client</button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
                        {selectedClient.brandName}
                      </div>
                      <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                        {selectedClient.styleMode === "branded" ? "Branded" : "Editorial"} style
                      </div>
                    </div>
                    <button onClick={() => { setEditClient({ ...selectedClient }); setView("client-edit"); }} style={{
                      padding: "6px 14px", fontSize: 11, fontWeight: 500, border: "1px solid #1e1e24",
                      borderRadius: 6, background: "transparent", color: "#888", cursor: "pointer",
                    }}>Edit Client</button>
                  </div>

                  {error && (
                    <div style={{
                      padding: "10px 14px", background: "#1c0a0a", border: "1px solid #3d1515",
                      borderRadius: 7, color: "#f87171", fontSize: 12, marginBottom: 20,
                    }}>{error}</div>
                  )}

                  {/* Page Type */}
                  <div style={{ marginBottom: 22 }}>
                    <SectionLabel>Page Type</SectionLabel>
                    <div style={{ display: "flex", gap: 8 }}>
                      {PAGE_TYPES.map((pt) => (
                        <button key={pt.id} onClick={() => setPageType(pt.id)} style={{
                          ...pill(pageType === pt.id), flex: 1, display: "flex", alignItems: "center", gap: 8,
                        }}>
                          <span style={{ fontSize: 16 }}>{pt.icon}</span>
                          <span>{pt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Awareness */}
                  <div style={{ marginBottom: 22 }}>
                    <SectionLabel>Awareness Level</SectionLabel>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {AWARENESS_LEVELS.map((al) => (
                        <button key={al.id} onClick={() => setAwareness(al.id)}
                          style={{ ...pill(awareness === al.id, al.color), flex: "1 1 100px" }}>
                          <div>{al.label}</div>
                          <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>{al.short}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instruction */}
                  <div style={{ marginBottom: 16 }}>
                    <SectionLabel>Instructions (optional)</SectionLabel>
                    <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)}
                      placeholder="e.g. 'Lead with the clinical study angle, compare us to CeraVe, target the skeptic who's tried everything'"
                      rows={3} style={textareaS} />
                  </div>

                  {/* Quick templates */}
                  <div style={{ marginBottom: 28, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {QUICK_TEMPLATES.map((t, i) => (
                      <button key={i} onClick={() => setInstruction(t)} style={{
                        padding: "5px 10px", fontSize: 11, border: "1px solid #1e1e24", borderRadius: 20,
                        background: instruction === t ? "#1a1a1e" : "transparent",
                        color: instruction === t ? "#fff" : "#555", cursor: "pointer",
                        transition: "all 0.12s",
                      }}>{t}</button>
                    ))}
                  </div>

                  {/* Generate */}
                  <button onClick={handleGenerate} disabled={isGenerating} style={{
                    width: "100%", padding: "15px", fontSize: 15, fontWeight: 700, border: "none",
                    borderRadius: 10, cursor: isGenerating ? "not-allowed" : "pointer",
                    background: isGenerating ? "#1a1a1e" : "linear-gradient(135deg,#e63946,#ff6b6b)",
                    color: isGenerating ? "#555" : "#fff", transition: "all 0.2s",
                  }}>
                    {isGenerating ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <span style={{
                          width: 15, height: 15, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff",
                          borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block",
                        }} />
                        {progress}
                      </span>
                    ) : "Generate Page"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══ CLIENT EDIT ═══ */}
        {view === "client-edit" && editClient && (
          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
                  {clients.find((c) => c.id === editClient.id) ? "Edit Client" : "New Client"}
                </div>
                <button onClick={() => { setEditClient(null); setView("generate"); }} style={{
                  padding: "6px 14px", fontSize: 11, border: "1px solid #1e1e24", borderRadius: 6,
                  background: "transparent", color: "#888", cursor: "pointer",
                }}>Cancel</button>
              </div>

              <FieldGroup label="Brand / Product Name *">
                <input value={editClient.brandName} onChange={(e) => setEditClient({ ...editClient, brandName: e.target.value })}
                  placeholder="e.g. GlowSkin Pro" style={inputS} />
              </FieldGroup>

              <FieldGroup label="Product URL">
                <input value={editClient.productUrl} onChange={(e) => setEditClient({ ...editClient, productUrl: e.target.value })}
                  placeholder="https://..." style={inputS} />
              </FieldGroup>

              <FieldGroup label="Target Audience *">
                <textarea value={editClient.targetAudience} onChange={(e) => setEditClient({ ...editClient, targetAudience: e.target.value })}
                  placeholder="Be specific. e.g. 'Women 35-55 with hormonal acne who've tried prescriptions and are frustrated with side effects'"
                  rows={2} style={textareaS} />
              </FieldGroup>

              <FieldGroup label="Core Offer *">
                <textarea value={editClient.coreOffer} onChange={(e) => setEditClient({ ...editClient, coreOffer: e.target.value })}
                  placeholder="e.g. '2 bottles for the price of 1 + free shipping + 60-day guarantee'"
                  rows={2} style={textareaS} />
              </FieldGroup>

              <FieldGroup label="Winning Angles">
                <textarea value={editClient.winningAngles} onChange={(e) => setEditClient({ ...editClient, winningAngles: e.target.value })}
                  placeholder="What angles work in ads? e.g. 'Dermatologist-secret angle, frustration with prescriptions, natural-but-actually-works'"
                  rows={3} style={textareaS} />
              </FieldGroup>

              <FieldGroup label="Competitor Weaknesses">
                <textarea value={editClient.competitorWeaknesses} onChange={(e) => setEditClient({ ...editClient, competitorWeaknesses: e.target.value })}
                  placeholder="Where do competitors fall short?"
                  rows={2} style={textareaS} />
              </FieldGroup>

              <FieldGroup label="Proof Elements">
                <textarea value={editClient.proofElements} onChange={(e) => setEditClient({ ...editClient, proofElements: e.target.value })}
                  placeholder="Testimonials, stats, press, clinical data. Dump everything here."
                  rows={4} style={textareaS} />
              </FieldGroup>

              <FieldGroup label="Objections to Overcome">
                <textarea value={editClient.objections} onChange={(e) => setEditClient({ ...editClient, objections: e.target.value })}
                  placeholder="What stops people from buying?"
                  rows={2} style={textareaS} />
              </FieldGroup>

              <FieldGroup label="Knowledge Base / Background Docs">
                <textarea value={editClient.knowledgeBase} onChange={(e) => setEditClient({ ...editClient, knowledgeBase: e.target.value })}
                  placeholder="Paste winning ad copy, product descriptions, brand voice notes, research — anything the AI should know about this brand. Upload files below to append."
                  rows={6} style={textareaS} />
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => fileRef.current?.click()} style={{
                    padding: "6px 14px", fontSize: 11, border: "1px dashed #2a2a30", borderRadius: 6,
                    background: "transparent", color: "#666", cursor: "pointer",
                  }}>+ Upload file</button>
                  <input ref={fileRef} type="file" accept=".txt,.csv,.md,.json,.html" onChange={handleFileUpload} style={{ display: "none" }} />
                </div>
              </FieldGroup>

              <FieldGroup label="Default Style">
                <div style={{ display: "flex", gap: 8 }}>
                  {(["editorial", "branded"] as const).map((m) => (
                    <button key={m} onClick={() => setEditClient({ ...editClient, styleMode: m })}
                      style={{ ...pill(editClient.styleMode === m), flex: 1 }}>
                      {m === "editorial" ? "Editorial (native article)" : "Branded (client colors)"}
                    </button>
                  ))}
                </div>
                {editClient.styleMode === "branded" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    {([
                      { key: "brandPrimary" as const, label: "Primary" },
                      { key: "brandSecondary" as const, label: "Secondary" },
                      { key: "brandAccent" as const, label: "Accent" },
                    ]).map((c) => (
                      <div key={c.key} style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>{c.label}</div>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <input type="color" value={editClient[c.key]}
                            onChange={(e) => setEditClient({ ...editClient, [c.key]: e.target.value })}
                            style={{ width: 28, height: 28, border: "none", borderRadius: 4, cursor: "pointer", background: "none" }} />
                          <input type="text" value={editClient[c.key]}
                            onChange={(e) => setEditClient({ ...editClient, [c.key]: e.target.value })}
                            style={{ ...inputS, padding: "5px 8px", fontSize: 11 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </FieldGroup>

              <div style={{ display: "flex", gap: 10, marginTop: 32, marginBottom: 40 }}>
                <button onClick={() => handleSaveClient(editClient)}
                  disabled={!editClient.brandName}
                  style={{
                    flex: 1, padding: "14px", fontSize: 14, fontWeight: 700, border: "none", borderRadius: 9,
                    background: editClient.brandName ? "linear-gradient(135deg,#e63946,#ff6b6b)" : "#1a1a1e",
                    color: editClient.brandName ? "#fff" : "#555", cursor: editClient.brandName ? "pointer" : "not-allowed",
                  }}>Save Client</button>
                {clients.find((c) => c.id === editClient.id) && (
                  <button onClick={() => { handleDeleteClient(editClient.id); setEditClient(null); setView("generate"); }}
                    style={{
                      padding: "14px 20px", fontSize: 12, fontWeight: 500, border: "1px solid #3d1515",
                      borderRadius: 9, background: "transparent", color: "#f87171", cursor: "pointer",
                    }}>Delete</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ PREVIEW ═══ */}
        {view === "preview" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{
              padding: "10px 20px", borderBottom: "1px solid #1a1a1e", background: "#0c0c0f",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {(["desktop", "tablet", "mobile"] as const).map((m) => (
                  <button key={m} onClick={() => setPreviewMode(m)} style={{
                    padding: "5px 12px", fontSize: 11, fontWeight: 500, border: "1px solid #1e1e24",
                    borderRadius: 6, background: previewMode === m ? "#1a1a1e" : "transparent",
                    color: previewMode === m ? "#fff" : "#555", cursor: "pointer",
                  }}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setView("generate")} style={{
                  padding: "5px 12px", fontSize: 11, border: "1px solid #1e1e24", borderRadius: 6,
                  background: "transparent", color: "#888", cursor: "pointer",
                }}>Back</button>
                <button onClick={handleCopy} style={{
                  padding: "5px 12px", fontSize: 11, border: "1px solid #1e1e24", borderRadius: 6,
                  background: "transparent", color: "#ccc", cursor: "pointer", fontWeight: 500,
                }}>Copy HTML</button>
                <button onClick={handleExport} style={{
                  padding: "5px 12px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 6,
                  background: "#e63946", color: "#fff", cursor: "pointer",
                }}>Export .html</button>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: 16, background: "#141418", overflow: "auto" }}>
              <div style={{
                width: previewMode === "desktop" ? "100%" : previewMode === "tablet" ? 768 : 390,
                maxWidth: "100%", height: "100%", borderRadius: 8, overflow: "hidden",
                border: "1px solid #2a2a2e", background: "#fff", transition: "width 0.3s ease",
              }}>
                <iframe srcDoc={previewHTML} title="Preview"
                  style={{ width: "100%", height: "100%", border: "none" }}
                  sandbox="allow-scripts allow-same-origin" />
              </div>
            </div>
          </div>
        )}

        {/* ═══ HISTORY ═══ */}
        {view === "history" && (
          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 24px" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 24 }}>History</div>
              {history.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#444", fontSize: 13 }}>No pages generated yet.</div>
              ) : (
                history.map((item) => (
                  <div key={item.id} onClick={() => { setPreviewHTML(item.html); setView("preview"); }}
                    style={{
                      padding: "14px 16px", marginBottom: 8, borderRadius: 8, cursor: "pointer",
                      border: "1px solid #1e1e24", background: "#111116", transition: "border-color 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a30")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e24")}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{item.brandName}</div>
                        <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                          {item.pageType} / {item.awareness} aware
                          {item.instruction && <span> — {item.instruction.slice(0, 50)}{item.instruction.length > 50 ? "..." : ""}</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: "#444" }}>{item.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder, textarea::placeholder { color: #3a3a40; }
        input:focus, textarea:focus { outline: none; border-color: #e63946 !important; }
        button:hover { opacity: 0.92; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1e24; border-radius: 3px; }
      `}</style>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
      {children}
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{label}</div>
      {children}
    </div>
  );
}
