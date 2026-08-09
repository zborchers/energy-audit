export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session_id } = req.body;
  if (!session_id) {
    return res.status(400).json({ error: "Missing session_id" });
  }

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session_id)}`, {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ paid: false, error: data.error?.message || "Session lookup failed" });
    }

    const paid = data.payment_status === "paid";
    return res.status(200).json({ paid });
  } catch (err) {
    return res.status(500).json({ paid: false, error: err.message || "Unknown server error" });
  }
}
