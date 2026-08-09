export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { clientName, rawAnswers, analysisText } = req.body;
  if (!clientName || !analysisText) {
    return res.status(400).json({ error: "Missing clientName or analysisText" });
  }

  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const html = `
    <div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; line-height: 1.7; color: #1e1a16;">
      <h1 style="font-family: sans-serif; font-size: 20px;">New Client Intake — ${escapeHtml(clientName)}</h1>
      <h2 style="font-family: sans-serif; font-size: 15px; margin-top: 2rem;">Full Analysis</h2>
      <div style="white-space: pre-wrap;">${escapeHtml(analysisText)}</div>
      <h2 style="font-family: sans-serif; font-size: 15px; margin-top: 2.5rem; border-top: 1px solid #ccc; padding-top: 1.5rem;">Raw Answers (Life Inventory)</h2>
      <div style="white-space: pre-wrap; font-size: 14px; color: #444;">${escapeHtml(rawAnswers || "")}</div>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESULTS_FROM_EMAIL,
        to: process.env.RESULTS_TO_EMAIL,
        subject: `New Client Intake — ${clientName}`,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown server error" });
  }
}
