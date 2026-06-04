'use client';

import { useEffect } from 'react';

const copiedLabel = 'Copied';
const defaultLabel = 'Copy';

export function MarkdownCodeCopy() {
  useEffect(() => {
    async function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const button = target.closest<HTMLButtonElement>('[data-copy-code]');
      if (!button) return;

      const block = button.closest<HTMLElement>('[data-code-block]');
      const code = block?.querySelector<HTMLElement>('[data-code]');
      const text = code?.innerText;
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        button.textContent = copiedLabel;
        window.setTimeout(() => {
          button.textContent = defaultLabel;
        }, 1400);
      } catch {
        button.textContent = 'Failed';
        window.setTimeout(() => {
          button.textContent = defaultLabel;
        }, 1400);
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
