import { foldAll, unfoldAll } from '@codemirror/language';
import type { EditorView } from '@codemirror/view';

export const expandAll = (view: EditorView): void => {
  unfoldAll(view);
};

export const collapseAll = (view: EditorView): void => {
  foldAll(view);
};
