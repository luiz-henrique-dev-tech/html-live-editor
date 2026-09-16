const STORAGE_KEY = 'html-live-editor:theme';

export const getStoredTheme = (): 'dark' | 'light' => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const storeTheme = (theme: 'dark' | 'light'): void => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private browsing, quota exceeded); theme
    // simply will not persist across reloads in that case.
  }
};

export const applyTheme = (theme: 'dark' | 'light'): void => {
  document.documentElement.dataset.theme = theme;
};
