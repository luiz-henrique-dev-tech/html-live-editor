import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import {
  foldGutter,
  indentOnInput,
  bracketMatching,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language';
import { defaultKeymap, history, historyKeymap, indentWithTab, undo, redo } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

const themeCompartment = new Compartment();

export interface EditorHandle {
  view: EditorView;
  getValue: () => string;
  setValue: (value: string) => void;
  setDark: (dark: boolean) => void;
  undo: () => void;
  redo: () => void;
}

export const createEditor = (
  parent: HTMLElement,
  initialValue: string,
  onChange: (value: string) => void,
): EditorHandle => {
  const state = EditorState.create({
    doc: initialValue,
    extensions: [
      lineNumbers(),
      foldGutter(),
      highlightActiveLine(),
      history(),
      indentOnInput(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      html(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      themeCompartment.of([]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
    ],
  });

  const view = new EditorView({ state, parent });

  return {
    view,
    getValue: () => view.state.doc.toString(),
    setValue: (value: string) => {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
    },
    setDark: (dark: boolean) => {
      view.dispatch({ effects: themeCompartment.reconfigure(dark ? oneDark : []) });
    },
    undo: () => {
      undo(view);
    },
    redo: () => {
      redo(view);
    },
  };
};
