import { describe, expect, it } from 'vitest';
import { buildHighlightPage } from './highlightView';

describe('buildHighlightPage', () => {
  it('escapes the source so it renders as text, not markup', () => {
    const page = buildHighlightPage('<script>alert(1)</script>');
    expect(page).not.toContain('<script>alert(1)</script>');
    expect(page).toContain('&lt;');
    expect(page).toContain('alert(1)');
  });

  it('wraps the result in a standalone HTML document', () => {
    const page = buildHighlightPage('<p>hi</p>');
    expect(page).toContain('<!doctype html>');
    expect(page).toContain('<pre><code>');
  });
});
