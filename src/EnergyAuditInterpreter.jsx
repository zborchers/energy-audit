import { useState, useRef, useEffect } from "react";
import { LIFE_INVENTORY_DOMAINS } from "./lifeInventoryData.js";
import { ENERGY_AUDIT_SYSTEM_PROMPT } from "./energyAuditSystemPrompt.js";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

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
  const trigger = group.followupTrigger;
  const showFollowup = trigger && trigger.values.some(v => selected.includes(v));
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
            {trigger.label}
          </div>
          <textarea
            value={followupValue || ""}
            onChange={e => setFollowup(trigger.key, e.target.value)}
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
              followupValue={g.followupTrigger ? selections[g.followupTrigger.key] : undefined}
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
  const maxAttempts = 2; // fewer retries now — each attempt can legitimately take a while
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 110000); // generous — this generates the entire comprehensive Reading in one call, not a short reply
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          max_tokens: maxTokens,
          system: ENERGY_AUDIT_SYSTEM_PROMPT,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      clearTimeout(timeoutId);
      if (res.status === 529 && attempt < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      return data.content.map(b => b.text || "").join("");
    } catch (e) {
      clearTimeout(timeoutId);
      lastErr = e;
      if (attempt < maxAttempts - 1) await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastErr;
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

function GeneratingScreen({ stage }) {
  const messages = {
    1: "Finding the anchor underneath the pattern.",
    2: "Working through all ten domains, one at a time.",
    3: "Bringing it together and closing the Reading.",
  };

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "1rem" }}>
          <div className="thinking-dot" style={{ animationDelay: "0s" }} />
          <div className="thinking-dot" style={{ animationDelay: "0.15s" }} />
          <div className="thinking-dot" style={{ animationDelay: "0.3s" }} />
        </div>
        <div style={{ fontSize: "16px", color: c.textSecondary, fontFamily: SERIF, marginBottom: "0.5rem", maxWidth: "360px" }}>
          {messages[stage]}
        </div>
        <div style={{ fontSize: "12px", color: c.textMuted, fontFamily: SANS }}>
          Part {stage} of 3
        </div>
      </div>
    </div>
  );
}

// Parses the model's lightweight "# " / "## " heading markup into a
// structured list of blocks, shared by both the on-screen display and the
// Word export, so the two never drift apart from each other.
function parseReportStructure(text) {
  const lines = text.split("\n");
  const blocks = [];
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length) {
      const combined = currentParagraph.join(" ").trim();
      if (combined) blocks.push({ type: "p", text: combined });
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
    } else if (trimmed.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
    } else if (trimmed.startsWith("# ")) {
      flushParagraph();
      blocks.push({ type: "h1", text: trimmed.slice(2).trim() });
    } else if (trimmed === "") {
      flushParagraph();
    } else {
      currentParagraph.push(trimmed);
    }
  }
  flushParagraph();
  return blocks;
}

function ReportContent({ text }) {
  const blocks = parseReportStructure(text);
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "h1") {
          return (
            <div key={i} style={{ fontSize: "23px", fontWeight: 700, fontFamily: SANS, color: c.textPrimary, letterSpacing: "-0.01em", marginTop: i === 0 ? 0 : "2.5rem", marginBottom: "1.1rem", paddingBottom: "0.6rem", borderBottom: `1px solid ${c.borderMid}` }}>
              {b.text}
            </div>
          );
        }
        if (b.type === "h2") {
          return (
            <div key={i} style={{ fontSize: "16px", fontWeight: 700, fontFamily: SANS, color: c.accent, marginTop: "1.75rem", marginBottom: "0.6rem" }}>
              {b.text}
            </div>
          );
        }
        if (b.type === "h3") {
          const isDrain = b.text.toLowerCase().includes("drain");
          return (
            <div key={i} style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: SANS, color: isDrain ? c.accentPop : c.accent, marginTop: "1.1rem", marginBottom: "0.4rem" }}>
              {b.text}
            </div>
          );
        }
        return (
          <p key={i} style={{ margin: "0 0 1.15rem", lineHeight: 1.85, fontFamily: SERIF, fontSize: "17px" }}>
            {b.text}
          </p>
        );
      })}
    </>
  );
}

async function downloadReadingAsDocx(readingText) {
  const blocks = parseReportStructure(readingText);
  const bodyChildren = blocks.map(b => {
    if (b.type === "h1") {
      return new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 } });
    }
    if (b.type === "h2") {
      return new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 } });
    }
    if (b.type === "h3") {
      return new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 } });
    }
    return new Paragraph({
      children: [new TextRun({ text: b.text, font: "Georgia", size: 24 })],
      spacing: { after: 240 },
    });
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Your Energy Audit Reading",
          heading: HeadingLevel.TITLE,
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Voltage Wellness", italics: true, size: 20, color: "5C5147" })],
          spacing: { after: 480 },
        }),
        ...bodyChildren,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "energy-audit-reading.docx";
  link.click();
}

function ReadingScreen({ reading, error, onRetry }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 1.5rem" }}>
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "1.5rem 0 2.5rem" }}>
        {error ? (
          <div style={{ fontSize: "17px", fontFamily: SERIF, lineHeight: 1.85 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ color: c.accentPop, fontSize: "15px" }}>There was a connection error generating your Reading.</span>
              <button
                onClick={onRetry}
                style={{ background: c.accent, border: "none", borderRadius: "4px", padding: "8px 18px", fontSize: "13px", fontFamily: SANS, fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "0.03em" }}
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: c.accent, fontFamily: SANS }}>
                Your Energy Audit Reading
              </div>
              <button
                onClick={() => downloadReadingAsDocx(reading.text)}
                style={{ background: "transparent", border: `1.5px solid ${c.borderMid}`, borderRadius: "6px", padding: "7px 16px", fontSize: "12px", fontFamily: SANS, fontWeight: 700, color: c.textPrimary, cursor: "pointer", letterSpacing: "0.02em" }}
              >
                Download as Word document
              </button>
            </div>
            <ReportContent text={reading.text} />
            <EnergeticDirectionAction />
          </div>
        )}
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
    if (g.followupTrigger && a[g.followupTrigger.key] && a[g.followupTrigger.key].trim()) {
      lines.push(`${g.followupTrigger.label}\n${a[g.followupTrigger.key].trim()}`);
    }
  };

  if (domain.groups) {
    domain.groups.forEach(describeGroup);
    if (a["_detail"] && a["_detail"].trim()) {
      lines.push(`${domain.detailLabel}\n${a["_detail"].trim()}`);
    }
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
          Nine domains of your actual life, examined in genuine depth, with a full written Reading that traces the real anchor beneath the pattern and goes as deep as the material allows — not a quick quiz, a real one-time investment in seeing the whole picture clearly.
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
          One-time. Full nine-domain Life Inventory and a complete, comprehensive Reading.
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

  const [step, setStep] = useState("intake"); // intake | generating | reading
  const [domainIndex, setDomainIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reading, setReading] = useState(null); // { text }
  const [readingError, setReadingError] = useState(false);
  const [loading, setLoading] = useState(false);

  const advanceDomain = () => {
    if (domainIndex < LIFE_INVENTORY_DOMAINS.length - 1) {
      setDomainIndex(domainIndex + 1);
    } else {
      generateReading();
    }
  };
  const backDomain = () => {
    if (domainIndex > 0) setDomainIndex(domainIndex - 1);
  };

  const [generatingStage, setGeneratingStage] = useState(1);
  const [retryState, setRetryState] = useState(null);

  const generateReading = async (resume) => {
    setStep("generating");
    setReadingError(false);
    setLoading(true);

    let history, stage, parts;
    if (resume) {
      ({ history, stage, parts } = resume);
    } else {
      const compiled = compileFullInventory(answers);
      history = [{ role: "user", content: `Here is the person's full Life Inventory:\n\n${compiled}\n\nWrite Part One (The Anchor) now.` }];
      stage = 1;
      parts = {};
    }

    try {
      if (stage === 1) {
        setGeneratingStage(1);
        const part1 = await callAPI(history, 3000);
        parts.partOne = part1;
        history = [...history, { role: "assistant", content: part1 }, { role: "user", content: "Now write Part Two (Domain by Domain, all ten domains)." }];
        stage = 2;
      }
      if (stage === 2) {
        setGeneratingStage(2);
        const part2 = await callAPI(history, 6000);
        parts.partTwo = part2;
        history = [...history, { role: "assistant", content: part2 }, { role: "user", content: "Now write Part Three (Where to Start, and Close), including the chakra location marker at the end." }];
        stage = 3;
      }
      setGeneratingStage(3);
      const part3 = await callAPI(history, 2000);
      const fullText = [parts.partOne, parts.partTwo, part3].join("\n\n");
      setReading({ text: fullText });
      setStep("reading");
    } catch {
      setRetryState({ history, stage, parts });
      setReadingError(true);
      setStep("reading");
    }
    setLoading(false);
  };

  const retryReading = () => generateReading(retryState);

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
      {step === "generating" ? (
        <GeneratingScreen stage={generatingStage} />
      ) : step === "reading" ? (
        <ReadingScreen reading={reading} error={readingError} onRetry={retryReading} />
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
