import { useState, useRef, useEffect } from "react";
import { LIFE_INVENTORY_DOMAINS } from "./lifeInventoryData.js";
import { ENERGY_AUDIT_SYSTEM_PROMPT } from "./energyAuditSystemPrompt.js";

const SANS = "'Plus Jakarta Sans','system-ui',sans-serif";
const SERIF = "'Crimson Text','Georgia',serif";

const c = {
  bg: "#faf8f4",
  bgHeader: "#f3f0e9",
  bgInput: "#ede8dd",
  border: "rgba(100,80,60,0.1)",
  borderMid: "rgba(100,80,60,0.18)",
  accent: "#2d5a3d",
  accentLight: "rgba(45,90,61,0.08)",
  accentMid: "rgba(45,90,61,0.18)",
  accentPop: "#c17f3a",
  textPrimary: "#1e1a16",
  textSecondary: "#5c5147",
  textMuted: "rgba(30,26,22,0.38)",
};

function useScrollToTopOnMount() {
  useEffect(() => {
    const scrollToTop = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch {}
    };
    scrollToTop();
    const t = setTimeout(scrollToTop, 60);
    return () => clearTimeout(t);
  }, []);
}

function Header() {
  return (
    <div style={{ borderBottom: `1px solid ${c.border}`, padding: "0.6rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: c.bgHeader, position: "sticky", top: 0, zIndex: 10 }}>
      <div>
        <div style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: c.accent, marginBottom: "1px", fontFamily: SANS, fontWeight: 600 }}>Voltage Wellness</div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: c.textPrimary, fontFamily: SANS }}>Energy Audit</div>
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={{ textAlign: "center", fontSize: "11px", color: c.textMuted, marginTop: "0.75rem", letterSpacing: "0.03em", fontFamily: SANS }}>
      Energetic life inventory — not a substitute for medical or psychological care.
    </div>
  );
}

// ---- ONE DOMAIN SCREEN ----
// Renders every group in a domain together (multiselect/single-select
// button groups, same interaction pattern as the Root Cause tool's
// body-part forms), a shared "anything else" detail box, and handles the
// two special cases: a group with a yes/no answer that reveals its own
// small follow-up text field, and the Formative Years domain's two
// separate age windows (each with its own detail box, no shared one).

function OptionGroup({ group, stateKey, selections, toggle, loading, followupValue, setFollowup }) {
  const selected = selections[stateKey] || [];
  const showFollowup = group.followupIfYes && selected.includes("Yes");
  return (
    <div style={{ marginBottom: "1.4rem" }}>
      <div style={{ fontSize: "13px", fontWeight: 700, color: c.textPrimary, marginBottom: "0.6rem", fontFamily: SANS }}>
        {group.label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {group.options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(stateKey, opt, group.type === "singleSelect")}
              disabled={loading}
              style={{
                background: isSelected ? c.accent : c.bgInput,
                border: `1.5px solid ${isSelected ? c.accent : c.borderMid}`,
                borderRadius: "8px",
                padding: "9px 16px",
                fontSize: "14px",
                color: isSelected ? "#fff" : c.textPrimary,
                cursor: loading ? "default" : "pointer",
                fontFamily: SERIF,
                fontWeight: isSelected ? 600 : 400,
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              {isSelected ? "✓ " : ""}{opt}
            </button>
          );
        })}
      </div>
      {showFollowup && (
        <div style={{ marginTop: "0.75rem", background: c.bgInput, border: `1px solid ${c.accent}`, borderRadius: "10px", padding: "10px 14px" }}>
          <div style={{ fontSize: "12px", color: c.accent, fontFamily: SANS, fontWeight: 600, marginBottom: "0.35rem" }}>
            {group.followupIfYes.label}
          </div>
          <textarea
            value={followupValue || ""}
            onChange={e => setFollowup(group.followupIfYes.key, e.target.value)}
            placeholder="Type here..."
            rows={2}
            style={{ background: "transparent", border: "none", outline: "none", color: c.textPrimary, fontSize: "15px", fontFamily: SERIF, lineHeight: 1.6, resize: "none", width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

function DetailBox({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ fontSize: "13px", color: c.textSecondary, fontFamily: SANS, fontWeight: 600, marginBottom: "0.5rem" }}>
        {label}
      </div>
      <div style={{ background: c.bgInput, border: `1px solid ${c.borderMid}`, borderRadius: "12px", padding: "12px 16px" }}>
        <textarea
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder="Type here..."
          rows={2}
          style={{ background: "transparent", border: "none", outline: "none", color: c.textPrimary, fontSize: "16px", fontFamily: SERIF, lineHeight: 1.6, resize: "none", width: "100%" }}
        />
      </div>
    </div>
  );
}

function DomainScreen({ domain, index, total, loading, answers, setAnswers, goBack }) {
  useScrollToTopOnMount();

  const selections = answers[domain.id] || {};

  const toggle = (stateKey, opt, isSingle) => {
    setAnswers(prev => {
      const domainAnswers = { ...(prev[domain.id] || {}) };
      const current = domainAnswers[stateKey] || [];
      if (isSingle) {
        domainAnswers[stateKey] = current.includes(opt) ? [] : [opt];
      } else {
        domainAnswers[stateKey] = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
      }
      return { ...prev, [domain.id]: domainAnswers };
    });
  };

  const setTextField = (key, value) => {
    setAnswers(prev => ({ ...prev, [domain.id]: { ...(prev[domain.id] || {}), [key]: value } }));
  };

  const submit = () => {
    // no required fields in the Life Inventory — every open text field is
    // optional by design, per spec
    goBack.advance();
  };

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1.5rem 1.5rem 2rem", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: "760px" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: c.accent, marginBottom: "1rem", fontFamily: SANS }}>
            Life Inventory · {index + 1} of {total}
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: c.textPrimary, marginBottom: "0.5rem", lineHeight: 1.3, fontFamily: SANS, letterSpacing: "-0.01em" }}>
            {domain.uiTitle}
          </div>
          <div style={{ fontSize: "13px", color: c.textMuted, fontFamily: SANS, fontStyle: "italic" }}>
            Answer whatever applies — every open question here is optional.
          </div>
        </div>

        <div style={{ paddingRight: "4px" }}>
          {domain.groups && domain.groups.map(g => (
            <OptionGroup
              key={g.key}
              group={g}
              stateKey={g.key}
              selections={selections}
              toggle={toggle}
              loading={loading}
              followupValue={g.followupIfYes ? selections[g.followupIfYes.key] : undefined}
              setFollowup={setTextField}
            />
          ))}
          {domain.groups && domain.detailLabel && (
            <DetailBox
              label={domain.detailLabel}
              value={selections["_detail"]}
              onChange={v => setTextField("_detail", v)}
            />
          )}

          {/* Formative Years: two age windows, each with its own groups + own detail box */}
          {domain.ageWindows && domain.ageWindows.map((window, wi) => (
            <div key={wi}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: "0.06em", margin: wi === 0 ? "0 0 1rem" : "1.6rem 0 1rem", borderTop: wi > 0 ? `1px solid ${c.borderMid}` : "none", paddingTop: wi > 0 ? "1.4rem" : "0" }}>
                {window.rangeLabel}
              </div>
              {window.groups.map(g => (
                <OptionGroup
                  key={g.key}
                  group={g}
                  stateKey={g.key}
                  selections={selections}
                  toggle={toggle}
                  loading={loading}
                  followupValue={undefined}
                  setFollowup={setTextField}
                />
              ))}
              <DetailBox
                label={window.detailLabel}
                value={selections[window.detailKey]}
                onChange={v => setTextField(window.detailKey, v)}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
          {index > 0 ? (
            <button
              onClick={goBack.back}
              disabled={loading}
              style={{ background: "transparent", border: "none", color: c.textMuted, padding: "8px 4px", cursor: loading ? "default" : "pointer", fontSize: "13px", fontFamily: SANS, fontWeight: 600, letterSpacing: "0.03em" }}
            >
              &larr; Back
            </button>
          ) : <div />}
          <button
            onClick={submit}
            disabled={loading}
            style={{ background: loading ? c.accentMid : c.accent, border: "none", borderRadius: "4px", padding: "10px 24px", cursor: loading ? "default" : "pointer", color: loading ? c.textMuted : "#fff", fontSize: "13px", fontFamily: SANS, fontWeight: 700, letterSpacing: "0.04em", transition: "all 0.15s" }}
          >
            {index === total - 1 ? "Finish \u2192" : "Next \u2192"}
          </button>
        </div>
        <Disclaimer />
      </div>
    </div>
  );
}

// ---- API CALL ----

async function callAPI(messages, maxTokens = 3000) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: maxTokens,
          system: ENERGY_AUDIT_SYSTEM_PROMPT,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (res.status === 529 && attempt < 2) {
        await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      return data.content.map(b => b.text || "").join("");
    } catch (e) {
      lastErr = e;
      if (attempt < 2) await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastErr;
}

function parseAuditStatus(text) {
  const m = text.match(/\[\[AUDIT_STATUS progress=(\d+) next=(ask|ready)\]\]/);
  const cleaned = text.replace(/\[\[AUDIT_STATUS[^\]]*\]\]/, "").trim();
  if (!m) return { cleaned, progress: null, next: null };
  return { cleaned, progress: parseInt(m[1], 10), next: m[2] };
}

function parseQuestionTag(text) {
  const m = text.match(/\[\[Q\]\]([\s\S]*?)\[\[\/Q\]\]/);
  return { hasQuestion: !!m, questionText: m ? m[1].trim() : null };
}

function parseChakraLocation(text) {
  const m = text.match(/\[\[CHAKRA_LOCATION\s+primary=(\w+)\s+secondary=(\w+)\]\]/);
  const cleaned = text.replace(/\[\[CHAKRA_LOCATION[^\]]*\]\]/, "").trim();
  if (!m) return { cleaned, location: null };
  return {
    cleaned,
    location: { primary: m[1], secondary: m[2] === "none" ? null : m[2] },
  };
}

// ---- BODY MAP ----
// Renders the seven-center energy visualization. Positions are anatomical
// (crown at top of head down to root at base of spine); intensity is a
// single warm-color glow, stronger glow = more depleted. Deliberately no
// "chakra" language anywhere in the UI — plain English labels only.

const BODY_ZONES = [
  { key: "crown", label: "Connection", cy: 18, outerR: 14, coreR: 6 },
  { key: "thirdEye", label: "Clarity", cy: 40, outerR: 11, coreR: 5 },
  { key: "throat", label: "Expression", cy: 80, outerR: 12, coreR: 5 },
  { key: "heart", label: "Heart", cy: 140, outerR: 22, coreR: 9 },
  { key: "solarPlexus", label: "Personal Power", cy: 188, outerR: 19, coreR: 8 },
  { key: "sacral", label: "Creativity & Connection", cy: 232, outerR: 19, coreR: 8 },
  { key: "root", label: "Foundation", cy: 278, outerR: 22, coreR: 9 },
];

function opacityForRole(role) {
  if (role === "primary") return 0.85;
  if (role === "secondary") return 0.5;
  return 0;
}

function BodyMap({ location, forExport }) {
  const roleFor = (key) => {
    if (location.primary === key) return "primary";
    if (location.secondary === key) return "secondary";
    return null;
  };
  const activeZones = BODY_ZONES.filter(z => roleFor(z.key));

  return (
    <svg width="240" height="480" viewBox="0 0 240 480" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      {forExport && <rect x="0" y="0" width="240" height="480" fill="#faf8f4" />}
      <g filter="url(#softGlow)">
        {activeZones.map(z => (
          <circle key={z.key} cx="120" cy={z.cy} r={z.outerR} fill="#c17f3a" opacity={opacityForRole(roleFor(z.key))} />
        ))}
      </g>
      <g>
        {activeZones.map(z => (
          <circle key={z.key} cx="120" cy={z.cy} r={z.coreR} fill="#c17f3a" opacity={Math.min(1, opacityForRole(roleFor(z.key)) + 0.15)} />
        ))}
      </g>
      <g fill="none" stroke="#1e1a16" strokeWidth="2" opacity="0.55">
        <circle cx="120" cy="45" r="28" />
        <path d="M108,70 L108,85 M132,70 L132,85" />
        <path d="M85,95 Q78,100 78,190 L82,260 Q85,290 95,300 L145,300 Q155,290 158,260 L162,190 Q162,100 155,95 Q120,80 85,95 Z" />
        <path d="M82,100 Q55,130 48,190 Q45,220 50,250 M158,100 Q185,130 192,190 Q195,220 190,250" />
        <path d="M95,300 Q90,360 85,420 Q83,445 88,470 M145,300 Q150,360 155,420 Q157,445 152,470" />
      </g>
    </svg>
  );
}

function BodyMapWithDownload({ location }) {
  const svgRef = useRef(null);
  const primaryZone = BODY_ZONES.find(z => z.key === location.primary);
  const secondaryZone = location.secondary ? BODY_ZONES.find(z => z.key === location.secondary) : null;

  const download = () => {
    const svgEl = svgRef.current.querySelector("svg");
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 3;
      canvas.width = 240 * scale;
      canvas.height = 480 * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#faf8f4";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, 240, 480);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "energy-map.png";
        link.click();
      });
    };
    img.src = url;
  };

  return (
    <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
      <div ref={svgRef}>
        <BodyMap location={location} forExport={true} />
      </div>
      <div style={{ fontSize: "12px", color: c.textMuted, fontFamily: SANS, marginTop: "0.75rem", letterSpacing: "0.03em" }}>
        {secondaryZone
          ? `Your energy is most concentrated in ${primaryZone.label.toLowerCase()}, with a secondary pull toward ${secondaryZone.label.toLowerCase()}.`
          : `Your energy is most concentrated in ${primaryZone.label.toLowerCase()}.`}
      </div>
      <button
        onClick={download}
        style={{ marginTop: "0.85rem", background: "transparent", border: `1.5px solid ${c.borderMid}`, borderRadius: "6px", padding: "8px 18px", fontSize: "13px", fontFamily: SANS, fontWeight: 700, letterSpacing: "0.03em", color: c.textPrimary, cursor: "pointer" }}
      >
        Download image
      </button>
    </div>
  );
}

function EnergeticDirectionAction() {
  return (
    <div style={{ marginTop: "2rem", background: c.bgInput, border: `1px solid ${c.borderMid}`, borderRadius: "12px", padding: "1.4rem 1.5rem", textAlign: "center", fontFamily: SANS }}>
      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: c.accent, marginBottom: "0.6rem" }}>
        Energetic Direction
      </div>
      <div style={{ fontSize: "15px", color: c.textPrimary, lineHeight: 1.6, marginBottom: "1rem", fontFamily: SERIF }}>
        This reading is a map. Energetic Direction is where you actually live it — sustained one-on-one work, real accountability, and guided practice a reading alone can't provide.
      </div>
      <a
        href="https://voltagewellness.com/work-with-me.html#direction"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-block", background: c.accent, border: "none", borderRadius: "6px", padding: "10px 22px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.03em", color: "#fff", textDecoration: "none" }}
      >
        Learn about Energetic Direction &rarr;
      </a>
    </div>
  );
}

function ConversationScreen({ messages, loading, progress, onSend }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, loading]);

  const send = () => {
    if (!draft.trim() || loading) return;
    onSend(draft.trim());
    setDraft("");
  };

  const visible = messages.filter(m => !m.hidden);

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: "780px", width: "100%", margin: "0 auto", padding: "0.85rem 1.5rem 0" }}>
        <div style={{ height: "4px", background: c.bgInput, borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: c.accent, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ fontSize: "11px", color: c.textMuted, marginTop: "0.4rem", fontFamily: SANS, letterSpacing: "0.04em" }}>
          THE ENERGETIC ANCHOR ANALYSIS
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 1.5rem" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto", paddingTop: "1.5rem" }}>
          {visible.map((m, i) => (
            <div key={i} style={{ marginBottom: "2rem" }}>
              {m.role === "user" ? (
                <div style={{ background: c.bgInput, border: `1px solid ${c.borderMid}`, borderRadius: "12px", padding: "1rem 1.25rem", fontSize: "16px", fontFamily: SERIF, lineHeight: 1.7 }}>
                  {m.content}
                </div>
              ) : m.isReading ? (
                <div style={{ fontSize: "17px", fontFamily: SERIF, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: c.accent, marginBottom: "1rem", fontFamily: SANS }}>
                    Your Energetic Anchor Reading
                  </div>
                  {m.chakraLocation && <BodyMapWithDownload location={m.chakraLocation} />}
                  {m.content}
                  <EnergeticDirectionAction />
                </div>
              ) : (
                <div style={{ fontSize: "17px", fontFamily: SERIF, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                  {m.displayReflection}
                  {m.displayQuestion && (
                    <div style={{ marginTop: "1rem", fontWeight: 600, color: c.accent, borderLeft: `2px solid ${c.accent}`, paddingLeft: "1rem" }}>
                      {m.displayQuestion}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0.5rem 0" }}>
              <div style={{ display: "flex", gap: "5px" }}>
                <div className="thinking-dot" style={{ animationDelay: "0s" }} />
                <div className="thinking-dot" style={{ animationDelay: "0.15s" }} />
                <div className="thinking-dot" style={{ animationDelay: "0.3s" }} />
              </div>
              <div style={{ fontSize: "13px", color: c.textMuted, fontFamily: SANS, fontStyle: "italic" }}>
                Reading what you shared…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
      <div style={{ maxWidth: "780px", width: "100%", margin: "0 auto", padding: "1rem 1.5rem 1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: c.bgInput, border: `1px solid ${c.borderMid}`, borderRadius: "10px", padding: "10px 14px" }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type your answer..."
            rows={2}
            autoFocus
            style={{ background: "transparent", border: "none", outline: "none", color: c.textPrimary, fontSize: "17px", fontFamily: SERIF, lineHeight: 1.6, resize: "none", width: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={send}
              disabled={!draft.trim() || loading}
              style={{ background: draft.trim() && !loading ? c.accent : c.accentMid, border: "none", borderRadius: "4px", padding: "7px 18px", cursor: draft.trim() && !loading ? "pointer" : "default", color: draft.trim() && !loading ? "#fff" : c.textMuted, fontSize: "13px", fontFamily: SANS, fontWeight: 700, letterSpacing: "0.04em" }}
            >
              Send &rarr;
            </button>
          </div>
        </div>
        <Disclaimer />
      </div>
    </div>
  );
}

function formatDomainAnswers(domain, answers) {
  const a = answers[domain.id] || {};
  const lines = [];

  const describeGroup = (g) => {
    const val = a[g.key];
    if (val && val.length) lines.push(`${g.label}\n${val.join(", ")}`);
    else lines.push(`${g.label}\n(skipped)`);
    if (g.followupIfYes && a[g.followupIfYes.key] && a[g.followupIfYes.key].trim()) {
      lines.push(`${g.followupIfYes.label}\n${a[g.followupIfYes.key].trim()}`);
    }
  };

  if (domain.groups) {
    domain.groups.forEach(describeGroup);
    if (a["_detail"] && a["_detail"].trim()) {
      lines.push(`${domain.detailLabel}\n${a["_detail"].trim()}`);
    }
  }

  if (domain.ageWindows) {
    domain.ageWindows.forEach(window => {
      lines.push(`--- ${window.rangeLabel} ---`);
      window.groups.forEach(describeGroup);
      if (a[window.detailKey] && a[window.detailKey].trim()) {
        lines.push(`${window.detailLabel}\n${a[window.detailKey].trim()}`);
      }
    });
  }

  return lines.join("\n\n");
}

function compileFullInventory(answers) {
  return LIFE_INVENTORY_DOMAINS
    .map(d => `## ${d.uiTitle}\n\n${formatDomainAnswers(d, answers)}`)
    .join("\n\n\n");
}

// ---- PAYWALL ----

function PaywallScreen({ onCheckout, checkingOut, checkoutError, cancelled }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2.5rem 1.5rem", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: "560px", textAlign: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: c.accent, marginBottom: "1rem", fontFamily: SANS }}>
          The Energy Audit
        </div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: c.textPrimary, marginBottom: "1rem", lineHeight: 1.3, fontFamily: SANS, letterSpacing: "-0.01em" }}>
          A complete map of where your energy is going.
        </div>
        <div style={{ fontSize: "16px", color: c.textSecondary, fontFamily: SERIF, lineHeight: 1.75, marginBottom: "1.75rem" }}>
          Nine domains of your actual life, a guided conversation that finds the real anchor beneath the pattern, and a full written Reading built to go as deep as the material allows — not a quick quiz, a real one-time investment in seeing the whole picture clearly.
        </div>
        {cancelled && (
          <div style={{ fontSize: "13px", color: c.accentPop, fontFamily: SANS, marginBottom: "1rem" }}>
            Checkout was cancelled — no charge was made. Ready whenever you are.
          </div>
        )}
        {checkoutError && (
          <div style={{ fontSize: "13px", color: c.accentPop, fontFamily: SANS, marginBottom: "1rem" }}>
            Something went wrong starting checkout. Please try again.
          </div>
        )}
        <button
          onClick={onCheckout}
          disabled={checkingOut}
          style={{ background: checkingOut ? c.accentMid : c.accent, border: "none", borderRadius: "6px", padding: "14px 32px", fontSize: "15px", color: "#fff", cursor: checkingOut ? "default" : "pointer", fontFamily: SANS, fontWeight: 700, letterSpacing: "0.03em" }}
        >
          {checkingOut ? "Redirecting…" : "Start the Energy Audit — $44"}
        </button>
        <div style={{ fontSize: "12px", color: c.textMuted, fontFamily: SANS, marginTop: "0.6rem" }}>
          One-time. Full nine-domain Life Inventory, guided conversation, and complete Reading.
        </div>
        <Disclaimer />
      </div>
    </div>
  );
}

// ---- MAIN APP ----

export default function EnergyAuditInterpreter() {
  const [unlocked, setUnlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("session_id");
    const wasCancelled = url.searchParams.get("checkout") === "cancelled";

    if (wasCancelled) {
      setCancelled(true);
      window.history.replaceState({}, "", window.location.pathname);
    }

    const stored = localStorage.getItem("energyAudit_unlocked");
    if (stored === "true") {
      setUnlocked(true);
      setCheckingAccess(false);
      return;
    }

    if (sessionId) {
      fetch("/api/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.paid) {
            localStorage.setItem("energyAudit_unlocked", "true");
            setUnlocked(true);
          }
          window.history.replaceState({}, "", window.location.pathname);
          setCheckingAccess(false);
        })
        .catch(() => {
          window.history.replaceState({}, "", window.location.pathname);
          setCheckingAccess(false);
        });
    } else {
      setCheckingAccess(false);
    }
  }, []);

  const startCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError(false);
    try {
      const res = await fetch("/api/create-checkout-session", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch {
      setCheckoutError(true);
      setCheckingOut(false);
    }
  };

  const [step, setStep] = useState("intake"); // intake | conversation
  const [domainIndex, setDomainIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(5);
  const [turnCount, setTurnCount] = useState(0);
  const MAX_TURNS = 8; // hard safety cap — see system prompt for the matching instruction

  const advanceDomain = () => {
    if (domainIndex < LIFE_INVENTORY_DOMAINS.length - 1) {
      setDomainIndex(domainIndex + 1);
    } else {
      beginAnchorAnalysis();
    }
  };
  const backDomain = () => {
    if (domainIndex > 0) setDomainIndex(domainIndex - 1);
  };

  const beginAnchorAnalysis = async () => {
    setStep("conversation");
    setLoading(true);
    const compiled = compileFullInventory(answers);
    const kickoff = {
      role: "user",
      content: `Here is the person's full Life Inventory:\n\n${compiled}\n\nBegin the Energetic Anchor Analysis conversation now — ask your first question.`,
      hidden: true,
    };
    const newMessages = [kickoff];
    setMessages(newMessages);
    try {
      const raw = await callAPI(newMessages);
      handleModelTurn(raw, newMessages);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "There was a connection error. Please try again.", displayReflection: "There was a connection error. Please try again." }]);
      setLoading(false);
    }
  };

  const handleModelTurn = (raw, priorMessages) => {
    const { cleaned, progress: p, next } = parseAuditStatus(raw);
    const { hasQuestion, questionText } = parseQuestionTag(cleaned);
    const reflection = cleaned.replace(/\[\[Q\]\][\s\S]*?\[\[\/Q\]\]/, "").trim();

    setTurnCount(t => t + 1);
    if (p !== null) setProgress(p);

    const forceReady = turnCount + 1 >= MAX_TURNS;

    if ((next === "ready" || forceReady) && !hasQuestion) {
      // Model signaled ready with no further question — this response IS
      // effectively the closing turn; request the Reading next.
      requestReading([...priorMessages, { role: "assistant", content: raw }]);
      return;
    }

    const assistantMsg = {
      role: "assistant",
      content: raw,
      displayReflection: reflection,
      displayQuestion: hasQuestion ? questionText : null,
    };
    setMessages([...priorMessages, assistantMsg]);
    setLoading(false);

    if (forceReady && hasQuestion) {
      // Safety cap hit but model still asked — let this question get
      // answered once more, then force the reading on the next turn.
    }
  };

  const requestReading = async (messagesForApi) => {
    setLoading(true);
    const readingRequest = {
      role: "user",
      content: "Write the final Reading now. Do not include a status marker on this response.",
      hidden: true,
    };
    const withRequest = [...messagesForApi, readingRequest];
    try {
      const raw = await callAPI(withRequest, 16000);
      const { cleaned: withoutStatus } = parseAuditStatus(raw);
      const { cleaned: readingText, location } = parseChakraLocation(withoutStatus);
      setMessages([...withRequest.filter(m => !m.hidden), { role: "assistant", content: readingText, isReading: true, chakraLocation: location }]);
      setProgress(100);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "There was a connection error generating your Reading. Please try again.", displayReflection: "There was a connection error generating your Reading. Please try again." }]);
    }
    setLoading(false);
  };

  const sendAnswer = async (text) => {
    const userMsg = { role: "user", content: text };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setLoading(true);
    try {
      const raw = await callAPI(withUser);
      handleModelTurn(raw, withUser);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "There was a connection error. Please try again.", displayReflection: "There was a connection error. Please try again." }]);
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <div style={{ height: "100vh", overflow: "hidden", background: c.bg, color: c.textPrimary, fontFamily: SERIF, display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: c.textMuted, fontFamily: SANS }}>
          Checking access…
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div style={{ height: "100vh", overflow: "hidden", background: c.bg, color: c.textPrimary, fontFamily: SERIF, display: "flex", flexDirection: "column" }}>
        <Header />
        <PaywallScreen onCheckout={startCheckout} checkingOut={checkingOut} checkoutError={checkoutError} cancelled={cancelled} />
        <style>{`
          * { box-sizing: border-box; }
          body { margin: 0; }
          textarea::placeholder { color: rgba(30,26,22,0.3); }
          .thinking-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #2d5a3d;
            animation: thinkingBounce 1s ease-in-out infinite;
          }
          @keyframes thinkingBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-5px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: c.bg, color: c.textPrimary, fontFamily: SERIF, display: "flex", flexDirection: "column" }}>
      <Header />
      {step === "conversation" ? (
        <ConversationScreen messages={messages} loading={loading} progress={progress} onSend={sendAnswer} />
      ) : (
        <DomainScreen
          key={domainIndex}
          domain={LIFE_INVENTORY_DOMAINS[domainIndex]}
          index={domainIndex}
          total={LIFE_INVENTORY_DOMAINS.length}
          loading={loading}
          answers={answers}
          setAnswers={setAnswers}
          goBack={{ advance: advanceDomain, back: backDomain }}
        />
      )}
      <style>{`
          * { box-sizing: border-box; }
          body { margin: 0; }
          textarea::placeholder { color: rgba(30,26,22,0.3); }
          .thinking-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #2d5a3d;
            animation: thinkingBounce 1s ease-in-out infinite;
          }
          @keyframes thinkingBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-5px); opacity: 1; }
          }
        `}</style>
    </div>
  );
}
