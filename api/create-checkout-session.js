export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const origin = req.headers.origin || `https://${req.headers.host}`;

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", `${origin}/?session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${origin}/?checkout=cancelled`);
    params.append("line_items[0][quantity]", "1");
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][unit_amount]", "4400");
    params.append("line_items[0][price_data][product_data][name]", "Voltage Wellness — Energy Audit");
    params.append("line_items[0][price_data][product_data][description]", "A full nine-domain energetic life inventory, guided anchor analysis, and comprehensive written Reading.");

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ url: data.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown server error" });
  }
}
