// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { tmpdir } from 'node:os';

import {
  applyEnvironmentTransforms,
  escapeRegExp,
  listHtmlFiles,
  loadVariables,
  maskSensitiveValue,
  processHtmlFiles,
  replaceVariables,
  validateReplacement,
} from '../scripts/build-replace-vars';

describe('build-replace-vars utility', () => {
  const tempRoots: string[] = [];

  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      try {
        fs.rmSync(root, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
    vi.restoreAllMocks();
  });

  const createTempProject = () => {
    const root = fs.mkdtempSync(path.join(tmpdir(), 'build-vars-'));
    tempRoots.push(root);
    const srcDir = path.join(root, 'src');
    const distDir = path.join(root, 'dist');
    fs.mkdirSync(path.join(srcDir, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'index.html'), '<a href="{{CONTACT_API_URL}}">Contact</a>');
    fs.writeFileSync(
      path.join(srcDir, 'nested', 'page.html'),
      '<span data-endpoint="{{NEWSLETTER_API_URL}}">Newsletter</span>',
    );
    fs.writeFileSync(path.join(srcDir, 'notes.txt'), 'should be ignored');
    return { root, srcDir, distDir };
  };

  it('loads production environment variables from wrangler.toml', () => {
    const vars = loadVariables('production');

    expect(vars.CONTACT_API_URL).toBe('https://website-forms-production.bluejf-llc.workers.dev/api/contact');
    expect(vars.NEWSLETTER_API_URL).toBe('https://website-forms-production.bluejf-llc.workers.dev/api/newsletter');
  });

  it('replaces placeholders with provided values', () => {
    const html = '<form data-endpoint="{{CONTACT_API_URL}}">{{UNTOUCHED}}</form>';
    const vars = {
      CONTACT_API_URL: 'https://example.com/contact',
      UNRELATED: 'noop',
    };

    const result = replaceVariables(html, vars);

    expect(result).toContain('data-endpoint="https://example.com/contact"');
    expect(result).toContain('{{UNTOUCHED}}');
  });

  it('loads development environment variables separately from production', () => {
    const devVars = loadVariables('dev');
    const prodVars = loadVariables('production');

    expect(devVars.CONTACT_API_URL).toBe('http://127.0.0.1:8787/api/contact');
    expect(prodVars.CONTACT_API_URL).toBe('https://website-forms-production.bluejf-llc.workers.dev/api/contact');
  });

  it('escapes special characters when building regex pattern', () => {
    const expression = escapeRegExp('CONTACT.API+URL?');
    const pattern = new RegExp(expression, 'g');
    const content = 'CONTACT.API+URL?=value CONTACT.API+URL?=other';

    const matches = content.match(pattern);
    expect(matches).toHaveLength(2);
  });

  it('replaces multiple instances of the same placeholder', () => {
    const html = '{{GA_MEASUREMENT_ID}} - {{GA_MEASUREMENT_ID}}';
    const vars = { GA_MEASUREMENT_ID: 'G-123456' };
    const result = replaceVariables(html, vars);

    expect(result).toBe('G-123456 - G-123456');
  });

  it('processes HTML files and writes replaced content when not a dry run', () => {
    const { srcDir, distDir } = createTempProject();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const filesFound = listHtmlFiles(srcDir);
    expect(filesFound.length).toBeGreaterThan(0);

    processHtmlFiles('dev', false, { srcDir, distDir });

    expect(fs.existsSync(distDir)).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'index.html'))).toBe(true);
    const output = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    expect(output).toContain('http://127.0.0.1:8787/api/contact');
    expect(output).not.toMatch(/\{\{/);
    logSpy.mockRestore();
  });

  it('removes dev helper script when producing production HTML', () => {
    const { srcDir, distDir } = createTempProject();
    const filePath = path.join(srcDir, 'with-dev-script.html');
    const scriptSource = `<script defer src="scripts/dev-env.js"></script>
<script src="scripts/dev-env.js" data-test="variation"></script>
<div>content</div>`;
    fs.writeFileSync(filePath, scriptSource);

    processHtmlFiles('production', false, { srcDir, distDir });

    const prodOutput = fs.readFileSync(path.join(distDir, 'with-dev-script.html'), 'utf-8');
    expect(prodOutput).not.toContain('dev-env.js');
    expect(prodOutput).toContain('content');

    const devOutput = applyEnvironmentTransforms(scriptSource, 'dev');
    expect(devOutput).toContain('dev-env.js');
  });

  it('performs dry run without writing files', () => {
    const { srcDir, distDir } = createTempProject();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    processHtmlFiles('dev', true, { srcDir, distDir });

    expect(fs.existsSync(distDir)).toBe(false);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Dry run completed'));
  });

  it('continues processing other files when read fails in dry run mode', () => {
    const { srcDir, distDir } = createTempProject();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const indexFile = path.join(srcDir, 'index.html');
    fs.chmodSync(indexFile, 0o000);

    try {
      expect(() => processHtmlFiles('dev', true, { srcDir, distDir })).not.toThrow();
    } finally {
      fs.chmodSync(indexFile, 0o600);
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[DRY RUN] Continuing with remaining files'),
    );
    // The other file should still be processed, triggering dry-run log for nested page
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Operation: write'));
  });

  it('exits the process when read fails outside dry run', () => {
    const { srcDir, distDir } = createTempProject();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      return undefined as never;
    }) as never);
    const indexFile = path.join(srcDir, 'index.html');
    fs.chmodSync(indexFile, 0o000);

    try {
      processHtmlFiles('dev', false, { srcDir, distDir });
    } finally {
      fs.chmodSync(indexFile, 0o600);
    }

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits when creating dist directory fails', () => {
    const project = createTempProject();
    const { srcDir, root } = project;
    const distDir = path.join(root, 'dist');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      return undefined as never;
    }) as never);

    fs.rmSync(distDir, { recursive: true, force: true });
    fs.chmodSync(root, 0o500);

    try {
      processHtmlFiles('dev', false, { srcDir, distDir });
    } finally {
      fs.chmodSync(root, 0o755);
    }

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits when writing processed file fails', () => {
    const { srcDir, distDir } = createTempProject();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      return undefined as never;
    }) as never);

    fs.mkdirSync(distDir, { recursive: true });
    fs.chmodSync(distDir, 0o500);

    try {
      processHtmlFiles('dev', false, { srcDir, distDir });
    } finally {
      fs.chmodSync(distDir, 0o755);
    }

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('lists all HTML files recursively', () => {
    const { srcDir } = createTempProject();
    const files = listHtmlFiles(srcDir).map((file) => path.relative(srcDir, file));
    expect(files.sort()).toEqual(['index.html', path.join('nested', 'page.html')].sort());
  });

  it('returns empty list when directory missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(listHtmlFiles('/not/a/real/path')).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('warns about unreplaced variables', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    validateReplacement('<div>{{UNFILLED}}</div>', 'test.html');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unreplaced variables'));
    warnSpy.mockRestore();
  });

  describe('maskSensitiveValue', () => {
    it('masks entire secret when length <= 4', () => {
      expect(maskSensitiveValue('API_SECRET', '1234')).toBe('****');
    });

    it('masks all but last four characters for long secrets', () => {
      expect(maskSensitiveValue('API_SECRET', 'abcdefghijkl')).toBe('********ijkl');
    });

    it('truncates non-sensitive long values', () => {
      expect(maskSensitiveValue('NAME', 'x'.repeat(60))).toBe('xxxxxxxxxxxxxxxxxxxx...(60 chars)');
    });

    it('returns short non-sensitive values unchanged', () => {
      expect(maskSensitiveValue('NAME', 'hello')).toBe('hello');
    });
  });
});
