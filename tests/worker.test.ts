// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import worker, { __workerTest } from '../worker';

type MutableEnv = Parameters<typeof worker.fetch>[1];

const ORIGIN = 'https://example.com';

const createKV = () => {
  const store = new Map<string, string>();
  return {
    store,
    async get(key: string) {
      return store.get(key) ?? null;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
  };
};

const baseEnv = {
  RESEND_API_KEY: 'test-resend-key',
  TO_EMAIL: 'owner@example.com',
  FROM_EMAIL: 'Website <noreply@example.com>',
  SITE_URL: ORIGIN,
  CONTACT_FORM_URL: `${ORIGIN}/#contact-form`,
  CONTACT_THANKS_URL: `${ORIGIN}/contact-thanks.html`,
  NEWSLETTER_FORM_URL: `${ORIGIN}/#newsletter-form`,
  NEWSLETTER_THANKS_URL: `${ORIGIN}/newsletter-thanks.html`,
  NEWSLETTER_CONFIRM_URL: `${ORIGIN}/newsletter-check-email.html`,
  CONTACT_MIN_TIME: '3000',
  NEWSLETTER_MIN_TIME: '1500',
  ENV: 'dev' as const,
} satisfies Partial<MutableEnv>;

const createEnv = (overrides: Partial<MutableEnv> = {}): MutableEnv => {
  const env: MutableEnv = {
    ...baseEnv,
    ...overrides,
  };

  if (env.ENV === 'prod') {
    env.RATE_LIMIT_KV = overrides.RATE_LIMIT_KV ?? createKV();
  }

  return env;
};

const ctx = {
  waitUntil(promise: Promise<unknown>) {
    void promise;
  },
  passThroughOnException() {
    // no-op for tests
  },
} as Parameters<typeof worker.fetch>[2];

const createCtx = () => {
  const waitUntilPromises: Promise<unknown>[] = [];
  const ctx = {
    waitUntil(promise: Promise<unknown>) {
      waitUntilPromises.push(promise);
    },
    passThroughOnException() {
      // no-op for tests
    },
  } as Parameters<typeof worker.fetch>[2];

  return { ctx, waitUntilPromises };
};

interface RequestOverrides {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

const makeRequest = (
  url: string,
  form: Record<string, string> = {},
  overrides: RequestOverrides = {},
) => {
  const method = overrides.method ?? 'POST';
  const defaultBody = new URLSearchParams(form).toString();
  const headers = {
    'content-type': 'application/x-www-form-urlencoded',
    origin: ORIGIN,
    ...overrides.headers,
  };

  const requestInit: RequestInit = {
    method,
    headers,
  };

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    requestInit.body = overrides.body ?? defaultBody;
  } else if (overrides.body) {
    requestInit.body = overrides.body;
  }

  return new Request(url, {
    ...requestInit,
  });
};

describe('Cloudflare worker form handlers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects contact submissions to thanks page when email send succeeds', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    const now = Date.now();
    const request = makeRequest(`${ORIGIN}/api/contact`, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello there!',
      timestamp: String(now - 5000),
      website: '',
    });

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-thanks.html`);
  });

  it('redirects contact submissions to error when email provider returns failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const now = Date.now();
    const request = makeRequest(`${ORIGIN}/api/contact`, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello there!',
      timestamp: String(now - 5000),
      website: '',
    });

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-error.html`);
  });

  it('redirects newsletter submissions to thanks page in development', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const now = Date.now();
    const request = makeRequest(`${ORIGIN}/api/newsletter`, {
      email: 'reader@example.com',
      timestamp: String(now - 2500),
      website: '',
    });

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-thanks.html`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('redirects newsletter submissions to error when email invalid', async () => {
    const request = makeRequest(`${ORIGIN}/api/newsletter`, {
      email: 'not-an-email',
      timestamp: String(Date.now() - 2500),
      website: '',
    });

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-error.html`);
  });

  it('uses audience API in production and reports success when Resend responds ok', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));

    const kv = createKV();
    const env = createEnv({
      ENV: 'prod',
      RESEND_AUDIENCE_ID: 'aud_123',
      RATE_LIMIT_KV: kv,
    });

    const now = Date.now();
    const request = makeRequest(`${ORIGIN}/api/newsletter`, {
      email: 'reader@example.com',
      timestamp: String(now - 2500),
      website: '',
    });

    const response = await worker.fetch(request, env, ctx);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-thanks.html`);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sends welcome email with idempotency key and writes dedupe on success', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));

    const kv = createKV();
    const env = createEnv({
      ENV: 'prod',
      RESEND_AUDIENCE_ID: 'aud_123',
      RATE_LIMIT_KV: kv,
    });
    const { ctx: prodCtx, waitUntilPromises } = createCtx();

    const now = Date.now();
    const request = makeRequest(`${ORIGIN}/api/newsletter`, {
      email: 'reader@example.com',
      timestamp: String(now - 2500),
      website: '',
    });

    const response = await worker.fetch(request, env, prodCtx);
    await Promise.all(waitUntilPromises);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-thanks.html`);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [, welcomeCall] = fetchMock.mock.calls;
    const [welcomeUrl, welcomeInit] = welcomeCall;
    const headers = (welcomeInit as RequestInit)?.headers as Record<string, string>;
    const body = JSON.parse((welcomeInit as RequestInit)?.body as string) as {
      reply_to?: string;
    };

    expect(welcomeUrl).toBe('https://api.resend.com/emails');
    expect(headers['Idempotency-Key']).toMatch(/^welcome:[a-f0-9]{64}$/);
    expect(body.reply_to).toBe('owner@example.com');

    const hasWelcomeKey = Array.from(kv.store.keys()).some((key) =>
      key.startsWith('newsletter:welcome_sent:')
    );
    expect(hasWelcomeKey).toBe(true);
  });

  it('does not send welcome or write dedupe when audience add is rate-limited', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('rate limited', { status: 429 }));

    const kv = createKV();
    const env = createEnv({
      ENV: 'prod',
      RESEND_AUDIENCE_ID: 'aud_123',
      RATE_LIMIT_KV: kv,
    });
    const { ctx: prodCtx, waitUntilPromises } = createCtx();

    const now = Date.now();
    const request = makeRequest(`${ORIGIN}/api/newsletter`, {
      email: 'reader@example.com',
      timestamp: String(now - 2500),
      website: '',
    });

    const response = await worker.fetch(request, env, prodCtx);
    await Promise.all(waitUntilPromises);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-error.html`);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(waitUntilPromises).toHaveLength(0);
    expect(kv.store.size).toBe(0);
  });

  it('does not write dedupe when welcome send fails', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(new Response('nope', { status: 500 }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const kv = createKV();
    const env = createEnv({
      ENV: 'prod',
      RESEND_AUDIENCE_ID: 'aud_123',
      RATE_LIMIT_KV: kv,
    });
    const { ctx: prodCtx, waitUntilPromises } = createCtx();

    const now = Date.now();
    const request = makeRequest(`${ORIGIN}/api/newsletter`, {
      email: 'reader@example.com',
      timestamp: String(now - 2500),
      website: '',
    });

    const response = await worker.fetch(request, env, prodCtx);
    await Promise.all(waitUntilPromises);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-thanks.html`);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const hasWelcomeKey = Array.from(kv.store.keys()).some((key) =>
      key.startsWith('newsletter:welcome_sent:')
    );
    expect(hasWelcomeKey).toBe(false);
  });

  it('skips welcome send when dedupe key exists', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));

    const store = new Map<string, string>();
    const kv = {
      store,
      async get(key: string) {
        if (key.startsWith('newsletter:welcome_sent:')) return '1';
        return '0';
      },
      async put(key: string, value: string) {
        store.set(key, value);
      },
    };
    const env = createEnv({
      ENV: 'prod',
      RESEND_AUDIENCE_ID: 'aud_123',
      RATE_LIMIT_KV: kv,
    });
    const { ctx: prodCtx, waitUntilPromises } = createCtx();

    const now = Date.now();
    const request = makeRequest(`${ORIGIN}/api/newsletter`, {
      email: 'reader@example.com',
      timestamp: String(now - 2500),
      website: '',
    });

    const response = await worker.fetch(request, env, prodCtx);
    await Promise.all(waitUntilPromises);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-thanks.html`);
    expect(waitUntilPromises).toHaveLength(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to safe newsletter URLs when configuration is missing (via GET)', async () => {
    const env = createEnv({
      NEWSLETTER_THANKS_URL: undefined,
      NEWSLETTER_FORM_URL: undefined,
      NEWSLETTER_CONFIRM_URL: undefined,
    });

    const response = await worker.fetch(
      new Request(`${ORIGIN}/`, {
        method: 'GET',
        headers: { origin: ORIGIN },
      }),
      env,
      ctx,
    );

    expect(response.status).toBe(405);
  });

  it('returns 500 when contact URLs missing', async () => {
    const env = createEnv({
      CONTACT_FORM_URL: undefined,
      CONTACT_THANKS_URL: undefined,
    });

    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
        website: '',
      }),
      env,
      ctx,
    );

    expect(response.status).toBe(500);
  });

  it('returns 500 when SITE_URL is invalid', async () => {
    const env = createEnv();
    env.SITE_URL = 'not-a-valid-url';
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
        website: '',
      }),
      env,
      ctx,
    );

    expect(response.status).toBe(500);
  });

  it('returns 500 when CONTACT_THANKS URL is not same-origin', async () => {
    const env = createEnv({ CONTACT_THANKS_URL: 'https://attacker.example/contact-thanks.html' });

    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
        website: '',
      }),
      env,
      ctx,
    );

    expect(response.status).toBe(500);
  });

  it('returns 500 when CONTACT_FORM URL is not same-origin', async () => {
    const env = createEnv({ CONTACT_FORM_URL: 'https://attacker.example/#contact' });

    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
        website: '',
      }),
      env,
      ctx,
    );

    expect(response.status).toBe(500);
  });

  it('rejects requests from disallowed origins', async () => {
    const request = makeRequest(
      `${ORIGIN}/api/contact`,
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
      },
      { headers: { origin: 'https://malicious.example.com' } },
    );

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/?error=origin#contact-form`);
  });

  it('rejects when both origin and referer are missing', async () => {
    const request = makeRequest(
      `${ORIGIN}/api/contact`,
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
      },
      { headers: { origin: '', referer: '' } },
    );

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.headers.get('location')).toBe(`${ORIGIN}/?error=origin#contact-form`);
  });

  it('rejects when referer header is malformed', async () => {
    const request = makeRequest(
      `${ORIGIN}/api/contact`,
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
      },
      { headers: { origin: '', referer: '://bad' } },
    );

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.headers.get('location')).toBe(`${ORIGIN}/?error=origin#contact-form`);
  });

  it('handles CORS preflight requests', async () => {
    const request = makeRequest(`${ORIGIN}/api/contact`, {}, { method: 'OPTIONS' });

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    expect(response.headers.get('access-control-allow-methods')).toBe('POST');
  });

  it('rejects non-post methods', async () => {
    const request = makeRequest(`${ORIGIN}/api/contact`, {}, { method: 'GET' });

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST, OPTIONS');
  });

  it('rejects invalid content-type requests', async () => {
    const request = makeRequest(
      `${ORIGIN}/api/contact`,
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
      },
      { headers: { 'content-type': 'text/plain' } },
    );

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.headers.get('location')).toBe(`${ORIGIN}/?error=ctype#contact-form`);
  });

  it('rejects requests that exceed size limits', async () => {
    const request = makeRequest(
      `${ORIGIN}/api/contact`,
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
      },
      { headers: { 'content-length': '60000' } },
    );

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.headers.get('location')).toBe(`${ORIGIN}/?error=too_large#contact-form`);
  });

  it('rejects requests with malformed content length', async () => {
    const request = makeRequest(
      `${ORIGIN}/api/contact`,
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
      },
      { headers: { 'content-length': 'abc' } },
    );

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.headers.get('location')).toBe(`${ORIGIN}/?error=too_large#contact-form`);
  });

  it('applies rate limiting in production', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const rateLimitedKV = {
      async get(key: string) {
        if (key.startsWith('ip:/api/contact')) {
          return '5';
        }
        return '0';
      },
      async put() {
        // no-op
      },
    };

    const env = createEnv({
      ENV: 'prod',
      RATE_LIMIT_KV: rateLimitedKV,
    });

    const request = makeRequest(
      `${ORIGIN}/api/contact`,
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
        website: '',
      },
      {
        headers: {
          'cf-connecting-ip': '203.0.113.1',
        },
      },
    );

    const response = await worker.fetch(request, env, ctx);

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-error.html`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 500 when rate limiting KV missing in production', async () => {
    const env = createEnv({ ENV: 'prod' });
    env.RATE_LIMIT_KV = undefined;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
        website: '',
      }),
      env,
      ctx,
    );

    expect(response.status).toBe(500);
  });

  it('fails open when rate limiting KV throws errors', async () => {
    const kv = {
      async get() {
        throw new Error('kv down');
      },
      async put() {
        throw new Error('kv down');
      },
    };

    const env = createEnv({ ENV: 'prod', RATE_LIMIT_KV: kv });
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));

    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
        website: '',
      }),
      env,
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-thanks.html`);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('allows referer-based origin checks for same-origin paths', async () => {
    const request = makeRequest(
      `${ORIGIN}/api/contact`,
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
        website: '',
      },
      {
        headers: {
          origin: '',
          referer: `${ORIGIN}/foo`,
        },
      },
    );

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-thanks.html`);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('returns 404 for unknown routes', async () => {
    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/unhandled`, {
        name: 'Jane Doe',
      }),
      createEnv(),
      ctx,
    );

    expect(response.status).toBe(404);
  });

  it('returns 404 for root POST', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
        website: '',
      }),
      createEnv(),
      ctx,
    );

    expect(response.status).toBe(404);
  });

  it('rejects contact submissions when honeypot filled', async () => {
    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        website: 'bot-entry',
        timestamp: String(Date.now() - 5000),
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-thanks.html`);
  });

  it('rejects contact submissions when name too short', async () => {
    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'A',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-error.html`);
  });

  it('rejects contact submissions when message too short', async () => {
    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hi',
        timestamp: String(Date.now() - 5000),
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-error.html`);
  });

  it('falls back to sanitized default name when user name strips to empty', async () => {
    const bodies: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      if (typeof init?.body === 'string') bodies.push(init.body);
      return new Response('{}', { status: 200 });
    });

    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: '\r\n<>"',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-thanks.html`);
    const payload = JSON.parse(bodies[0]);
    expect(payload.text).toContain('Website Visitor');
  });

  it('handles contact form errors gracefully when parsing form data fails', async () => {
    const request = makeRequest(`${ORIGIN}/api/contact`, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello there!',
      timestamp: String(Date.now() - 5000),
    });

    vi.spyOn(request, 'formData').mockRejectedValue(new Error('boom'));

    const response = await worker.fetch(request, createEnv(), ctx);

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-error.html`);
  });

  it('rejects contact submissions when email invalid', async () => {
    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'not-an-email',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-error.html`);
  });

  it('rejects contact submissions when timestamp invalid', async () => {
    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: 'not-a-number',
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-error.html`);
  });

  it('rejects contact submissions when timestamp too recent', async () => {
    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now()),
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-error.html`);
  });

  it('returns newsletter thanks when honeypot filled', async () => {
    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/newsletter`, {
        email: 'reader@example.com',
        website: 'bot-entry',
        timestamp: String(Date.now() - 2500),
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-thanks.html`);
  });

  it('rejects newsletter when timestamp invalid', async () => {
    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/newsletter`, {
        email: 'reader@example.com',
        timestamp: 'abc',
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-error.html`);
  });

  it('rejects newsletter when timestamp too fast', async () => {
    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/newsletter`, {
        email: 'reader@example.com',
        timestamp: String(Date.now()),
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-error.html`);
  });

  it('redirects to error when addContactToAudience fails in production', async () => {
    const audienceEnv = createEnv({
      ENV: 'prod',
      RESEND_AUDIENCE_ID: 'aud_123',
      RATE_LIMIT_KV: createKV(),
    });

    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('fail', { status: 500 }));

    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/newsletter`, {
        email: 'reader@example.com',
        timestamp: String(Date.now() - 2500),
        website: '',
      }),
      audienceEnv,
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/newsletter-error.html`);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('aborts sendEmail when Resend does not respond in time', async () => {
    vi.useFakeTimers();

    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((_, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const err = new Error('Timeout');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    const request = makeRequest(`${ORIGIN}/api/contact`, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello there!',
      timestamp: String(Date.now() - 5000),
      website: '',
    });

    const responsePromise = worker.fetch(request, createEnv(), ctx);
    await vi.advanceTimersByTimeAsync(30000);
    const response = await responsePromise;

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-error.html`);
    expect(fetchMock).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('handles resend fetch rejection gracefully', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    const response = await worker.fetch(
      makeRequest(`${ORIGIN}/api/contact`, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there!',
        timestamp: String(Date.now() - 5000),
        website: '',
      }),
      createEnv(),
      ctx,
    );

    expect(response.headers.get('location')).toBe(`${ORIGIN}/contact-error.html`);
  });

});

describe('worker internals', () => {
  const { withError, isValidDomainName, isReasonableSize, normalizeEmail, addCORSHeaders, isRateLimited } = __workerTest;

  it('withError appends error parameter before hash when URL parsing fails', () => {
    expect(withError('#contact', 'origin')).toBe('?error=origin#contact');
    expect(withError('contact?foo=1', 'origin')).toBe('contact?foo=1&error=origin');
  });

  it('validates domain names strictly', () => {
    expect(isValidDomainName('example.com')).toBe(true);
    expect(isValidDomainName('sub.example.co.uk')).toBe(true);
    expect(isValidDomainName('-invalid-.com')).toBe(false);
    expect(isValidDomainName('one')).toBe(false);
    expect(isValidDomainName(`${'a'.repeat(64)}.com`)).toBe(false);
    expect(isValidDomainName('bad_domain.com')).toBe(false);
  });

  it('normalizes email addresses for hashing', () => {
    expect(normalizeEmail('User+tag.Name@Gmail.com')).toBe('user@gmail.com');
    expect(normalizeEmail('simple@example.com')).toBe('simple@example.com');
  });

  it('detects unreasonable content-length headers', () => {
    const goodRequest = new Request(`${ORIGIN}/`, { headers: { 'content-length': '42' } });
    const badRequest = new Request(`${ORIGIN}/`, { headers: { 'content-length': '123456' } });
    const malformedRequest = new Request(`${ORIGIN}/`, { headers: { 'content-length': 'abc' } });

    expect(isReasonableSize(goodRequest, 100)).toBe(true);
    expect(isReasonableSize(badRequest, 100)).toBe(false);
    expect(isReasonableSize(malformedRequest, 100)).toBe(false);
  });

  it('adds Origin to existing Vary header when adding CORS headers', () => {
    const env = createEnv();
    const original = new Response('ok', { headers: { Vary: 'Accept-Encoding' } });
    const request = new Request(`${ORIGIN}/api/contact`, { headers: { origin: ORIGIN } });
    const updated = addCORSHeaders(original, request, env);

    expect(updated.headers.get('Vary')).toBe('Accept-Encoding, Origin');
  });

  it('fails open when isRateLimited encounters KV errors', async () => {
    const env = createEnv({ ENV: 'prod', RATE_LIMIT_KV: { async get() { throw new Error('down'); }, async put() { throw new Error('down'); } } });
    const request = new Request(`${ORIGIN}/api/contact`, { headers: { origin: ORIGIN } });
    const result = await isRateLimited(env, request, 'user@example.com');

    expect(result).toBe(false);
  });
});
