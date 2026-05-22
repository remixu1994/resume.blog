import { describe, expect, it } from 'vitest';
import { getResumeViewModel } from '@/content/site-content';

describe('resume contact data', () => {
  it('provides contact email for zh and en resume profiles', () => {
    expect(getResumeViewModel('zh').resume.contactEmail).toMatch(/@/);
    expect(getResumeViewModel('en').resume.contactEmail).toMatch(/@/);
  });
});
