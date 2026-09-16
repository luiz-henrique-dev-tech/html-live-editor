const STORAGE_KEY = 'html-live-editor:content';

export const loadSavedContent = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const saveContent = (value: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage can be unavailable; the editor still works, it just will not
    // restore the last session on reload.
  }
};
