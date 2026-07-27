/* =========================================================================
   PRAYKI · Bestellung abschließen (nach erfolgreicher Stripe-Zahlung)
   -------------------------------------------------------------------------
   GET ?session_id=cs_...  – ruft die Stripe-Session ab, prüft serverseitig,
   dass wirklich bezahlt wurde, schickt dir die Bestell-Mail und liefert
   eine Zusammenfassung für die Bestätigungsseite zurück.
   ========================================================================= */

const Stripe = require('stripe');
const { sendEmail, escapeHtml } = require('../lib/resend');

function euro(cents) {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN || '*');

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(501).json({ error: 'stripe_not_configured' });

  const url = new URL(req.url, `https://${req.headers.host}`);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) return res.status(400).json({ error: 'session_id fehlt' });

  const stripe = new Stripe(secret);
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
    if (session.payment_status !== 'paid')
      return res.status(402).json({ error: 'nicht bezahlt', status: session.payment_status });

    const items = (session.line_items && session.line_items.data) || [];
    const summaryItems = items.map((li) => ({
      qty: li.quantity,
      name: li.description,
      lineTotal: euro(li.amount_total),
    }));
    const total = euro(session.amount_total || 0);
    const cust = session.customer_details || {};
    const ship = (session.shipping_details && session.shipping_details.address) || cust.address || {};
    const addr = [
      ship.line1,
      ship.line2,
      [ship.postal_code, ship.city].filter(Boolean).join(' '),
      ship.country,
    ].filter(Boolean).join(', ');

    // Bestell-Mail an den Shop
    const rows = summaryItems
      .map(
        (i) =>
          `<tr><td style="padding:4px 0">${i.qty}× ${escapeHtml(i.name)}</td><td style="padding:4px 0;text-align:right">${escapeHtml(i.lineTotal)}</td></tr>`
      )
      .join('');
    await sendEmail({
      subject: `Neue BEZAHLTE Bestellung – ${euro(session.amount_total || 0)}`,
      replyTo: cust.email,
      html: `<h2>Neue bezahlte Bestellung ✅</h2>
        <p><strong>Kunde:</strong> ${escapeHtml(cust.name || '')} &lt;${escapeHtml(cust.email || '')}&gt;</p>
        <p><strong>Lieferadresse:</strong> ${escapeHtml(addr)}</p>
        <table style="border-collapse:collapse;width:100%;max-width:480px">${rows}</table>
        <p style="font-size:16px"><strong>Gesamt: ${escapeHtml(total)}</strong></p>
        <p style="color:#888;font-size:12px">Stripe-Session: ${escapeHtml(session.id)}</p>`,
    }).catch((e) => console.error('Mailversand fehlgeschlagen:', e));

    return res.status(200).json({
      ok: true,
      order: { id: session.id.slice(-8).toUpperCase(), total, email: cust.email, items: summaryItems },
    });
  } catch (e) {
    return res.status(502).json({ error: 'Stripe-Fehler', detail: String(e && e.message || e) });
  }
};
