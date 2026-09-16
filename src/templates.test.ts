import { describe, expect, it } from 'vitest';
import { filterTemplates, listFolders, listTags, TEMPLATES } from './templates';

describe('templates', () => {
  it('lists every folder without duplicates', () => {
    const folders = listFolders();
    expect(new Set(folders).size).toBe(folders.length);
    expect(folders.length).toBeGreaterThan(0);
  });

  it('lists every tag without duplicates', () => {
    const tags = listTags();
    expect(new Set(tags).size).toBe(tags.length);
  });

  it('returns every template when no filter is applied', () => {
    expect(filterTemplates(null, [])).toHaveLength(TEMPLATES.length);
  });

  it('filters by folder', () => {
    const folder = TEMPLATES[0]!.folder;
    const result = filterTemplates(folder, []);
    expect(result.every((template) => template.folder === folder)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('filters by tag, requiring every selected tag to match', () => {
    const template = TEMPLATES.find((entry) => entry.tags.length > 1)!;
    const result = filterTemplates(null, template.tags);
    expect(result.map((entry) => entry.id)).toContain(template.id);
    expect(result.every((entry) => template.tags.every((tag) => entry.tags.includes(tag)))).toBe(true);
  });
});
