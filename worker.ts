/**
 * Required secrets/vars:
 *   RESEND_API_KEY (Secret)
 *   TO_EMAIL = "to@example.com"               // Configure via environment variables
 *   FROM_EMAIL = "Website <no-reply@example.com>"  // Configure via environment variables
 *
 *   SITE_URL = "https://0xjcf.com"

 *   // Contact form (REQUIRED – no defaults/fallbacks; must be absolute & same-origin with SITE_URL):
 *   CONTACT_FORM_URL   = "https://0xjcf.com/#contact-form"        (example)
 *   CONTACT_THANKS_URL = "https://0xjcf.com/contact-thanks.html"  (example)
 *
 *   // Newsletter:
 *   RESEND_AUDIENCE_ID     = "aud_xxxxxxxxxxxxx"
 *   NEWSLETTER_FORM_URL    = "https://0xjcf.com/#newsletter-form"
 *   NEWSLETTER_THANKS_URL  = "https://0xjcf.com/newsletter-thanks.html"
 *   // Optional:
 *   // NEWSLETTER_CONFIRM_URL = "https://0xjcf.com/newsletter-check-email.html"
 *
 *   // Environment toggle:
 *   ENV = "prod" | "dev"
 */

import { email, pipe, safeParse, string } from 'valibot';

// Types for Cloudflare Worker environment and KV without using `any`.
// Keep minimal and allow TS to infer where possible.
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  RESEND_API_KEY: string;
  TO_EMAIL?: string;
  FROM_EMAIL?: string;
  SITE_URL?: string;
  ALLOWED_ORIGINS?: string;
  CONTACT_FORM_URL: string;        // REQUIRED
  CONTACT_THANKS_URL: string;      // REQUIRED
  RESEND_AUDIENCE_ID?: string;
  NEWSLETTER_FORM_URL?: string;
  NEWSLETTER_THANKS_URL?: string;
  NEWSLETTER_CONFIRM_URL?: string;
  ENV?: 'prod' | 'dev';
  CONTACT_MIN_TIME?: string;
  CONTACT_MAX_AGE_MS?: string;
  NEWSLETTER_MIN_TIME?: string;
  RATE_LIMIT_KV?: KVNamespace;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

type ExportedHandler<E = unknown> = {
  fetch(request: Request, env: E, ctx: ExecutionContext): Promise<Response> | Response;
};

/**
 * Fetch with timeout helper using AbortController
 * @param url - URL to fetch
 * @param options - fetch options
 * @param timeoutMs - timeout in milliseconds (default: 30 seconds)
 * @returns Promise<Response>
 * @throws Error with timeout message if request times out
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30_000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }

    // Re-throw other errors unchanged
    throw error;
  }
}


function getUrls(env: Env) {
  const baseSiteUrl = env.SITE_URL;
  if (!baseSiteUrl) {
    throw new Error('SITE_URL missing');
  }

  // Construct URL once and derive normalized SITE_URL from it
  let siteUrlInstance;
  try {
    siteUrlInstance = new URL(baseSiteUrl);
  } catch {
    throw new Error('Invalid SITE_URL configuration');
  }

  // Derive normalized SITE_URL with trailing slash
  const SITE_URL = siteUrlInstance.href.endsWith('/') ? siteUrlInstance.href : siteUrlInstance.href + '/';

  // ---- Contact (required, fail-fast, no fallback) ----
  const CONTACT_THANKS = safeSameOrigin(env.CONTACT_THANKS_URL, SITE_URL);
  if (!CONTACT_THANKS) {
    throw new Error('CONTACT_THANKS_URL missing, invalid, or not same-origin with SITE_URL');
  }
  const CONTACT_FORM = safeSameOrigin(env.CONTACT_FORM_URL, SITE_URL);
  if (!CONTACT_FORM) {
    throw new Error('CONTACT_FORM_URL missing, invalid, or not same-origin with SITE_URL');
  }

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
  } as const;
}


function safeSameOrigin(candidate: string | undefined, siteUrl: string): string | null {
  if (!candidate) return null;
  try {
    const site = new URL(siteUrl);
    const test = new URL(candidate);
    return test.origin === site.origin ? test.toString() : null;
  } catch { return null; }
}

// Append ?error=code before any #fragment
function withError(u: string, code: string): string {
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

function getAllowedOrigins(env: Env): Set<string> {
  const raw = env.ALLOWED_ORIGINS;
  if (raw) {
    const origins = raw
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => {
        if (!entry) return false;
        try {
          new URL(entry);
          return true;
        } catch {
          console.warn(`Invalid origin in ALLOWED_ORIGINS: ${entry}`);
          return false;
        }
      })
      .map((entry) => new URL(entry).origin);
    return new Set(origins);
  }

  const { SITE_URL } = getUrls(env);
  return new Set([new URL(SITE_URL).origin]);
}

function isAllowedOrigin(req: Request, env: Env): boolean {
  const allowedOrigins = getAllowedOrigins(env);
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  if (origin) {
    return allowedOrigins.has(origin);
  }

  if (referer) {
    try {
      const ref = new URL(referer);
      if (!allowedOrigins.has(ref.origin)) return false;

      if (env.ALLOWED_ORIGINS) {
        return true;
      }

      const { SITE_URL } = getUrls(env);
      const site = new URL(SITE_URL);
      const base = site.pathname.endsWith('/') ? site.pathname : site.pathname + '/';
      return ref.pathname === site.pathname || ref.pathname.startsWith(base);
    } catch {
      return false;
    }
  }

  return false;
}

// Email validation using valibot for proper RFC5322 compliance
function isValidEmail(e: string): boolean {
  if (!e || e.length > 254) return false;

  // Use valibot's email validation which properly handles RFC5322 compliance
  // This supports international domains, quoted local parts, plus-addressing, etc.
  const emailSchema = pipe(string(), email());
  const result = safeParse(emailSchema, e);

  return result.success;
}

/**
 * Detect potential email header injection attempts
 * Checks for control characters that could be used to inject headers
 */
function hasEmailHeaderInjection(email: string): boolean {
  // Check for control characters that could inject headers
  const dangerousChars = /[\r\n\t\v\f\0]/;

  // Check for header injection patterns only at line starts
  const headerPatterns = /(^|[\r\n])\s*(to|from|cc|bcc|subject|reply-to|return-path)\s*:/i;

  return dangerousChars.test(email) || headerPatterns.test(email);
}

/**
 * Strict RFC-compliant domain name validation
 * Prevents consecutive dots, labels starting/ending with hyphens, and enforces length limits
 */
function isValidDomainName(domain: string): boolean {
  // Overall length check (RFC 1035)
  if (domain.length === 0 || domain.length > 253) {
    return false;
  }

  // Split into labels and validate each
  const labels = domain.split('.');

  // Must have at least 2 labels (domain.tld)
  if (labels.length < 2) {
    return false;
  }

  // Validate each label
  for (const label of labels) {
    // Label length: 1-63 characters (RFC 1035)
    if (label.length === 0 || label.length > 63) {
      return false;
    }

    // No leading or trailing hyphens
    if (label.startsWith('-') || label.endsWith('-')) {
      return false;
    }

    // Only letters, digits, and internal hyphens (case-insensitive)
    if (!/^[a-z0-9-]+$/i.test(label)) {
      return false;
    }
  }

  return true;
}

function isReasonableSize(req: Request, maxBytes = 50 * 1024): boolean {
  const len = req.headers.get('content-length');
  if (!len) return true;

  // Strict validation: only accept non-negative integer strings
  const trimmedLen = len.trim();

  // Must be digits only (no scientific notation, no negative values, no decimals)
  if (!/^\d+$/.test(trimmedLen)) {
    return false;
  }

  // Prevent overflow: check string length before parsing
  const maxBytesStr = String(maxBytes);
  if (trimmedLen.length > maxBytesStr.length) {
    return false; // Definitely too large
  }
  if (trimmedLen.length === maxBytesStr.length && trimmedLen > maxBytesStr) {
    return false; // Same length but lexicographically larger
  }

  // Parse as integer and validate range
  const n = parseInt(trimmedLen, 10);
  return n >= 0 && n <= maxBytes;
}
function escapeHtml(s: unknown): string {
  const str = s == null ? '' : String(s);
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' } as const;
  const isEscapeChar = (c: string): c is keyof typeof map => c in map;
  return str.replace(/[&<>"'\/`=]/g, (m) => (isEscapeChar(m) ? map[m] : m));
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    // Hard validation of required contact URLs (no silent fallbacks)
    // This runs on every request (Workers have no traditional cold-start init block), but lightweight.
    if (!env.CONTACT_FORM_URL || !env.CONTACT_THANKS_URL) {
      return new Response('Server misconfiguration: CONTACT_FORM_URL and CONTACT_THANKS_URL are required', { status: 500 });
    }

    // Validate critical production environment configuration
    if (env.ENV === 'prod' && !env.RATE_LIMIT_KV) {
      console.error('CRITICAL: RATE_LIMIT_KV is required in production but not configured');
      return new Response('Server configuration error: Missing required rate limiting configuration', {
        status: 500
      });
    }

    // Fail-safe: if SITE_URL (or other URL vars) are malformed, return a clean 500
    let urls;
    try {
      urls = getUrls(env);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'invalid SITE_URL';
      return new Response(`Server misconfiguration: ${msg}`, { status: 500 });
    }
    const { SITE_URL, CONTACT_FORM, NEWSLETTER_FORM } = urls;

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORSPreflight(request, env);
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: { 'Allow': 'POST, OPTIONS' } });
    }

    // Shared origin/ctype/size checks
    if (!isAllowedOrigin(request, env)) {
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
      const response = await handleNewsletter(request, env, _ctx);
      return addCORSHeaders(response, request, env);
    }
    if (url.pathname === '/api/contact') {
      const response = await handleContact(request, env);
      return addCORSHeaders(response, request, env);
    }

    return new Response('Not Found', { status: 404 });
  }
} satisfies ExportedHandler<Env>;

// Add CORS headers to responses
function addCORSHeaders(response: Response, request: Request, env: Env): Response {
  // Clone headers to avoid mutating the original response
  const clonedHeaders = new Headers(response.headers);

  const allowedOrigins = getAllowedOrigins(env);
  const origin = request.headers.get('origin');
  const isAllowed = origin ? allowedOrigins.has(origin) : false;

  clonedHeaders.set('Access-Control-Allow-Methods', 'POST');
  clonedHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
  clonedHeaders.set('Access-Control-Max-Age', '86400');

  if (isAllowed && origin) {
    clonedHeaders.set('Access-Control-Allow-Origin', origin);

    // Add Vary header to ensure caches vary by origin
    const existingVary = clonedHeaders.get('Vary');
    if (existingVary) {
      // Merge with existing Vary header if present
      clonedHeaders.set('Vary', `${existingVary}, Origin`);
    } else {
      clonedHeaders.set('Vary', 'Origin');
    }
  }

  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: clonedHeaders
  });

  return newResponse;
}

// Handle CORS preflight requests
function handleCORSPreflight(request: Request, env: Env): Response {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins(env);

  if (!origin || !allowedOrigins.has(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    }
  });
}

// -------------------- Contact (unchanged behavior) --------------------
async function handleContact(request: Request, env: Env): Promise<Response> {
  const { CONTACT_THANKS, SITE_URL } = getUrls(env);
  const CONTACT_ERROR = new URL('contact-error.html', SITE_URL).toString();

  try {
    const form = await request.formData();
    const name = (form.get('name') || '').toString().trim();
    const email = (form.get('email') || '').toString().trim();
    const message = (form.get('message') || '').toString().trim();
    const website = (form.get('website') || '').toString(); // honeypot
    const timestamp = (form.get('timestamp') || '').toString();

    if (website) return Response.redirect(CONTACT_THANKS, 303);

    if (!name || name.length < 2 || name.length > 70) {
      return Response.redirect(CONTACT_ERROR, 303);
    }
    if (!isValidEmail(email)) {
      return Response.redirect(CONTACT_ERROR, 303);
    }

    // Apply enhanced rate limiting with email context - mandatory in production
    if (env.ENV === 'prod') {
      const shouldBlock = await isRateLimited(env, request, email);
      if (shouldBlock) {
        return Response.redirect(CONTACT_ERROR, 303);
      }
    }

    if (!message || message.length < 10 || message.length > 5000) {
      return Response.redirect(CONTACT_ERROR, 303);
    }

    if (timestamp) {
      const parsed = parseInt(timestamp, 10);

      // Validate parsed timestamp is a valid number
      if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
        return Response.redirect(CONTACT_ERROR, 303);
      }

      const elapsed = Date.now() - parsed;
      const minTime = parseInt(env.CONTACT_MIN_TIME || '3000', 10);
      const maxAge = parseInt(env.CONTACT_MAX_AGE_MS || '86400000', 10); // Default: 24 hours

      // Check bounds: future timestamp, too old, or too fast
      if (elapsed < 0 || elapsed > maxAge || elapsed < minTime) {
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

async function sendEmail(env: Env, { name, email, message }: { name: string; email: string; message: string }): Promise<boolean> {
  const from = env.FROM_EMAIL || 'Website <no-reply@example.com>';
  const to = env.TO_EMAIL || 'to@example.com';

  // Unicode-aware sanitization to prevent header injection
  // Remove control characters but preserve international characters
  let sanitizedName = name
    .replace(/[\r\n\t\v\f\0]/g, '') // Remove all control characters
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous HTML/injection characters
    .trim()
    .substring(0, 100); // Reasonable max length after sanitization

  // Fallback to safe default if sanitization results in empty string
  if (!sanitizedName) {
    sanitizedName = 'Website Visitor';
  }

  // SECURITY: Validate reply_to email to prevent header injection
  // Only use user email if it's valid and safe, otherwise fall back to no-reply
  let replyToEmail: string;
  if (isValidEmail(email) && !hasEmailHeaderInjection(email)) {
    replyToEmail = email;
  } else {
    // Fall back to a safe no-reply address derived from the FROM_EMAIL domain
    let domain = 'example.com'; // Safe fallback

    // Robust domain extraction from FROM_EMAIL
    const trimmedFrom = from.trim().replace(/^<|>$/g, ''); // Remove angle brackets
    const atIndex = trimmedFrom.lastIndexOf('@');

    if (atIndex !== -1) {
      const extractedDomain = trimmedFrom.substring(atIndex + 1).toLowerCase();

      // Strict RFC-compliant domain validation
      if (isValidDomainName(extractedDomain)) {
        domain = extractedDomain;
      }
    }

    replyToEmail = `no-reply@${domain}`;
  }

  const payload = {
    from,
    to: [to],
    reply_to: replyToEmail,
    subject: 'Contact Form Submission', // Static subject to avoid header injection
    text: `Name: ${sanitizedName}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `<h2>New Contact Form Submission</h2>
           <p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
           <p><strong>Email:</strong> ${escapeHtml(email)}</p>
           <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`
  } as const;

  try {
    const resp = await fetchWithTimeout('https://api.resend.com/emails', {
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
async function handleNewsletter(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { NEWSLETTER_THANKS, SITE_URL } = getUrls(env);
  const NEWSLETTER_ERROR = new URL('newsletter-error.html', SITE_URL).toString();

  try {
    const form = await request.formData();
    const email = (form.get('EMAIL') || form.get('email') || '').toString().trim();
    const website = (form.get('website') || '').toString();         // honeypot
    const timestamp = (form.get('timestamp') || '').toString();

    if (website) return Response.redirect(NEWSLETTER_THANKS, 303);
    if (!isValidEmail(email)) {
      return Response.redirect(NEWSLETTER_ERROR, 303);
    }

    // Apply enhanced rate limiting with email context - mandatory in production
    if (env.ENV === 'prod') {
      const shouldBlock = await isRateLimited(env, request, email);
      if (shouldBlock) {
        return Response.redirect(NEWSLETTER_ERROR, 303);
      }
    }

    // Light bot timing (optional)
    if (timestamp) {
      const ts = parseInt(timestamp, 10);
      if (Number.isNaN(ts)) {
        return Response.redirect(NEWSLETTER_ERROR, 303);
      }

      const elapsed = Date.now() - ts;
      const minTime = parseInt(env.NEWSLETTER_MIN_TIME || '1500', 10);
      if (elapsed < minTime) {
        // Too fast → block submission
        return Response.redirect(NEWSLETTER_ERROR, 303);
      }
    }

    // Local/dev: don't hit external APIs
    if (env.ENV !== 'prod') {
      return Response.redirect(NEWSLETTER_THANKS, 303);
    }

    // PROD: add contact to Resend Audience
    const addResult = await addContactToAudience(env, email);
    if (!addResult.ok) {
      return Response.redirect(NEWSLETTER_ERROR, 303);
    }

    if (addResult.ok && !addResult.rateLimited && env.RATE_LIMIT_KV) {
      const kv = env.RATE_LIMIT_KV;
      const normalizedEmail = email.toLowerCase().trim();
      const emailHash = await hashEmailFull(normalizedEmail);
      const dedupeKey = `newsletter:welcome_sent:${emailHash}`;

      try {
        const alreadySent = await kv.get(dedupeKey);
        if (!alreadySent) {
          const idempotencyKey = `welcome:${emailHash}`;
          ctx.waitUntil((async () => {
            try {
              const ok = await sendWelcomeEmail(env, email, idempotencyKey);
              if (ok) {
                try {
                  await kv.put(dedupeKey, String(Date.now()), {
                    expirationTtl: 60 * 60 * 24 * 180
                  });
                } catch (e) {
                  console.error('welcome dedupe write failed', e);
                }
              } else {
                console.error('welcome email failed (non-2xx)');
              }
            } catch (e) {
              console.error('welcome email failed', e);
            }
          })());
        }
      } catch (e) {
        console.error('welcome dedupe check failed', e);
      }
    }

    return Response.redirect(NEWSLETTER_THANKS, 303);
  } catch {
    return Response.redirect(NEWSLETTER_ERROR, 303);
  }
}

type AudienceAddResult = { ok: boolean; rateLimited: boolean };

async function addContactToAudience(env: Env, email: string): Promise<AudienceAddResult> {
  const audienceId = env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    // No audience configured → treat as soft-fail or success.
    // Prefer success to avoid blocking signups until you set the ID.
    return { ok: true, rateLimited: false };
  }

  // Resend supports creating contacts under an Audience via API
  const url = `https://api.resend.com/audiences/${audienceId}/contacts`;

  try {
    const resp = await fetchWithTimeout(url, {
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
    if (resp.ok || resp.status === 409) return { ok: true, rateLimited: false };
    if (resp.status === 429) return { ok: false, rateLimited: true };
    const body = await resp.text().catch(() => 'Unable to read response body');
    console.error(`Resend audience add failed: ${resp.status} ${resp.statusText}; email=[redacted]`);
    // (Optional) In non-prod you could log body; avoid PII/verbose logs in prod.
    if (env.ENV !== 'prod') {
      console.error('Upstream (redacted) body:', body.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]'));
    }
    return { ok: false, rateLimited: false };
  } catch (error) {
    console.error(`Failed to add contact to audience: audienceId=${audienceId}`, error);
    return { ok: false, rateLimited: false };
  }
}

async function sendWelcomeEmail(env: Env, email: string, idempotencyKey: string): Promise<boolean> {
  const from = env.FROM_EMAIL || 'Website <no-reply@example.com>';
  const replyTo = env.TO_EMAIL || 'to@example.com';

  const payload = {
    from,
    to: [email],
    reply_to: replyTo,
    subject: 'Welcome — you’re in',
    text: [
      'You’re subscribed.',
      'When I publish a new article, you’ll get a short note + link.',
      'https://0xjcf.com/writing',
      'Reply and tell me what you’re building.',
    ].join('\n'),
    html: `<p>You’re subscribed.</p>
           <p>When I publish a new article, you’ll get a short note + link.</p>
           <p><a href="https://0xjcf.com/writing">https://0xjcf.com/writing</a></p>
           <p>Reply and tell me what you’re building.</p>`
  } as const;

  try {
    const resp = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (resp.ok) return true;

    if (env.ENV === 'prod') {
      console.error(`Welcome email send failed: ${resp.status} ${resp.statusText}`);
    } else {
      const body = await resp.text().catch(() => 'Unable to read response body');
      console.error(`Welcome email send failed: ${resp.status} ${resp.statusText}`, body);
    }
    return false;
  } catch (error) {
    console.error('Welcome email send error:', error);
    return false;
  }
}

async function hashEmailFull(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Enhanced multi-dimensional rate limiting with exponential backoff
 * Tracks: IP address, email address, and global endpoint quotas
 * Implements progressive penalties for repeat offenders
 */
async function isRateLimited(env: Env, request: Request, email?: string): Promise<boolean> {
  // In production, RATE_LIMIT_KV is mandatory (validated at startup)
  // In dev, fail-open if KV not configured
  if (!env.RATE_LIMIT_KV) {
    if (env.ENV === 'prod') {
      console.error('CRITICAL: Rate limiting called in production without RATE_LIMIT_KV');
      throw new Error('Rate limiting not available in production');
    }
    return false; // Fail-open in development
  }

  try {
    // Extract IP address (prefer Cloudflare's cf-connecting-ip)
    const cfip = request.headers.get('cf-connecting-ip');
    const xff = request.headers.get('x-forwarded-for');
    const ip = (cfip || (xff ? xff.split(',')[0] : '')).trim();
    if (!ip) return false;

    const url = new URL(request.url);
    const pathname = url.pathname;
    const now = Date.now();

    // Check multiple rate limit dimensions
    const checks = [
      await checkRateLimit(env.RATE_LIMIT_KV, `ip:${pathname}:${ip}`, 5, 60), // 5 per minute per IP
      await checkRateLimit(env.RATE_LIMIT_KV, `global:${pathname}`, 100, 60), // 100 per minute globally
    ];

    // Add email-specific rate limiting for contact/newsletter forms
    if (email && isValidEmail(email)) {
      // Normalize and hash email for privacy in KV keys
      const normalizedEmail = normalizeEmail(email);
      const emailHash = await hashEmail(normalizedEmail);
      checks.push(
        await checkRateLimit(env.RATE_LIMIT_KV, `email:${pathname}:${emailHash}`, 3, 300) // 3 per 5 minutes per email
      );
    }

    // Check if any dimension is rate limited
    const isLimited = checks.some(result => result.isLimited);

    if (isLimited) {
      // Apply exponential backoff for repeat offenders
      const penaltyKey = `penalty:${ip}`;
      const penaltyData = await env.RATE_LIMIT_KV.get(penaltyKey);
      const penalties = penaltyData ? parseInt(penaltyData, 10) : 0;

      // Increase penalty count and extend TTL exponentially
      const newPenalties = penalties + 1;
      const penaltyDuration = Math.min(300, 60 * Math.pow(2, newPenalties - 1)); // Max 5 min penalty

      await env.RATE_LIMIT_KV.put(penaltyKey, String(newPenalties), {
        expirationTtl: penaltyDuration
      });

      return true;
    }

    // Update all successful rate limit counters
    for (const result of checks) {
      if (result.key) {
        await env.RATE_LIMIT_KV.put(result.key, String(result.newCount), {
          expirationTtl: result.windowSeconds
        });
      }
    }

    return false;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail-open: if rate limiting fails, don't block legitimate traffic
    return false;
  }
}

/**
 * Check a single rate limit dimension
 */
async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ isLimited: boolean; key: string; newCount: number; windowSeconds: number }> {
  const currentRaw = await kv.get(key);
  const current = parseInt(currentRaw ?? '0', 10) || 0;
  const newCount = current + 1;

  return {
    isLimited: current >= limit,
    key,
    newCount,
    windowSeconds
  };
}

/**
 * Hash email address for privacy in KV storage
 * Uses Web Crypto API for consistent hashing
 */
/**
 * Normalize email address to prevent bypass via common variations
 * Handles Gmail dot/plus variants and general plus-addressing
 */
function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');

  if (atIndex === -1) {
    return trimmed; // Invalid email, return as-is
  }

  let localPart = trimmed.substring(0, atIndex);
  const domain = trimmed.substring(atIndex + 1);

  // Strip plus-tag from all domains (everything from '+' to end of local part)
  const plusIndex = localPart.indexOf('+');
  if (plusIndex !== -1) {
    localPart = localPart.substring(0, plusIndex);
  }

  // For Gmail domains, also remove dots from local part
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    localPart = localPart.replace(/\./g, '');
  }

  return `${localPart}@${domain}`;
}

async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

export const __workerTest = {
  withError,
  isValidDomainName,
  isReasonableSize,
  normalizeEmail,
  addCORSHeaders,
  isRateLimited,
};
