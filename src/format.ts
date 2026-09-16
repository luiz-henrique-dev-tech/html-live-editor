import { html_beautify } from 'js-beautify';

export const formatHtml = (source: string): string =>
  html_beautify(source, {
    indent_size: 2,
    wrap_line_length: 120,
    end_with_newline: true,
    preserve_newlines: true,
    max_preserve_newlines: 1,
  });
