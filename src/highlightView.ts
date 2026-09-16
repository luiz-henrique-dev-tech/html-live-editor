import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('xml', xml);

export const buildHighlightPage = (source: string): string => {
  const highlighted = hljs.highlight(source, { language: 'xml' }).value;

  return `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<title>Highlighted source</title>
<style>
  body { margin: 0; background: #0d1117; }
  pre { margin: 0; padding: 16px; overflow: auto; font-size: 13px; line-height: 1.5; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; }
</style>
</head>
<body>
<pre><code>${highlighted}</code></pre>
</body>
</html>`;
};

export const openHighlightInNewTab = (source: string): void => {
  const blob = new Blob([buildHighlightPage(source)], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
