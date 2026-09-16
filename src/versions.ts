const STORAGE_KEY = 'html-live-editor:versions';

export interface SavedVersion {
  id: string;
  label: string;
  content: string;
  createdAt: string;
}

const readAll = (): SavedVersion[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (versions: SavedVersion[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  } catch {
    // Storage can be unavailable; the version is simply not persisted.
  }
};

// Versions are always appended, so reversing gives newest-first without
// relying on createdAt precision (two saves in the same millisecond would
// otherwise tie when sorted by timestamp alone).
export const listVersions = (): SavedVersion[] => [...readAll()].reverse();

export const saveVersion = (content: string, label?: string): SavedVersion => {
  const versions = readAll();
  const createdAt = new Date().toISOString();
  const version: SavedVersion = {
    id: crypto.randomUUID(),
    label: label?.trim() || `Versão ${versions.length + 1}`,
    content,
    createdAt,
  };

  writeAll([...versions, version]);
  return version;
};

export const deleteVersion = (id: string): void => {
  writeAll(readAll().filter((version) => version.id !== id));
};

export const getVersion = (id: string): SavedVersion | undefined => readAll().find((version) => version.id === id);
