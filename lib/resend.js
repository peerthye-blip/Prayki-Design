/* =========================================================================
   PRAYKI · Kleiner Resend-Helfer (E-Mail-Versand)
   Key ausschließlich aus RESEND_API_KEY (Server-Umgebungsvariable).
   ========================================================================= */

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

async function sendEmail({ subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY fehlt');
  const to = process.env.MAIL_TO || 'peer.thye@icloud.com';
  const from = process.env.MAIL_FROM || 'Prayki <onboarding@resend.dev>';

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('Resend-Fehler: ' + JSON.stringify(data));
  return data;
}

module.exports = { sendEmail, escapeHtml };
