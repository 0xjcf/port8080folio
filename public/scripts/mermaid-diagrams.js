(() => {
  let mermaidPromise = null;

  const loadMermaid = async () => {
    if (!mermaidPromise) {
      mermaidPromise = import(
        'https://cdn.jsdelivr.net/npm/mermaid@10.9.5/dist/mermaid.esm.min.mjs'
      ).then((mod) => mod.default ?? mod);
    }
    return mermaidPromise;
  };

  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  const selectors = [
    "pre[data-language='mermaid']",
    "pre[data-lang='mermaid']",
    'pre > code.language-mermaid',
    "pre > code[data-language='mermaid']",
    "pre > code[data-lang='mermaid']",
  ].join(', ');

  const cssVar = (name, fallback = '') =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

  const getThemeVars = () => ({
    text: '#475569',
    nodeText: '#111827',
    border: '#cbd5e1',
    surfaceAlt: '#f1f5f9',
    labelBg: 'rgba(241, 245, 249, 0.95)',
    labelText: '#111827',
    line: '#94a3b8',
    bg: 'transparent',
    font: cssVar('--font-sans', 'Inter, system-ui, sans-serif'),
  });

  const applyLabelStyles = (svg) => {
    if (!svg) return;
    svg.style.overflow = 'visible';
  };

  const renderDiagram = async (diagram, options = {}) => {
    const { force = false } = options;
    if (diagram.rendering) return;
    if (diagram.rendered && !force) return;
    diagram.rendering = true;
    const theme = getThemeVars();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    try {
      const mermaid = await loadMermaid();
      const isSequenceDiagram = /^\s*sequenceDiagram/.test(diagram.source);
      const sequenceThemeVars = isSequenceDiagram
        ? {
          actorBkg: theme.surfaceAlt,
          actorBorder: theme.border,
          actorTextColor: theme.nodeText,
          signalColor: theme.line,
          signalTextColor: theme.line,
          noteBkg: theme.labelBg,
          noteTextColor: theme.labelText,
        }
        : {};
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        themeVariables: {
          background: theme.bg,
          fontFamily: theme.font,
          fontSize: '18px',
          primaryColor: theme.surfaceAlt,
          primaryTextColor: theme.nodeText,
          primaryBorderColor: theme.border,
          secondaryColor: theme.surfaceAlt,
          tertiaryColor: theme.surfaceAlt,
          lineColor: theme.line,
          edgeLabelBackground: theme.labelBg,
          edgeLabelColor: theme.labelText,
          labelBackground: theme.labelBg,
          labelTextColor: theme.labelText,
          padding: 16,
          ...sequenceThemeVars,
        },
        flowchart: {
          htmlLabels: true,
          wrap: true,
          useMaxWidth: true,
          padding: 16,
          labelSpacing: 24,
          nodeSpacing: 80,
          rankSpacing: 100,
          curve: 'monotoneX',
        },
        themeCSS: `
          .edgeLabel .labelBkg {
            background: ${theme.labelBg};
            color: ${theme.labelText};
            padding: 4px 8px;
            border-radius: 10px;
            line-height: 1.4;
          }
          .edgeLabel span,
          .edgeLabel p {
            color: ${theme.labelText};
            font-weight: 500;
            line-height: 1.4;
            text-align: center;
          }
          /* Sequence diagram message labels */
          .messageText,
          .messageText tspan,
          .messageText span,
          .messageText p {
            fill: ${theme.line};
            color: ${theme.line};
          }
          .node .label {
            text-align: center;
          }
          ${isDark ? `
          marker path,
          .marker path,
          .arrowheadPath {
            fill: ${theme.line};
            stroke: ${theme.line};
          }
          ` : ''}
        `,
      });

      diagram.mermaidPre.textContent = diagram.source;
      await mermaid.run({ nodes: [diagram.mermaidPre], suppressErrors: true });
      const svg = diagram.mermaidPre.querySelector('svg');
      applyLabelStyles(svg);
      diagram.svg = svg;
      diagram.rendered = true;
    } catch (error) {
      const errorBox = document.createElement('div');
      errorBox.className = 'diagram__error';
      errorBox.textContent = 'Diagram unavailable.';
      diagram.container.replaceChildren(errorBox);
      console.error('Mermaid render failed', error);
    } finally {
      diagram.rendering = false;
    }
  };

  onReady(() => {
    const root = document.querySelector('.writing-article__content');
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll(selectors));
    const seen = new Set();
    const diagrams = nodes
      .map((node, index) => {
        const pre = node.tagName === 'PRE' ? node : node.closest('pre');
        if (!pre || seen.has(pre)) return null;
        seen.add(pre);

        const code = node.tagName === 'CODE' ? node : pre.querySelector('code');
        const source = (code?.textContent || pre.textContent || '').trim();
        if (!source) return null;

        const figure = document.createElement('figure');
        figure.className = 'diagram';

        const mermaidPre = document.createElement('pre');
        mermaidPre.className = 'mermaid';
        mermaidPre.textContent = source;
        figure.appendChild(mermaidPre);

        pre.replaceWith(figure);

        const maybeCaption = figure.nextElementSibling;
        if (maybeCaption && maybeCaption.tagName === 'P') {
          const figcaption = document.createElement('figcaption');
          figcaption.className = 'diagram__caption';
          figcaption.innerHTML = maybeCaption.innerHTML;
          figure.appendChild(figcaption);
          maybeCaption.remove();
        }

        return {
          index,
          mermaidPre,
          container: figure,
          source,
          rendered: false,
          rendering: false,
          svg: null,
        };
      })
      .filter(Boolean);

    if (!diagrams.length) return;

    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const diagram = entry.target.__diagramRef;
              if (!diagram) return;
              if (entry.isIntersecting) {
                renderDiagram(diagram);
              }
            });
          },
          { rootMargin: '300px 0px', threshold: 0 },
        )
        : null;

    diagrams.forEach((diagram) => {
      diagram.container.__diagramRef = diagram;
      if (observer) {
        observer.observe(diagram.container);
      } else {
        renderDiagram(diagram);
      }
    });

  });
})();
