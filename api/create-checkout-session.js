/* =========================================================================
   PRAYKI · Stripe-Checkout-Session erstellen
   -------------------------------------------------------------------------
   Erwartet POST { items: [{ id, size, color, qty }] }.
   Preise kommen ausschließlich aus lib/catalog.js (nie aus dem Frontend).
   STRIPE_SECRET_KEY liegt als Server-Umgebungsvariable vor.
   ========================================================================= */

const Stripe = require('stripe');
const CATALOG = require('../lib/catalog');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.STRIPE_SECRET_KEY;
  // Kein Key -> Frontend fällt auf den einfachen (zahlungslosen) Checkout zurück
  if (!secret) return res.status(501).json({ error: 'stripe_not_configured' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const items = (body && body.items) || [];
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'Warenkorb ist leer.' });

  // Line-Items serverseitig aus dem Katalog aufbauen
  const line_items = [];
  for (const it of items) {
    const p = CATALOG[it.id];
    if (!p) continue;
    let qty = Math.max(1, parseInt(it.qty, 10) || 1);
    if (p.maxOrder) qty = Math.min(qty, p.maxOrder);
    const variant = [it.size, it.color].filter(Boolean).join(' · ');
    line_items.push({
      quantity: qty,
      price_data: {
        currency: 'eur',
        unit_amount: p.price,
        product_data: { name: variant ? `${p.name} – ${variant}` : p.name },
      },
    });
  }
  if (line_items.length === 0)
    return res.status(400).json({ error: 'Keine gültigen Artikel.' });

  const stripe = new Stripe(secret);
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = process.env.SITE_URL || `${proto}://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      shipping_address_collection: { allowed_countries: ['DE', 'AT', 'CH'] },
      success_url: `${origin}/?paid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
    });
    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(502).json({ error: 'Stripe-Fehler', detail: String(e && e.message || e) });
  }
};
