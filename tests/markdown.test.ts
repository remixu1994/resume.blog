import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '@devfolio-blog/markdown';

describe('markdown rendering', () => {
  it('renders headings and paragraphs to html', () => {
    const html = renderMarkdown('## Title\n\nBody text');

    expect(html).toContain('<h2>Title</h2>');
    expect(html).toContain('<p>Body text</p>');
  });

  it('renders technical markdown blocks', () => {
    const html = renderMarkdown(`# Title

- first
- second

\`\`\`bash
top
\`\`\`

| Metric | Meaning |
| --- | --- |
| load | system load |

> Keep monitoring.`);

    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<figure class="code-block" data-code-block>');
    expect(html).toContain('<span class="code-block-language">bash</span>');
    expect(html).toContain('<button class="code-block-copy" type="button" data-copy-code');
    expect(html).toContain('<pre><code class="language-bash" data-code>top');
    expect(html).toContain('<table>');
    expect(html).toContain('<blockquote>');
  });

  it('strips frontmatter before rendering', () => {
    const html = renderMarkdown(`---
title: Hidden metadata
---

## Visible title`);

    expect(html).not.toContain('Hidden metadata');
    expect(html).toContain('<h2>Visible title</h2>');
  });

  it('strips CRLF-delimited frontmatter before rendering', () => {
    const html = renderMarkdown('---\r\ntitle: Hidden metadata\r\n---\r\n\r\n## Visible title');

    expect(html).not.toContain('Hidden metadata');
    expect(html).not.toContain('title:');
    expect(html).toContain('<h2>Visible title</h2>');
  });
});
