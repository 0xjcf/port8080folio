// @vitest-environment node

import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import katex from 'katex';

const require = createRequire(import.meta.url);

const render = (tex: string, displayMode = false) =>
  katex.renderToString(tex, {
    throwOnError: true,
    displayMode,
    output: 'htmlAndMathml',
  });

describe('KaTeX 0.18 math rendering', () => {
  it('resolves the 0.18 release used by Mermaid', () => {
    const version = require('katex/package.json').version as string;
    expect(version).toMatch(/^0\.18\./);
  });

  it('renders superscripts, fractions, roots, sums, and matrices', () => {
    const square = render('E = mc^2');
    expect(square).toContain('class="katex"');
    expect(square).toContain('<mi>E</mi>');
    expect(square).toContain('<msup><mi>c</mi><mn>2</mn></msup>');
    expect(square).toContain('class="katex-html"');

    const fraction = render('\\frac{a}{b}');
    expect(fraction).toContain('<mfrac><mi>a</mi><mi>b</mi></mfrac>');

    const radical = render('\\sqrt{x^2+y^2}');
    expect(radical).toContain('<msqrt>');
    expect(radical).toContain('<msup><mi>x</mi><mn>2</mn></msup>');
    expect(radical).toContain('<msup><mi>y</mi><mn>2</mn></msup>');

    const sum = render('\\sum_{i=1}^{n} i', true);
    expect(sum).toContain('class="katex-display"');
    expect(sum).toContain('<munderover><mo>∑</mo>');
    expect(sum).toContain('<mi>n</mi></munderover>');

    const matrix = render('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}');
    expect(matrix).toContain('<mtable');
    expect(matrix).toContain('<mi>a</mi>');
    expect(matrix).toContain('<mi>d</mi>');
    expect(matrix).toContain('fence="true"');
  });

  it('rejects incomplete TeX instead of emitting partial markup', () => {
    expect(() => render('\\frac{1}{')).toThrow(/ParseError|KaTeX parse error/);
  });
});
