import { MergeView } from '@codemirror/merge';
import { EditorState } from '@codemirror/state';
import { lineNumbers } from '@codemirror/view';
import { html } from '@codemirror/lang-html';

export const createDiffView = (parent: HTMLElement, before: string, after: string): MergeView => {
  const readOnly = [lineNumbers(), html(), EditorState.readOnly.of(true)];

  return new MergeView({
    parent,
    highlightChanges: true,
    gutter: true,
    a: { doc: before, extensions: readOnly },
    b: { doc: after, extensions: readOnly },
  });
};
