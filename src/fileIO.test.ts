import { describe, expect, it } from 'vitest';
import { buildExportFilename, readFileAsText } from './fileIO';

describe('buildExportFilename', () => {
  it('formats the date as export-YYYY-MM-DD-HHmm.html', () => {
    const date = new Date(2026, 8, 16, 7, 5);
    expect(buildExportFilename(date)).toBe('export-2026-09-16-0705.html');
  });
});

describe('readFileAsText', () => {
  it('resolves with the file contents', async () => {
    const file = new File(['<p>hi</p>'], 'sample.html', { type: 'text/html' });
    await expect(readFileAsText(file)).resolves.toBe('<p>hi</p>');
  });
});
