export const openPreviewInNewTab = (source: string): void => {
  const blob = new Blob([source], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  window.open(url, '_blank', 'noopener,noreferrer');

  // The new tab has already read the blob by the time it navigates, so it is
  // safe to release the object URL shortly after opening it.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
