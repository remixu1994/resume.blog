import { renderMarkdown } from '@devfolio-blog/markdown';
import { MarkdownCodeCopy } from '@/components/markdown-code-copy';
import { MarkdownMermaid } from '@/components/markdown-mermaid';

export function MarkdownBody({ markdown, html }: { markdown?: string; html?: string }) {
  const rendered = html ?? renderMarkdown(markdown ?? '');

  return (
    <>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: rendered }} />
      <MarkdownMermaid />
      <MarkdownCodeCopy />
    </>
  );
}
