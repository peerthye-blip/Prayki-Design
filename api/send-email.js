/* =========================================================================
   MARLINÉA · Serverless-Funktion zum Versenden von E-Mails über Resend
   -------------------------------------------------------------------------
   WICHTIG: Der Resend-API-Key wird AUSSCHLIESSLICH als Server-Umgebungs-
   variable RESEND_API_KEY gelesen – niemals im Code oder im Frontend!

   Kompatibel mit Vercel (Node 18+, /api-Ordner). Für Netlify/Cloudflare
   siehe README (gleiche Logik, andere Signatur).

   Erwartetes POST-JSON:
     { type: "contact", name, email, message }
     { type: "order",   order: { id, customer:{name,email,address}, items:[...], total } }
   ========================================================================= */

const RECIPIENT = process.env.MAIL_TO || 'peer.thye@icloud.com';
// Ohne eigene verifizierte Domain funktioniert der Resend-Testabsender.
// Mit eigener Domain: MAIL_FROM z. B. "Marlinéa <shop@deine-domain.de>" setzen.
const FROM = process.env.MAIL_FROM || 'Marlinéa <onboarding@resend.dev>';

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ''));

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey)
    return res
      .status(500)
      .json({ error: 'RESEND_API_KEY fehlt – als Server-Umgebungsvariable setzen.' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const type = body.type || 'contact';
  let subject, html, replyTo;

  if (type === 'order' && body.order) {
    const o = body.order;
    const rows = (o.items || [])
      .map(
        (i) =>
          `<tr><td style="padding:4px 0">${i.qty}× ${escapeHtml(i.name)} · ${escapeHtml(
            i.size
          )} · ${escapeHtml(i.color)}</td><td style="padding:4px 0;text-align:right">${escapeHtml(
            i.lineTotal
          )}</td></tr>`
      )
      .join('');
    subject = `Neue Bestellung – #${escapeHtml(o.id || '')}`;
    html = `<h2>Neue Bestellung #${escapeHtml(o.id || '')}</h2>
      <p><strong>Kunde:</strong> ${escapeHtml(o.customer?.name || '')} &lt;${escapeHtml(
      o.customer?.email || ''
    )}&gt;</p>
      <p><strong>Lieferadresse:</strong> ${escapeHtml(o.customer?.address || '')}</p>
      <table style="border-collapse:collapse;width:100%;max-width:480px">${rows}</table>
      <p style="font-size:16px"><strong>Gesamt: ${escapeHtml(o.total || '')}</strong></p>`;
    if (isEmail(o.customer?.email)) replyTo = o.customer.email;
  } else {
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const message = (body.message || '').trim();
    if (!name || !isEmail(email) || !message)
      return res
        .status(400)
        .json({ error: 'Bitte Name, gültige E-Mail und Nachricht angeben.' });
    subject = `Neue Kontaktanfrage von ${name}`;
    html = `<h2>Neue Kontaktanfrage</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Nachricht:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`;
    replyTo = email;
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [RECIPIENT],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: 'Resend-Fehler', detail: data });
    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: 'Serverfehler', detail: String(e) });
  }
};
