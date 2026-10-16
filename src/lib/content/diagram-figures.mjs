import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';

const assetRoot = new URL('../../../public/assets/diagrams/', import.meta.url);
const text = node => node.type === 'text' ? node.value : (node.children ?? []).map(text).join('');

// Published diagrams are generated once and committed as SVGs. Cloudflare's
// normal static build needs neither Chromium nor a client-side Mermaid bundle.
export default function diagramFigures() {
  return (tree, file) => {
    if (file.data?.astro?.frontmatter?.draft === true || file.data?.frontmatter?.draft === true) return;
    const filename = file.path ?? file.history?.[0];
    if (filename && existsSync(filename)) {
      const frontmatter = readFileSync(filename, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
      if (/^draft:\s*true\s*$/m.test(frontmatter)) return;
    }
    const manifestPath = new URL('manifest.json', assetRoot);
    const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
    const walk = node => {
      if (!node.children) return;
      node.children = node.children.map(child => {
        const code = child.tagName === 'pre' && child.children?.find(entry => entry.tagName === 'code');
        if (code?.properties?.className?.includes('language-mermaid')) {
          const source = text(code).trim();
          const key = createHash('sha256').update(source).digest('hex').slice(0, 20);
          const data = manifest[key];
          if (!data || !existsSync(new URL(`${key}.svg`, assetRoot))) {
            throw new Error('A published diagram has changed. Run npm run render:diagrams and commit the generated SVG assets before building.');
          }
          const src = `/assets/diagrams/${key}.svg`;
          return {
            type: 'element', tagName: 'figure', properties: { className: ['article-diagram'] }, children: [
              { type: 'element', tagName: 'div', properties: { className: ['diagram-scroll'], tabIndex: 0, role: 'region', ariaLabel: 'Architecture diagram, horizontally scrollable' }, children: [
                { type: 'element', tagName: 'img', properties: { src, alt: data.alt, width: data.width, height: data.height, style: `width:${data.width}px`, loading: 'lazy', decoding: 'async' }, children: [] },
              ] },
              { type: 'element', tagName: 'figcaption', properties: {}, children: [
                { type: 'text', value: 'Architecture diagram · Scroll horizontally to explore.' },
                { type: 'element', tagName: 'a', properties: { href: src, target: '_blank', rel: ['noopener','noreferrer'] }, children: [{ type: 'text', value: 'Open full size ↗' }] },
              ] },
            ],
          };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}
