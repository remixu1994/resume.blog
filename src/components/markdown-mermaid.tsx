'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

let initialized = false;

export function MarkdownMermaid() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function renderDiagrams() {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('.markdown-body pre.mermaid')).filter(
        (node) => node.dataset.processed !== 'true',
      );
      if (nodes.length === 0) return;

      const mermaid = (await import('mermaid')).default;
      if (!initialized) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          flowchart: {
            curve: 'linear',
            htmlLabels: true,
            nodeSpacing: 58,
            rankSpacing: 72,
          },
          themeVariables: {
            background: '#ffffff',
            mainBkg: '#f4f1ff',
            primaryColor: '#f4f1ff',
            primaryTextColor: '#26213d',
            primaryBorderColor: '#8b6cf6',
            lineColor: '#2f3437',
            secondaryColor: '#f8f6ff',
            tertiaryColor: '#ffffff',
            clusterBkg: '#ffffff',
            clusterBorder: '#ddd6fe',
            edgeLabelBackground: '#ffffff',
            nodeBorder: '#8b6cf6',
            defaultLinkColor: '#2f3437',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '18px',
          },
        });
        initialized = true;
      }

      try {
        if (!cancelled) {
          await mermaid.run({ nodes });
        }
      } catch (error) {
        nodes.forEach((node) => {
          node.dataset.processed = 'true';
          node.classList.add('mermaid-error');
          node.setAttribute('title', error instanceof Error ? error.message : 'Failed to render Mermaid diagram');
        });
      }
    }

    renderDiagrams();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
