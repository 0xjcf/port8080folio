/**
 * Cloudflare Worker for Contact Form Processing (hardened)
 * - Uses env vars for addresses (no secrets in code)
 * - Validates Origin/Referer, content-type, size, and email header injection
 * - Absolute redirects to GitHub Pages "contact-thanks.html" and back to form
 *
 * Required Cloudflare variables (Worker Settings → Variables):
 *   RESEND_API_KEY (Secret)
 *   TO_EMAIL = "bluejf.llc@gmail.com"
 *   FROM_EMAIL = "Website <noreply@resend.dev>"  // Resend sandbox/verified sender
 * 
 * Optional Cloudflare variables:
 *   SITE_URL = "https://0xjcf.github.io/port8080folio"
 *   THANKS_URL = "https://0xjcf.github.io/port8080folio/contact-thanks.html"
 *   FORM_URL = "https://0xjcf.github.io/port8080folio/#contact-forms"
 */

// URLs can be configured via environment variables or default to GitHub Pages
function getUrls(env) {
  const baseSiteUrl = env.SITE_URL || 'https://0xjcf.github.io/port8080folio';
  // Normalize SITE_URL to ensure it ends with a trailing slash to preserve subpaths
  const SITE_URL = baseSiteUrl.endsWith('/') ? baseSiteUrl : baseSiteUrl + '/';
  
  // Hardening: validate THANKS_URL and FORM_URL have same origin as SITE_URL
  let THANKS_URL = env.THANKS_URL;
  let FORM_URL = env.FORM_URL;
  
  try {
    const siteOrigin = new URL(SITE_URL).origin;
    
    // Validate THANKS_URL origin or fall back to default
    if (THANKS_URL) {
      try {
        if (new URL(THANKS_URL).origin !== siteOrigin) {
          THANKS_URL = null; // Fall back to default
        }
      } catch {
        THANKS_URL = null; // Invalid URL, fall back to default
      }
    }
    
    // Validate FORM_URL origin or fall back to default  
    if (FORM_URL) {
      try {
        if (new URL(FORM_URL).origin !== siteOrigin) {
          FORM_URL = null; // Fall back to default
        }
      } catch {
        FORM_URL = null; // Invalid URL, fall back to default
      }
    }
  } catch {
    // SITE_URL is invalid, fall back to defaults
    THANKS_URL = null;
    FORM_URL = null;
  }
  
  // Set defaults if not provided or validation failed
  THANKS_URL = THANKS_URL || new URL('contact-thanks.html', SITE_URL).toString();
  FORM_URL = FORM_URL || new URL('#contact-forms', SITE_URL).toString();
  
  return { SITE_URL, THANKS_URL, FORM_URL };
}

// Safely append ?error=... before any #fragment
function formUrlWithError(formUrl, code) {
  try {
    const u = new URL(formUrl);
    u.searchParams.set('error', code);
    return u.toString();
  } catch {
    // Fallback for non-absolute values (shouldn't happen with defaults)
    const [base, hash] = String(formUrl).split('#');
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}error=${encodeURIComponent(code)}${hash ? `#${hash}` : ''}`;
  }
}

// Allow POSTs only from your site (Origin preferred, else Referer)
function isAllowedOrigin(req, siteUrl) {
  let site;
  try {
    site = new URL(siteUrl);
  } catch {
    // Misconfigured SITE_URL → deny
    return false;
  }
  const origin  = req.headers.get('origin')   || '';
  const referer = req.headers.get('referer') || '';

  // If Origin exists, require exact origin match (scheme+host+port)
  if (origin) {
    try {
      return new URL(origin).origin === site.origin;
    } catch {
      return false;
    }
  }
  // Fallback: Referer must be same-origin AND either exact match or under the configured site path
  if (referer) {
    try {
      const ref = new URL(referer);
      if (ref.origin !== site.origin) return false;
      
      // Allow exact pathname match OR paths that start with site path + slash
      const sitePathWithSlash = site.pathname.endsWith('/') ? site.pathname : site.pathname + '/';
      return ref.pathname === site.pathname || ref.pathname.startsWith(sitePathWithSlash);
    } catch {
      return false;
    }
  }
  return false;
}

// Basic email shape + guard against header injection
function isValidEmail(e) {
  if (!e || e.length > 254) return false;
  if (/\r|\n/.test(e)) return false;  // prevent Reply-To header injection
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// Very small size cap; enough for typical contact messages.
// If your Worker is behind a CDN, clients usually send Content-Length.
function isReasonableSize(req, maxBytes = 50 * 1024) {
  const len = req.headers.get('content-length');
  if (!len) return true; // allow if unknown; FormData parsing may still fail large bodies
  const n = Number(len);
  return Number.isFinite(n) && n <= maxBytes;
}

// Comprehensive HTML escaping for XSS protection
function escapeHtml(s) {
  // Coerce input to string, handling null/undefined and non-string types
  const str = s == null ? '' : String(s);
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',   // Use hex entity for consistency
    '/': '&#x2F;',   // Escape forward slash to prevent script context breakout
    '`': '&#x60;',   // Escape backtick for template literals
    '=': '&#x3D;'    // Escape equals to prevent attribute injection
  };
  
  return str.replace(/[&<>"'\/`=]/g, (m) => map[m]);
}

export default {
  async fetch(request, env) {
    const { SITE_URL, THANKS_URL, FORM_URL } = getUrls(env);
    
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: { 'Allow': 'POST' } });
    }

    // Block cross-site posts (keeps random sites from abusing your endpoint)
    if (!isAllowedOrigin(request, SITE_URL)) {
      return Response.redirect(formUrlWithError(FORM_URL, 'origin'), 303);
    }

    // Only accept standard HTML form posts
    const ctype = request.headers.get('content-type') || '';
    if (!ctype.includes('application/x-www-form-urlencoded') && !ctype.includes('multipart/form-data')) {
      return Response.redirect(formUrlWithError(FORM_URL, 'ctype'), 303);
    }

    // Refuse oversized submissions
    if (!isReasonableSize(request)) {
      return Response.redirect(formUrlWithError(FORM_URL, 'too_large'), 303);
    }

    try {
      const form = await request.formData();
      const name      = (form.get('name')     || '').toString().trim();
      const email     = (form.get('email')    || '').toString().trim();
      const message   = (form.get('message')  || '').toString().trim();
      const website   = (form.get('website')  || '').toString(); // honeypot
      const timestamp = (form.get('timestamp')|| '').toString();

      // Honeypot → pretend success
      if (website) return Response.redirect(THANKS_URL, 303);

      // Validate fields
      if (!name || name.length < 2 || name.length > 70) {
        return Response.redirect(formUrlWithError(FORM_URL, 'invalid_name'), 303);
      }
      if (!isValidEmail(email)) {
        return Response.redirect(formUrlWithError(FORM_URL, 'invalid_email'), 303);
      }
      if (!message || message.length < 10 || message.length > 5000) {
        return Response.redirect(formUrlWithError(FORM_URL, 'invalid_message'), 303);
      }

      // Simple bot timing (JS sets timestamp; JS-off users skip)
      if (timestamp) {
        const elapsed = Date.now() - parseInt(timestamp, 10);
        if (!Number.isNaN(elapsed) && elapsed < 3000) {
          return Response.redirect(THANKS_URL, 303);
        }
      }

      // Optional: ultra-light rate limit by IP (best-effort; no KV/DO)
      // const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0';
      // (Implement with KV/Durable Object if you start seeing abuse.)

      // Send email via Resend
      const sendOk = await sendEmail(env, { name, email, message });
      if (!sendOk) {
        return Response.redirect(formUrlWithError(FORM_URL, 'send_failed'), 303);
      }

      return Response.redirect(THANKS_URL, 303);
    } catch (_e) {
      // Don't log PII; just bounce back
      return Response.redirect(formUrlWithError(FORM_URL, 'processing'), 303);
    }
  }
};

async function sendEmail(env, { name, email, message }) {
  const from = env.FROM_EMAIL || 'Website <noreply@resend.dev>';  // DO NOT use Gmail here
  const to   = env.TO_EMAIL   || 'bluejf.llc@gmail.com';          // Your Gmail inbox

  // Sanitize name for use in email subject to prevent CRLF injection
  const sanitizedName = name.replace(/[\r\n]/g, ' ').trim().substring(0, 50);

  const payload = {
    from,
    to: [to],
    reply_to: email,  // OK: clients will reply to the visitor
    subject: `Contact Form: Message from ${sanitizedName}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `<h2>New Contact Form Submission</h2>
           <p><strong>Name:</strong> ${escapeHtml(name)}</p>
           <p><strong>Email:</strong> ${escapeHtml(email)}</p>
           <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g,'<br>')}</p>`
  };

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return resp.ok;
}