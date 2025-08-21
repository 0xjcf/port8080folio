/**
 * Required secrets/vars:
 *   RESEND_API_KEY (Secret)
 *   TO_EMAIL = "bluejf.llc@gmail.com"
 *   FROM_EMAIL = "Website <noreply@resend.dev>"
 *
 *   SITE_URL = "https://0xjcf.github.io/port8080folio"
 *
 *   // Contact form:
 *   CONTACT_FORM_URL   = "https://0xjcf.github.io/port8080folio/#contact-form"
 *   CONTACT_THANKS_URL = "https://0xjcf.github.io/port8080folio/contact-thanks.html"
 *
 *   // Newsletter:
 *   RESEND_AUDIENCE_ID     = "aud_xxxxxxxxxxxxx"
 *   NEWSLETTER_FORM_URL    = "https://0xjcf.github.io/port8080folio/#newsletter-form"
 *   NEWSLETTER_THANKS_URL  = "https://0xjcf.github.io/port8080folio/newsletter-thanks.html"
 *   // Optional:
 *   // NEWSLETTER_CONFIRM_URL = "https://0xjcf.github.io/port8080folio/newsletter-check-email.html"
 *
 *   // Environment toggle:
 *   ENV = "prod" | "dev"
 */


function getUrls(env) {
  const baseSiteUrl = env.SITE_URL || 'https://0xjcf.github.io/port8080folio';
  // Validate base URL so we don't build malformed URLs later
  try {
    // Throws on invalid URL
    new URL(baseSiteUrl);
  } catch {
    throw new Error('Invalid SITE_URL configuration');
  }
  const SITE_URL = baseSiteUrl.endsWith('/') ? baseSiteUrl : baseSiteUrl + '/';

  // ---- Contact ----
  const CONTACT_THANKS = safeSameOrigin(env.CONTACT_THANKS_URL, SITE_URL)
    || new URL('contact-thanks.html', SITE_URL).toString();

  const CONTACT_FORM = safeSameOrigin(env.CONTACT_FORM_URL, SITE_URL)
    || new URL('#contact-form', SITE_URL).toString();

  // ---- Newsletter ----
  const NEWSLETTER_THANKS = safeSameOrigin(env.NEWSLETTER_THANKS_URL, SITE_URL)
    || new URL('newsletter-thanks.html', SITE_URL).toString();

  const NEWSLETTER_FORM = safeSameOrigin(env.NEWSLETTER_FORM_URL, SITE_URL)
    || new URL('#newsletter-form', SITE_URL).toString();

  const NEWSLETTER_CONFIRM = safeSameOrigin(env.NEWSLETTER_CONFIRM_URL, SITE_URL)
    || new URL('newsletter-check-email.html', SITE_URL).toString();

  return {
    SITE_URL,
    CONTACT_THANKS,
    CONTACT_FORM,
    NEWSLETTER_THANKS,
    NEWSLETTER_FORM,
    NEWSLETTER_CONFIRM
  };
}


function safeSameOrigin(candidate, siteUrl) {
  if (!candidate) return null;
  try {
    const site = new URL(siteUrl);
    const test = new URL(candidate);
    return test.origin === site.origin ? test.toString() : null;
  } catch { return null; }
}

// Append ?error=code before any #fragment
function withError(u, code) {
  try {
    const url = new URL(u);
    url.searchParams.set('error', code);
    return url.toString();
  } catch {
    const [base, hash] = String(u).split('#');
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}error=${encodeURIComponent(code)}${hash ? `#${hash}` : ''}`;
  }
}

// Only allow same-origin POSTs (Origin preferred, else Referer path under SITE_URL)
function isAllowedOrigin(req, siteUrl) {
  let site;
  try { site = new URL(siteUrl); } catch { return false; }
  const origin  = req.headers.get('origin')  || '';
  const referer = req.headers.get('referer') || '';

  if (origin) {
    try { return new URL(origin).origin === site.origin; } catch { return false; }
  }
  if (referer) {
    try {
      const ref = new URL(referer);
      if (ref.origin !== site.origin) return false;
      const base = site.pathname.endsWith('/') ? site.pathname : site.pathname + '/';
      return ref.pathname === site.pathname || ref.pathname.startsWith(base);
    } catch { return false; }
  }
  return false;
}

// Guardrails reused from your current worker
function isValidEmail(e) {
  if (!e || e.length > 254) return false;
  // Disallow newlines to avoid header injection and weird parsing
  if (/\r|\n/.test(e)) return false;
  // RFC 5322-ish (ASCII-only): local@domain with nested labels & hyphens.
  // NOTE: This rejects internationalized/Unicode emails. If you need IDNs,
  // consider punycode for the domain and a looser local-part policy.
  const re =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(e);
}
function isReasonableSize(req, maxBytes = 50 * 1024) {
  const len = req.headers.get('content-length');
  if (!len) return true;
  const n = Number(len);
  return Number.isFinite(n) && n <= maxBytes;
}
function escapeHtml(s) {
  const str = s == null ? '' : String(s);
  const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;' };
  return str.replace(/[&<>"'\/`=]/g, m => map[m]);
}

export default {
  async fetch(request, env) {
    // Fail-safe: if SITE_URL (or other URL vars) are malformed, return a clean 500
    let urls;
    try {
      urls = getUrls(env);
    } catch {
      return new Response('Server misconfiguration: invalid SITE_URL', { status: 500 });
    }
    const { SITE_URL, CONTACT_THANKS, CONTACT_FORM, NEWSLETTER_THANKS, NEWSLETTER_FORM } = urls;

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: { 'Allow': 'POST' } });
    }

    // Optional rate limit: only check for POST requests to form endpoints
    if (env.RATE_LIMIT_KV) {
      const url = new URL(request.url);
      const isFormEndpoint = url.pathname.startsWith('/api/contact') || url.pathname.startsWith('/api/newsletter');
      
      if (isFormEndpoint) {
        const shouldBlock = await isRateLimited(env, request);
        if (shouldBlock) {
          // Send to the appropriate form with an error code
          const back = url.pathname.startsWith('/api/newsletter') ? NEWSLETTER_FORM : CONTACT_FORM;
          return Response.redirect(withError(back, 'rate_limited'), 303);
        }
      }
    }

    // Shared origin/ctype/size checks
    if (!isAllowedOrigin(request, SITE_URL)) {
      // Decide which form to send back to, based on path
      const url = new URL(request.url);
      const back = url.pathname.startsWith('/api/newsletter') ? NEWSLETTER_FORM : CONTACT_FORM;
      return Response.redirect(withError(back, 'origin'), 303);
    }
    const ctype = request.headers.get('content-type') || '';
    if (!ctype.includes('application/x-www-form-urlencoded') && !ctype.includes('multipart/form-data')) {
      const url = new URL(request.url);
      const back = url.pathname.startsWith('/api/newsletter') ? NEWSLETTER_FORM : CONTACT_FORM;
      return Response.redirect(withError(back, 'ctype'), 303);
    }
    if (!isReasonableSize(request)) {
      const url = new URL(request.url);
      const back = url.pathname.startsWith('/api/newsletter') ? NEWSLETTER_FORM : CONTACT_FORM;
      return Response.redirect(withError(back, 'too_large'), 303);
    }

    const url = new URL(request.url);

    // Route POSTs:
    if (url.pathname === '/api/newsletter') {
      return handleNewsletter(request, env);
    }
    if (url.pathname === '/api/contact' || url.pathname === '/' || url.pathname === '') {
      return handleContact(request, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};

// -------------------- Contact (unchanged behavior) --------------------
async function handleContact(request, env) {
  const { CONTACT_THANKS, SITE_URL } = getUrls(env);
  const CONTACT_ERROR = new URL('contact-error.html', SITE_URL).toString();

  try {
    const form = await request.formData();
    const name      = (form.get('name')     || '').toString().trim();
    const email     = (form.get('email')    || '').toString().trim();
    const message   = (form.get('message')  || '').toString().trim();
    const website   = (form.get('website')  || '').toString(); // honeypot
    const timestamp = (form.get('timestamp')|| '').toString();

    if (website) return Response.redirect(CONTACT_THANKS, 303);

    if (!name || name.length < 2 || name.length > 70) {
      return Response.redirect(CONTACT_ERROR, 303);
    }
    if (!isValidEmail(email)) {
      return Response.redirect(CONTACT_ERROR, 303);
    }
    if (!message || message.length < 10 || message.length > 5000) {
      return Response.redirect(CONTACT_ERROR, 303);
    }

    if (timestamp) {
      const elapsed = Date.now() - parseInt(timestamp, 10);
      if (!Number.isNaN(elapsed) && elapsed < 3000) {
        return Response.redirect(CONTACT_ERROR, 303);
      }
    }

    const ok = await sendEmail(env, { name, email, message });
    if (!ok) return Response.redirect(CONTACT_ERROR, 303);

    return Response.redirect(CONTACT_THANKS, 303);
  } catch {
    return Response.redirect(CONTACT_ERROR, 303);
  }
}

async function sendEmail(env, { name, email, message }) {
  const from = env.FROM_EMAIL || 'Website <noreply@resend.dev>';
  const to   = env.TO_EMAIL   || 'bluejf.llc@gmail.com';
  const sanitizedName = name.replace(/[\r\n]/g, ' ').trim().substring(0, 50);

  const payload = {
    from,
    to: [to],
    reply_to: email,
    subject: `Contact Form: Message from ${sanitizedName}`,
    text: `Name: ${sanitizedName}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `<h2>New Contact Form Submission</h2>
           <p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
           <p><strong>Email:</strong> ${escapeHtml(email)}</p>
           <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g,'<br>')}</p>`
  };

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      return true;
    } else {
      const body = await resp.text().catch(() => 'Unable to read response body');
      // Redact email addresses from logs to protect PII
      const redactedBody = body.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]');
      
      if (env.ENV === 'prod') {
        // Production: only log status, suppress response body entirely
        console.error(`Email send failed: ${resp.status} ${resp.statusText}`);
      } else {
        // Development: log redacted body for debugging
        console.error(`Email send failed: ${resp.status} ${resp.statusText}`, redactedBody);
      }
      return false;
    }
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// -------------------- Newsletter --------------------
async function handleNewsletter(request, env) {
  const { NEWSLETTER_THANKS, SITE_URL } = getUrls(env);
  const NEWSLETTER_ERROR = new URL('newsletter-error.html', SITE_URL).toString();

  try {
    const form = await request.formData();
    const email     = (form.get('EMAIL') || form.get('email') || '').toString().trim();
    const website   = (form.get('website') || '').toString();         // honeypot
    const timestamp = (form.get('timestamp') || '').toString();

    if (website) return Response.redirect(NEWSLETTER_THANKS, 303);
    if (!isValidEmail(email)) {
      return Response.redirect(NEWSLETTER_ERROR, 303);
    }

    // Light bot timing (optional)
    if (timestamp) {
      const elapsed = Date.now() - parseInt(timestamp, 10);
      if (!Number.isNaN(elapsed) && elapsed < 1500) {
        // Too fast → block submission
        return Response.redirect(NEWSLETTER_ERROR, 303);
      }
    }

    // Local/dev: don't hit external APIs
    if (env.ENV !== 'prod') {
      return Response.redirect(NEWSLETTER_THANKS, 303);
    }

    // PROD: add contact to Resend Audience
    const ok = await addContactToAudience(env, email);
    if (!ok) {
      return Response.redirect(NEWSLETTER_ERROR, 303);
    }

    return Response.redirect(NEWSLETTER_THANKS, 303);
  } catch {
    return Response.redirect(NEWSLETTER_ERROR, 303);
  }
}

async function addContactToAudience(env, email) {
  const audienceId = env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    // No audience configured → treat as soft-fail or success.
    // Prefer success to avoid blocking signups until you set the ID.
    return true;
  }

  // Resend supports creating contacts under an Audience via API
  const url = `https://api.resend.com/audiences/${audienceId}/contacts`;
  
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        unsubscribed: false
        // first_name, last_name, metadata... can be added later
      })
    });

    // Common non-200s: 400 invalid, 409 already exists, 429 rate limit, 5xx upstream
    // Treat 200–299, 409 (already exists), and (optionally) 429 (rate-limited) as "ok" for UX smoothness.
    if (resp.ok || resp.status === 409 || resp.status === 429) return true;
    const body = await resp.text().catch(() => 'Unable to read response body');
    console.error(`Resend audience add failed: ${resp.status} ${resp.statusText}; email=[redacted]`);
    // (Optional) In non-prod you could log body; avoid PII/verbose logs in prod.
    if (env.ENV !== 'prod') {
      console.error('Upstream (redacted) body:', body.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]'));
    }
    return false;
  } catch (error) {
    console.error(`Failed to add contact to audience: audienceId=${audienceId}, email=${email}`, error);
    return false;
  }
}

/**
 * Simple KV-based rate limiting (IP + path), 60s window with a small burst.
 * Bind a KV namespace named RATE_LIMIT_KV in wrangler.toml to enable.
 */
async function isRateLimited(env, request) {
  try {
    // Prefer Cloudflare's direct IP, else first IP in X-Forwarded-For
    const cfip = request.headers.get('cf-connecting-ip');
    const xff = request.headers.get('x-forwarded-for');
    const ip = (cfip || (xff ? xff.split(',')[0] : '')).trim();
    if (!ip) return false;
    const url = new URL(request.url);
    const key = `rl:${url.pathname}:${ip}`;
    const current = parseInt((await env.RATE_LIMIT_KV.get(key)) || '0', 10) || 0;
    // Allow first 5 requests per 60 seconds per IP+endpoint
    const limit = 5;
    if (current >= limit) return true;
    // Increment and set a short TTL (60s)
    await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: 60 });
    return false;
  } catch {
    // Fail-open: if KV errors, don't block legitimate traffic
    return false;
  }
}
