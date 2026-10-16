import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createMermaidRenderer } from 'mermaid-isomorphic';

const destination = new URL('../public/assets/diagrams/', import.meta.url);
await mkdir(destination, { recursive: true });
const directory = new URL('../src/content/blog/', import.meta.url);
const diagrams = new Map();
for (const name of (await readdir(directory)).sort()) {
  if (!name.endsWith('.md')) continue;
  const markdown = await readFile(new URL(name, directory), 'utf8');
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  if (/^draft:\s*true\s*$/m.test(frontmatter)) continue;
  for (const match of markdown.matchAll(/```mermaid\s*\r?\n([\s\S]*?)```/g)) {
    const source = match[1].trim();
    const key = createHash('sha256').update(source).digest('hex').slice(0, 20);
    diagrams.set(key, source);
  }
}

const render = createMermaidRenderer();
const manifest = {};
for (const [key, source] of diagrams) {
  const [result] = await render([source], {
    prefix: `editorial-${key}`,
    mermaidOptions: {
      theme: 'base', fontFamily: 'Arial, sans-serif',
      themeVariables: {
        primaryColor: '#eeebe2', primaryTextColor: '#292824', primaryBorderColor: '#b6ad9e',
        lineColor: '#8e7566', secondaryColor: '#ecdfd3', tertiaryColor: '#f6f3ec',
        fontSize: '15px', edgeLabelBackground: '#f6f3ec',
      },
      flowchart: { htmlLabels: false, padding: 18, nodeSpacing: 35, rankSpacing: 45, curve: 'linear' },
    },
  });
  if (result.status !== 'fulfilled') throw result.reason;
  const { svg, width, height } = result.value;
  await writeFile(new URL(`${key}.svg`, destination), svg);
  const labels = [...source.matchAll(/\["([^"\]]+)"\]/g)].map(match => match[1].replace(/<br\s*\/?\s*>/gi, ', '));
  manifest[key] = {
    width: Math.ceil(width), height: Math.ceil(height),
    alt: `Architecture diagram with: ${labels.join('; ')}.`,
  };
  console.log(`Rendered ${key}.svg`);
}
await writeFile(new URL('manifest.json', destination), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated ${diagrams.size} static diagrams. Commit these assets; ordinary site builds do not launch a browser.`);
