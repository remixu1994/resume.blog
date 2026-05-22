import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '@devfolio-blog/markdown';

describe('markdown rendering', () => {
  it('renders headings and paragraphs to html', () => {
    const html = renderMarkdown('## Title\n\nBody text');

    expect(html).toContain('<h2>Title</h2>');
    expect(html).toContain('<p>Body text</p>');
  });
});
