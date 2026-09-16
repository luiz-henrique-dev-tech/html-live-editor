import { describe, expect, it } from 'vitest';
import { formatHtml } from './format';

describe('formatHtml', () => {
  it('breaks sibling block elements onto separate lines', () => {
    const result = formatHtml('<div><p>a</p><p>b</p></div>');
    expect(result.split('\n').length).toBeGreaterThan(1);
  });

  it('indents nested block elements', () => {
    const result = formatHtml('<div><div><p>x</p></div></div>');
    expect(result).toContain('    <p>x</p>');
  });

  it('leaves already well-formatted HTML stable', () => {
    const input = '<p>hello</p>\n';
    expect(formatHtml(input)).toBe(formatHtml(formatHtml(input)));
  });
});
