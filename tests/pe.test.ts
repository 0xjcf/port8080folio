// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const CONTACT_ENDPOINT = 'https://website-forms-production.bluejf-llc.workers.dev/api/contact';
const SITE_ORIGIN = 'https://0xjcf.github.io';
const SITE_BASE = `${SITE_ORIGIN}/port8080folio`;

const createMatchMediaMock = () =>
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const stubMatchMedia = () => {
  if (typeof window.matchMedia === 'undefined') {
    vi.stubGlobal('matchMedia', createMatchMediaMock());
  } else {
    window.matchMedia = createMatchMediaMock();
  }
};

describe('progressive enhancement form handler', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();

    document.head.innerHTML = '';
    document.body.innerHTML = `
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <div class="form-group">
          <input id="name" name="name" required minlength="2" value="Jane Doe" />
        </div>
        <div class="form-group">
          <input id="contact-email" name="email" type="email" required value="jane@example.com" />
        </div>
        <div class="form-group">
          <textarea id="message" name="message" required minlength="10">Hello there!</textarea>
        </div>
        <input type="text" name="website" value="" />
        <input type="hidden" name="timestamp" value="${Date.now() - 5000}" />
        <div class="form-submit">
          <button type="submit">
            <span class="button__text">Send</span>
            <span class="sr-only loading-status" role="status" aria-live="polite" aria-atomic="true">Loading…</span>
          </button>
          <div class="form-success-message" aria-live="polite">
            <span class="success-emoji">✅</span>
            <span>Thanks!</span>
          </div>
        </div>
      </form>
    `;

    stubMatchMedia();
    window.localStorage.clear();
    window.location.href = `${SITE_BASE}/index.html`;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    window.localStorage.clear();
  });

  it('posts contact form data and redirects to worker thanks page when fetch succeeds', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      url: `${SITE_BASE}/contact-thanks.html`,
      json: async () => ({}),
      text: async () => '',
    });
    vi.stubGlobal('fetch', fetchMock);

    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await flushMicrotasks();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [RequestInfo, RequestInit];
    expect(requestUrl).toBe(CONTACT_ENDPOINT);
    expect(requestInit?.method).toBe('POST');
    expect(requestInit?.body).toBeInstanceOf(FormData);
    expect(window.location.href).toBe(`${SITE_BASE}/contact-thanks.html`);
  });

  it('shows error message and re-enables button when fetch returns non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      url: `${SITE_BASE}/contact-error.html`,
      json: async () => ({ message: 'Server error' }),
      text: async () => '{"message":"Server error"}',
    });
    vi.stubGlobal('fetch', fetchMock);

    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    const errorEl = form.querySelector('.form-error');
    expect(errorEl).toBeTruthy();
    expect(button.disabled).toBe(false);
    expect(window.location.href).toBe(`${SITE_BASE}/index.html`);
  });

  it('prevents submission when endpoint contains unresolved placeholder', async () => {
    document.body.innerHTML = `
      <form class="pe-form" data-endpoint="{{CONTACT_API_URL}}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <div class="form-submit">
          <button type="submit">Send</button>
        </div>
      </form>
    `;

    stubMatchMedia();
    window.location.href = `${SITE_BASE}/index.html`;

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(button.disabled).toBe(true);
    const endpointError = form.querySelector('.form-endpoint-error');
    expect(endpointError).toBeTruthy();
  });

  it('skips forms without submit buttons when :has() fallback runs', async () => {
    document.body.innerHTML = `
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}">
        <input name="name" value="Jane" />
      </form>
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}">
        <input name="name" value="" required />
        <button type="submit">Send</button>
      </form>
    `;

    stubMatchMedia();
    vi.stubGlobal('CSS', { supports: vi.fn().mockReturnValue(false) });

    await import('../src/scripts/pe.js');

    const forms = document.querySelectorAll('form.pe-form');
    const firstFormButton = forms[0].querySelector('button[type="submit"]');
    const secondFormButton = forms[1].querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(firstFormButton).toBeNull();
    expect(secondFormButton.disabled).toBe(true);
    expect(secondFormButton.classList.contains('is-submit-disabled')).toBe(true);
  });

  it('disables submit buttons that lack an associated form', async () => {
    document.body.innerHTML = `
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}">
        <button type="submit" id="orphan-submit">Send</button>
      </form>
    `;

    const button = document.getElementById('orphan-submit') as HTMLButtonElement;
    Object.defineProperty(button, 'form', { configurable: true, value: null });

    stubMatchMedia();
    vi.stubGlobal('CSS', { supports: vi.fn().mockReturnValue(false) });

    await import('../src/scripts/pe.js');

    expect(button.disabled).toBe(true);
    expect(button.classList.contains('is-submit-disabled')).toBe(true);
  });

  it('focuses the first invalid field when validation fails', async () => {
    document.body.innerHTML = `
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input id="first" name="name" required minlength="2" value="" />
        <input id="second" name="email" required value="" />
        <button type="submit">Send</button>
      </form>
    `;

    stubMatchMedia();
    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;
    const firstInput = document.getElementById('first') as HTMLInputElement;
    vi.spyOn(form, 'checkValidity').mockReturnValue(false);
    const originalQuery = form.querySelector.bind(form);
    vi.spyOn(form, 'querySelector').mockImplementation((selector: string) => {
      if (selector === ':invalid') {
        return firstInput;
      }
      return originalQuery(selector);
    });
    const focusSpy = vi.spyOn(firstInput, 'focus').mockImplementation(() => { });

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(form.classList.contains('was-validated')).toBe(true);
    expect(firstInput.classList.contains('touched')).toBe(true);
    expect(focusSpy).toHaveBeenCalled();
  });

  it('marks fields as touched on interactions and handles form reset', async () => {
    document.body.innerHTML = `
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input id="field-input" name="name" required minlength="2" value="Jane" />
        <select id="field-select" name="choice" required>
          <option value="">Choose</option>
          <option value="a">A</option>
        </select>
        <div class="form-submit">
          <button type="submit">Send</button>
        </div>
      </form>
    `;

    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((fn: FrameRequestCallback) => {
        fn(0);
        return 1;
      });

    stubMatchMedia();
    vi.stubGlobal('CSS', { supports: vi.fn().mockReturnValue(false) });

    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;
    const input = document.getElementById('field-input') as HTMLInputElement;
    const select = document.getElementById('field-select') as HTMLSelectElement;

    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(input.classList.contains('touched')).toBe(true);

    input.dispatchEvent(new Event('blur', { bubbles: true }));
    expect(input.classList.contains('blurred')).toBe(true);

    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(select.classList.contains('touched')).toBe(true);

    form.dispatchEvent(new Event('reset', { bubbles: true }));
    expect(rafSpy).toHaveBeenCalled();

    rafSpy.mockRestore();
  });

  it('removes loading state and shows error on fetch failure', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('offline'));
    vi.stubGlobal('fetch', fetchMock);

    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    const errorEl = form.querySelector('.form-error');
    expect(errorEl).not.toBeNull();
    expect(errorEl?.textContent || '').toContain('offline');
    expect(button.disabled).toBe(false);
    expect(button.querySelector('[data-loading-text="true"]')).toBeNull();
  });

  it('clears existing errors and handles unexpected error types', async () => {
    const fetchMock = vi.fn().mockRejectedValue('boom');
    vi.stubGlobal('fetch', fetchMock);

    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    let errors = form.querySelectorAll('.form-error');
    expect(errors).toHaveLength(1);
    expect(errors[0]?.textContent || '').toContain('unexpected error');

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    errors = form.querySelectorAll('.form-error');
    expect(errors).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('aborts long-running requests and reports timeout', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn().mockImplementation((_: RequestInfo, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortError = new Error('Timeout');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    vi.advanceTimersByTime(30000);
    await flushMicrotasks();

    const errorEl = form.querySelector('.form-error');
    expect(errorEl?.textContent).toContain('Request timed out');
    expect(button.disabled).toBe(false);

    vi.useRealTimers();
  });

  it('retries rate-limited responses and succeeds with input submit button', async () => {
    vi.useFakeTimers();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    document.body.innerHTML = `
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <input type="submit" value="Send" />
      </form>
    `;

    stubMatchMedia();

    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => {
        return new Response(JSON.stringify({ message: 'Rate limit' }), {
          status: 429,
          headers: { 'Retry-After': '1', 'Content-Type': 'application/json' },
        });
      })
      .mockImplementation(async () => {
        const response = new Response('', { status: 200 });
        Object.defineProperty(response, 'url', { value: `${SITE_BASE}/contact-thanks.html` });
        return response;
      });

    vi.stubGlobal('fetch', fetchMock);

    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushMicrotasks();

    vi.advanceTimersByTime(1000);
    await flushMicrotasks();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(window.location.href).toBe(`${SITE_BASE}/contact-thanks.html`);

    randomSpy.mockRestore();
    vi.useRealTimers();
  });

  it('retries transient network errors before succeeding', async () => {
    vi.useFakeTimers();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockImplementation(async () => {
        const response = new Response('', { status: 200 });
        Object.defineProperty(response, 'url', { value: `${SITE_BASE}/contact-thanks.html` });
        return response;
      });

    vi.stubGlobal('fetch', fetchMock);

    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await flushMicrotasks();
    vi.advanceTimersByTime(1000);
    await flushMicrotasks();
    vi.advanceTimersByTime(2000);
    await flushMicrotasks();
    await flushMicrotasks();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(window.location.href).toBe(`${SITE_BASE}/contact-thanks.html`);

    randomSpy.mockRestore();
    vi.useRealTimers();
  });

  it('stops retrying fetch failures after exhausting attempts', async () => {
    vi.useFakeTimers();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const fetchMock = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    vi.stubGlobal('fetch', fetchMock);

    await import('../src/scripts/pe.js');

    const form = document.querySelector('form.pe-form') as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    vi.advanceTimersByTime(1000);
    await flushMicrotasks();
    vi.advanceTimersByTime(2000);
    await flushMicrotasks();
    vi.advanceTimersByTime(3000);
    await flushMicrotasks();

    const errorEl = form.querySelector('.form-error');
    expect(errorEl?.textContent || '').toContain('Network connection failed');
    expect(button.disabled).toBe(false);

    randomSpy.mockRestore();
    vi.useRealTimers();
  });

  it('enables fallback validation when :has() is unsupported', async () => {
    document.body.innerHTML = `
      <section id="about"></section>
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input id="name" name="name" required minlength="2" value="" />
        <button type="submit">Send</button>
      </form>
    `;

    stubMatchMedia();
    vi.stubGlobal('CSS', { supports: vi.fn().mockReturnValue(false) });
    window.location.href = `${SITE_BASE}/index.html#contact`;

    await import('../src/scripts/pe.js');

    const button = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.classList.contains('is-submit-disabled')).toBe(true);
    expect(document.body.classList.contains('contact-targeted')).toBe(true);
  });
  it('toggles about section classes on segment changes', async () => {
    document.body.innerHTML = `
      <section id="about"></section>
      <input type="radio" id="seg-sb" name="segment" checked />
      <input type="radio" id="seg-pt" name="segment" />
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <button type="submit">Send</button>
      </form>
    `;

    stubMatchMedia();
    vi.stubGlobal('CSS', { supports: vi.fn().mockReturnValue(false) });
    window.location.href = `${SITE_BASE}/index.html#about`;

    await import('../src/scripts/pe.js');

    const aboutSection = document.getElementById('about') as HTMLElement;
    const segPT = document.getElementById('seg-pt') as HTMLInputElement;

    expect(aboutSection.classList.contains('about--seg-sb')).toBe(true);

    segPT.checked = true;
    segPT.dispatchEvent(new Event('change', { bubbles: true }));

    expect(aboutSection.classList.contains('about--seg-pt')).toBe(true);
  });

  it('updates contact targeted class when hash changes', async () => {
    document.body.innerHTML = `
      <section id="about"></section>
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <button type="submit">Send</button>
      </form>
    `;

    stubMatchMedia();
    vi.stubGlobal('CSS', { supports: vi.fn().mockReturnValue(false) });
    window.location.href = `${SITE_BASE}/index.html`;

    await import('../src/scripts/pe.js');

    expect(document.body.classList.contains('contact-targeted')).toBe(false);
    window.location.hash = '#contact';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(document.body.classList.contains('contact-targeted')).toBe(true);
  });

  it('wires up tab navigation with keyboard support', async () => {
    document.body.innerHTML = `
      <div class="form-tabs-container">
        <label class="form-tab" for="tab-contact">Contact</label>
        <label class="form-tab" for="tab-newsletter">Newsletter</label>
      </div>
      <input type="radio" id="tab-contact" name="form-tab" checked />
      <input type="radio" id="tab-newsletter" name="form-tab" />
      <div id="panel-contact"></div>
      <div id="panel-newsletter"></div>
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <button type="submit">Send</button>
      </form>
    `;

    stubMatchMedia();

    await import('../src/scripts/pe.js');

    const labels = document.querySelectorAll('.form-tab') as NodeListOf<HTMLLabelElement>;
    const contactLabel = labels[0];
    const newsletterLabel = labels[1];
    const newsletterRadio = document.getElementById('tab-newsletter') as HTMLInputElement;

    expect(contactLabel.getAttribute('aria-selected')).toBe('true');
    const focusSpy = vi.spyOn(newsletterLabel, 'focus').mockImplementation(() => { });

    contactLabel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(newsletterRadio.checked).toBe(true);
    expect(focusSpy).toHaveBeenCalled();

    focusSpy.mockRestore();
  });

  it('updates tab ARIA attributes and focuses panel on radio change', async () => {
    document.body.innerHTML = `
      <div class="form-tabs-container">
        <label class="form-tab" for="tab-contact">Contact</label>
        <label class="form-tab" for="tab-newsletter">Newsletter</label>
      </div>
      <input type="radio" id="tab-contact" name="form-tab" checked />
      <input type="radio" id="tab-newsletter" name="form-tab" />
      <div id="panel-contact"></div>
      <div id="panel-newsletter"></div>
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <button type="submit">Send</button>
      </form>
    `;

    stubMatchMedia();

    await import('../src/scripts/pe.js');

    const container = document.querySelector('.form-tabs-container') as HTMLElement;
    const labels = container.querySelectorAll('.form-tab') as NodeListOf<HTMLLabelElement>;
    const contactLabel = labels[0];
    const newsletterLabel = labels[1];
    const contactPanel = document.getElementById('panel-contact') as HTMLElement;
    const newsletterPanel = document.getElementById('panel-newsletter') as HTMLElement;
    const newsletterRadio = document.getElementById('tab-newsletter') as HTMLInputElement;

    const focusSpy = vi.spyOn(newsletterLabel, 'focus').mockImplementation(() => { });
    const panelFocusSpy = vi.spyOn(newsletterPanel, 'focus').mockImplementation(() => { });

    newsletterRadio.checked = true;
    const changeEvent = new Event('change', { bubbles: true });
    Object.defineProperty(changeEvent, 'target', { value: newsletterRadio, configurable: true });
    container.dispatchEvent(changeEvent);

    expect(newsletterLabel.getAttribute('aria-selected')).toBe('true');
    expect(newsletterLabel.getAttribute('tabindex')).toBe('0');
    expect(contactLabel.getAttribute('aria-selected')).toBe('false');
    expect(contactLabel.getAttribute('tabindex')).toBe('-1');
    expect(newsletterPanel.getAttribute('aria-hidden')).toBe('false');
    expect(contactPanel.getAttribute('aria-hidden')).toBe('true');
    expect(newsletterPanel.tabIndex).toBe(-1);
    expect(focusSpy).toHaveBeenCalled();
    expect(panelFocusSpy).toHaveBeenCalled();

    focusSpy.mockRestore();
    panelFocusSpy.mockRestore();
  });

  it('creates timestamp field when missing from form', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    document.body.innerHTML = `
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <div class="form-submit">
          <button type="submit">Send</button>
        </div>
      </form>
    `;

    stubMatchMedia();
    await import('../src/scripts/pe.js');

    const timestamp = document.querySelector('input[name="timestamp"]') as HTMLInputElement;
    expect(timestamp).toBeTruthy();
    expect(timestamp.type).toBe('hidden');
    expect(timestamp.value).toBe('1700000000000');

    nowSpy.mockRestore();
  });

  it('replaces non-input timestamp placeholders with hidden input', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1800000000000);

    document.body.innerHTML = `
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <div name="timestamp"></div>
        <div class="form-submit">
          <button type="submit">Send</button>
        </div>
      </form>
    `;

    stubMatchMedia();
    await import('../src/scripts/pe.js');

    const timestamp = document.querySelector('input[name="timestamp"]') as HTMLInputElement;
    expect(timestamp).toBeTruthy();
    expect(timestamp.value).toBe('1800000000000');
    expect(timestamp.type).toBe('hidden');

    nowSpy.mockRestore();
  });

  it('shows sticky CTA when hero CTA leaves view (IntersectionObserver available)', async () => {
    const observerInstances: MockIntersectionObserver[] = [];

    class MockIntersectionObserver {
      callback: IntersectionObserverCallback;
      element: Element | null = null;

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        observerInstances.push(this);
      }

      observe(element: Element) {
        this.element = element;
      }

      disconnect() { }
      unobserve() { }

      trigger(isIntersecting: boolean) {
        if (!this.element) return;
        const entry = {
          target: this.element,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: this.element.getBoundingClientRect(),
          rootBounds: null,
          time: 0,
        } as IntersectionObserverEntry;
        this.callback([entry], this as unknown as IntersectionObserver);
      }
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver as unknown as typeof IntersectionObserver);
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((fn: FrameRequestCallback) => {
        fn(0);
        return 1;
      });

    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 400 });
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });

    document.body.innerHTML = `
      <section id="hero">
        <div class="cta-row">
          <a class="button button--primary" href="#contact">Primary CTA</a>
        </div>
      </section>
      <div class="services__sticky-cta">
        <a class="button--sticky" href="#target">Sticky</a>
      </div>
      <div id="target"></div>
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <button type="submit">Send</button>
      </form>
    `;

    const target = document.getElementById('target') as HTMLElement;
    const scrollIntoViewSpy = vi.spyOn(target, 'scrollIntoView').mockImplementation(() => { });

    stubMatchMedia();
    await import('../src/scripts/pe.js');

    const stickyCTA = document.querySelector('.services__sticky-cta') as HTMLElement;
    const stickyButton = stickyCTA.querySelector('.button--sticky') as HTMLAnchorElement;
    const observer = observerInstances[0];

    observer.trigger(false);
    expect(stickyCTA.classList.contains('is-visible')).toBe(true);

    window.scrollY = 700;
    window.dispatchEvent(new Event('scroll'));
    expect(stickyCTA.classList.contains('is-condensed')).toBe(true);

    observer.trigger(true);
    expect(stickyCTA.classList.contains('is-visible')).toBe(false);

    stickyButton.click();
    expect(scrollIntoViewSpy).toHaveBeenCalled();

    rafSpy.mockRestore();
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight });
  });

  it('falls back to scroll-based sticky CTA when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    let rafCallback: FrameRequestCallback | null = null;
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((fn: FrameRequestCallback) => {
        rafCallback = fn;
        fn(0);
        return 1;
      });

    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 400 });
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });

    document.body.innerHTML = `
      <section id="hero">
        <div class="cta-row">
          <a class="button button--primary" href="#contact">Primary CTA</a>
        </div>
      </section>
      <div class="services__sticky-cta">
        <a class="button--sticky" href="#target">Sticky</a>
      </div>
      <div id="target"></div>
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <button type="submit">Send</button>
      </form>
    `;

    const heroCTA = document.querySelector('.cta-row .button.button--primary') as HTMLElement;
    const stickyCTA = document.querySelector('.services__sticky-cta') as HTMLElement;

    let currentRect: DOMRect = {
      bottom: 50,
      top: -100,
      left: 0,
      right: 0,
      width: 200,
      height: 40,
      x: 0,
      y: -100,
      toJSON: () => ({}),
    } as DOMRect;

    vi.spyOn(heroCTA, 'getBoundingClientRect').mockImplementation(() => currentRect);

    stubMatchMedia();
    await import('../src/scripts/pe.js');

    expect(stickyCTA.classList.contains('is-visible')).toBe(true);

    window.scrollY = 700;
    window.dispatchEvent(new Event('scroll'));
    await flushMicrotasks();
    expect(stickyCTA.classList.contains('is-condensed')).toBe(true);

    currentRect = {
      bottom: 150,
      top: 0,
      left: 0,
      right: 0,
      width: 200,
      height: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;

    window.scrollY = 0;
    if (rafCallback) {
      (rafCallback as FrameRequestCallback)(0);
    }
    await flushMicrotasks();
    expect(stickyCTA.classList.contains('is-visible')).toBe(false);
    expect(stickyCTA.classList.contains('is-condensed')).toBe(false);

    rafSpy.mockRestore();
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight });
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });
  });

  it('defers sticky CTA initialization until DOMContentLoaded when document is loading', async () => {
    const originalReadyState = document.readyState;
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'loading',
    });

    const readyHandler = vi.spyOn(document, 'addEventListener');
    vi.stubGlobal('IntersectionObserver', undefined);
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((fn: FrameRequestCallback) => {
      fn(0);
      return 1;
    });

    document.body.innerHTML = `
      <section id="hero">
        <div class="cta-row">
          <a class="button button--primary" href="#contact">Primary CTA</a>
        </div>
      </section>
      <div class="services__sticky-cta">
        <a class="button--sticky" href="#target">Sticky</a>
      </div>
      <div id="target"></div>
      <form class="pe-form" data-endpoint="${CONTACT_ENDPOINT}" method="POST">
        <input name="name" required minlength="2" value="Jane Doe" />
        <input name="email" type="email" required value="jane@example.com" />
        <textarea name="message" required minlength="10">Hello there!</textarea>
        <button type="submit">Send</button>
      </form>
    `;

    stubMatchMedia();
    await import('../src/scripts/pe.js');

    expect(readyHandler).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));

    const stickyCTA = document.querySelector('.services__sticky-cta') as HTMLElement;
    expect(stickyCTA.classList.contains('is-visible')).toBe(false);

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await flushMicrotasks();
    expect(stickyCTA.classList.contains('is-visible')).toBe(true);

    rafSpy.mockRestore();
    readyHandler.mockRestore();
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: originalReadyState,
    });
  });
});
