import { useState, useEffect } from "react";
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
        <div style={{ fontSize: "14px", fontWeight: 700, color: c.textPrimary, fontFamily: SANS }}>Energetic Direction — Client Intake</div>
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

function DetailBox({ label, value, onChange, rows, placeholder, emphasized }) {
  return (
    <div style={{ marginBottom: emphasized ? "1.75rem" : "1rem" }}>
      <div style={{ fontSize: emphasized ? "14px" : "13px", color: emphasized ? c.textPrimary : c.textSecondary, fontFamily: SANS, fontWeight: 700, marginBottom: "0.5rem" }}>
        {label}
      </div>
      <div style={{ background: c.bgInput, border: `1px solid ${emphasized ? c.accent : c.borderMid}`, borderRadius: "12px", padding: "12px 16px" }}>
        <textarea
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || "Type here..."}
          rows={rows || 2}
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
          {domain.groups && domain.detailLabel && domain.detailFirst && (
            <DetailBox
              label={domain.detailLabel}
              value={selections["_detail"]}
              onChange={v => setTextField("_detail", v)}
              rows={domain.detailRows}
              placeholder={domain.detailPlaceholder}
              emphasized
            />
          )}
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
          {domain.groups && domain.detailLabel && !domain.detailFirst && (
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

function NameScreen({ name, setName, onContinue }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2.5rem 1.5rem", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: "480px", textAlign: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: c.accent, marginBottom: "1rem", fontFamily: SANS }}>
          Client Intake
        </div>
        <div style={{ fontSize: "24px", fontWeight: 700, color: c.textPrimary, marginBottom: "1rem", lineHeight: 1.3, fontFamily: SANS, letterSpacing: "-0.01em" }}>
          What's your name?
        </div>
        <div style={{ fontSize: "15px", color: c.textSecondary, fontFamily: SERIF, lineHeight: 1.7, marginBottom: "1.75rem" }}>
          This is how Zach will know whose intake this is. Everything you share here goes to him to prepare for your session, and you'll see your own analysis on screen as soon as it's ready.
        </div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your full name"
          onKeyDown={e => { if (e.key === "Enter" && name.trim()) onContinue(); }}
          autoFocus
          style={{ width: "100%", background: c.bgInput, border: `1.5px solid ${c.borderMid}`, borderRadius: "8px", padding: "12px 16px", fontSize: "16px", fontFamily: SERIF, color: c.textPrimary, outline: "none", marginBottom: "1.25rem", boxSizing: "border-box" }}
        />
        <button
          onClick={onContinue}
          disabled={!name.trim()}
          style={{ background: name.trim() ? c.accent : c.accentMid, border: "none", borderRadius: "6px", padding: "12px 30px", fontSize: "15px", color: "#fff", cursor: name.trim() ? "pointer" : "default", fontFamily: SANS, fontWeight: 700, letterSpacing: "0.03em" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function GeneratingScreen({ stage }) {
  const messages = {
    1: "Finding the pattern underneath it all.",
    2: "Working through all eleven domains, one at a time.",
    3: "Writing your summary.",
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

function ErrorScreen({ onRetry }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "480px", textAlign: "center" }}>
        <div style={{ color: c.accentPop, fontSize: "15px", fontFamily: SANS, marginBottom: "1.25rem" }}>There was a connection error generating your analysis.</div>
        <button
          onClick={onRetry}
          style={{ background: c.accent, border: "none", borderRadius: "6px", padding: "10px 24px", fontSize: "14px", fontFamily: SANS, fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "0.03em" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// The model writes one continuous document, but the client only ever sees
// the Client Synopsis and the Domain by Domain section, wrapped in explicit
// boundary markers so the synopsis can have its own dynamic, person-specific
// headings without those headings needing to match any fixed text we search
// for, and so Domain by Domain can be pulled out and rendered with the raw
// Q&A interleaved in.
function splitClientAndFullText(fullText) {
  const startMarker = "[[CLIENT_SYNOPSIS_START]]";
  const endMarker = "[[CLIENT_SYNOPSIS_END]]";
  const startIdx = fullText.indexOf(startMarker);
  const endIdx = fullText.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    // Markers missing or malformed — fail safe by showing the client
    // nothing rather than accidentally showing them the practitioner notes.
    return { clientText: "", fullText };
  }

  const clientText = fullText.slice(startIdx + startMarker.length, endIdx).trim();
  // Give Zach's copy readable section breaks instead of raw markers.
  const readableFullText = fullText
    .replace(startMarker, "--- Client Synopsis (what the client saw) ---\n")
    .replace(endMarker, "\n--- End Client Synopsis ---");

  return { clientText, fullText: readableFullText };
}

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

// ---- Q&A BLOCK, rendered from the app's own answer state ----
// Deliberately not model-generated: the model already receives these
// exact question labels and answers as its input, so having it retype
// them back out risks small drift (a dropped option, a reworded label).
// Reading them straight from `answers` and `LIFE_INVENTORY_DOMAINS`
// guarantees the client and Zach both see exactly what was submitted.

function QAList({ domain, answers }) {
  const selections = answers[domain.id] || {};
  if (!domain.groups || !domain.groups.length) return null;

  const detailBlock = domain.detailLabel && selections["_detail"] && selections["_detail"].trim() ? (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ fontSize: domain.detailFirst ? "14px" : "13px", fontWeight: 700, color: domain.detailFirst ? c.textPrimary : c.textSecondary, fontFamily: SANS, marginBottom: "0.3rem" }}>
        {domain.detailLabel}
      </div>
      <div style={{ fontSize: "15px", fontFamily: SERIF, color: c.textPrimary }}>
        {selections["_detail"].trim()}
      </div>
    </div>
  ) : null;

  return (
    <div
      style={{
        marginBottom: "1.5rem",
        background: c.bgInput,
        border: `1px solid ${c.borderMid}`,
        borderRadius: "12px",
        padding: "16px 20px",
      }}
    >
      {domain.detailFirst && detailBlock}
      {domain.groups.map(g => {
        const val = selections[g.key];
        const hasAnswer = val && val.length > 0;
        const followupVal = g.followupTrigger ? selections[g.followupTrigger.key] : undefined;
        const hasFollowup = followupVal && followupVal.trim();
        return (
          <div key={g.key} style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: c.textSecondary, fontFamily: SANS, marginBottom: "0.3rem" }}>
              {g.label}
            </div>
            <div style={{ fontSize: "15px", fontFamily: SERIF, color: hasAnswer ? c.textPrimary : c.textMuted, fontStyle: hasAnswer ? "normal" : "italic" }}>
              {hasAnswer ? val.join(", ") : "Skipped"}
            </div>
            {hasFollowup && (
              <div style={{ marginTop: "0.35rem", fontSize: "14px", fontFamily: SERIF, color: c.textSecondary, fontStyle: "italic" }}>
                {g.followupTrigger.label}: {followupVal.trim()}
              </div>
            )}
          </div>
        );
      })}
      {!domain.detailFirst && detailBlock}
    </div>
  );
}

// withQA + answers are only passed when rendering Domain by Domain — the
// Client Synopsis calls this without them and behaves exactly as before.
// domainByUiTitle maps each h2's exact heading text back to its domain
// object, so a QAList can be inserted right after the heading, before that
// domain's Drain/Recharge content.
function ReportContent({ text, withQA, answers, domainByUiTitle }) {
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
          const domain = withQA && domainByUiTitle ? domainByUiTitle[b.text] : null;
          return (
            <div key={i}>
              <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: SANS, color: c.accent, marginTop: "1.75rem", marginBottom: "0.6rem" }}>
                {b.text}
              </div>
              {domain && <QAList domain={domain} answers={answers} />}
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

function ReadingScreen({ synopsisText, domainByDomainText, answers, domainByUiTitle }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 1.5rem" }}>
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "1.5rem 0 2.5rem" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: c.accent, marginBottom: "0.5rem", fontFamily: SANS }}>
          Your Analysis
        </div>
        {synopsisText ? (
          <ReportContent text={synopsisText} />
        ) : (
          <p style={{ fontSize: "16px", fontFamily: SERIF, lineHeight: 1.75, color: c.textSecondary }}>
            Your intake is complete and has been sent to Zach — thank you. There was an issue formatting your on-screen summary, but nothing was lost; Zach has everything he needs for your session.
          </p>
        )}

        {domainByDomainText && (
          <>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: c.accent,
                marginTop: "3rem",
                marginBottom: "0.5rem",
                paddingTop: "2rem",
                borderTop: `1px solid ${c.borderMid}`,
                fontFamily: SANS,
              }}
            >
              Your Answers, Domain by Domain
            </div>
            <ReportContent
              text={domainByDomainText}
              withQA
              answers={answers}
              domainByUiTitle={domainByUiTitle}
            />
          </>
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

// Built once — maps a domain's exact uiTitle (which is also the exact "## "
// heading text the system prompt requires the model to use for that domain
// in Part Two) back to the domain object, so ReportContent can look up
// "## Your Day" and find the right domain to pull Q&A from.
const domainByUiTitle = Object.fromEntries(LIFE_INVENTORY_DOMAINS.map(d => [d.uiTitle, d]));

// ---- PAYWALL ----

// ---- MAIN APP ----

export default function EnergyAuditInterpreter() {
  const [step, setStep] = useState("name"); // name | intake | generating | done
  const [clientName, setClientName] = useState("");
  const [domainIndex, setDomainIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reading, setReading] = useState(null); // { synopsisText, domainByDomainText, fullText }
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

  // Fire-and-forget: emails the full analysis (including the private
  // Notes for Session One) to Zach. Failure here — e.g. Resend isn't
  // configured yet — must never block or alarm the client; they've
  // already gotten what they came for either way.
  const sendResults = (analysisText) => {
    fetch("/api/send-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName,
        rawAnswers: compileFullInventory(answers),
        analysisText,
      }),
    }).catch(() => {}); // intentionally silent from the client's perspective
  };

  const generateReading = async (resume) => {
    setStep("generating");
    setReadingError(false);
    setLoading(true);

    let history, stage, parts;
    if (resume) {
      ({ history, stage, parts } = resume);
    } else {
      const compiled = compileFullInventory(answers);
      history = [{ role: "user", content: `Here is the client's full Life Inventory (client name: ${clientName}):\n\n${compiled}\n\nWrite Part One (The Core Pattern) now.` }];
      stage = 1;
      parts = {};
    }

    try {
      if (stage === 1) {
        setGeneratingStage(1);
        const part1 = await callAPI(history, 3000);
        parts.partOne = part1;
        history = [...history, { role: "assistant", content: part1 }, { role: "user", content: "Now write Part Two (Drains and Recharges, Domain by Domain)." }];
        stage = 2;
      }
      if (stage === 2) {
        setGeneratingStage(2);
        const part2 = await callAPI(history, 6000);
        parts.partTwo = part2;
        history = [...history, { role: "assistant", content: part2 }, { role: "user", content: "Now write Part Three (the Client Synopsis, wrapped in its markers, and Notes for Session One)." }];
        stage = 3;
      }
      setGeneratingStage(3);
      const part3 = await callAPI(history, 3000);
      const fullText = [parts.partOne, parts.partTwo, part3].join("\n\n");
      const { clientText } = splitClientAndFullText(fullText);
      // Part Two (Domain by Domain) is already fully client-facing text —
      // no splitting needed, it renders as written, with QA interleaved.
      setReading({ synopsisText: clientText, domainByDomainText: parts.partTwo, fullText });
      setStep("reading");
      sendResults(fullText); // not awaited — client doesn't wait on this
    } catch {
      setRetryState({ history, stage, parts });
      setReadingError(true);
      setStep("error");
    }
    setLoading(false);
  };

  const retryReading = () => generateReading(retryState);

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: c.bg, color: c.textPrimary, fontFamily: SERIF, display: "flex", flexDirection: "column" }}>
      <Header />
      {step === "name" ? (
        <NameScreen name={clientName} setName={setClientName} onContinue={() => setStep("intake")} />
      ) : step === "generating" ? (
        <GeneratingScreen stage={generatingStage} />
      ) : step === "reading" ? (
        <ReadingScreen
          synopsisText={reading.synopsisText}
          domainByDomainText={reading.domainByDomainText}
          answers={answers}
          domainByUiTitle={domainByUiTitle}
        />
      ) : step === "error" ? (
        <ErrorScreen onRetry={retryReading} />
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
