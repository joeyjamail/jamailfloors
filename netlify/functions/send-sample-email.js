// Netlify Function: send-sample-email
// Sends email via Resend using RESEND_API_KEY env var
// Docs: https://resend.com/docs/api-reference/emails/send

exports.handler = async function(event) {
  // Allow only POST
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders() };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, phone, zip, notes = '', picks = [], honeypot = '', captchaToken } = body;

    // Honeypot: if filled, pretend success but drop
    if (typeof honeypot === 'string' && honeypot.trim() !== '') {
      return ok({ skipped: true });
    }

    // Basic validation
    if (!name || !email || !phone || !zip || !Array.isArray(picks) || picks.length === 0) {
      return bad({ error: 'missing_fields' });
    }

    // Optional hCaptcha verification if configured
    const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET || '';
    if (HCAPTCHA_SECRET && captchaToken) {
      const verifyResp = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: HCAPTCHA_SECRET, response: captchaToken })
      });
      const vjson = await verifyResp.json();
      if (!vjson.success) {
        return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'captcha_failed' }) };
      }
    }

    // Compose email
    const to = process.env.SALES_TO || 'sales@jamailfloors.com';
    const from = process.env.MAIL_FROM || 'no-reply@jamailfloors.com';
    const subject = `New Sample Request: ${name} (${zip})`;

    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        <h2>New Sample Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>ZIP:</strong> ${escapeHtml(zip)}</p>
        ${notes ? `<p><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : ''}
        <p><strong>Picks (${picks.length}):</strong> ${picks.map(p => escapeHtml(String(p))).join(', ')}</p>
        <hr>
        <p style="color:#777;font-size:12px">Sent from jamailfloors.com</p>
      </div>
    `;

    // Send via Resend
    const RESEND_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_KEY) {
      return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'missing_resend_key' }) };
    }

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return { statusCode: 502, headers: corsHeaders(), body: JSON.stringify({ error: 'email_send_failed', details: txt }) };
    }

    const data = await r.json();
    return ok({ id: data.id || null });
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'server_error', message: String(err) }) };
  }
}

function ok(body) { return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ ok: true, ...body }) }; }
function bad(body) { return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify(body) }; }
function corsHeaders() { return { 'Content-Type': 'application/json; charset=utf-8' }; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
