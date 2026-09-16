import { beforeEach, describe, expect, it } from 'vitest';
import { deleteVersion, getVersion, listVersions, saveVersion } from './versions';

beforeEach(() => {
  localStorage.clear();
});

describe('versions', () => {
  it('saves a version with an auto-generated label when none is given', () => {
    const version = saveVersion('<p>a</p>');
    expect(version.label).toBe('Versão 1');
    expect(version.content).toBe('<p>a</p>');
  });

  it('uses a custom label when given', () => {
    const version = saveVersion('<p>a</p>', 'Antes do redesign');
    expect(version.label).toBe('Antes do redesign');
  });

  it('lists versions newest first', () => {
    const first = saveVersion('<p>1</p>');
    const second = saveVersion('<p>2</p>');

    const [newest, oldest] = listVersions();
    expect(newest!.id).toBe(second.id);
    expect(oldest!.id).toBe(first.id);
  });

  it('deletes a version by id', () => {
    const version = saveVersion('<p>a</p>');
    deleteVersion(version.id);

    expect(getVersion(version.id)).toBeUndefined();
    expect(listVersions()).toHaveLength(0);
  });
});
