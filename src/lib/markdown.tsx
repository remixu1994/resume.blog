import { renderMarkdown } from '@devfolio-blog/markdown';

export function MarkdownBody({ markdown, html }: { markdown?: string; html?: string }) {
  const rendered = html ?? renderMarkdown(markdown ?? '');

  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: rendered }} />;
}
