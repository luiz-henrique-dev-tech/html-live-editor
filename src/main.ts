import './style.css';
import { createEditor } from './editor';
import { collapseAll, expandAll } from './folding';
import { formatHtml } from './format';
import { readFileAsText, exportToFile } from './fileIO';
import { SAMPLE_HTML } from './sample';
import { applyTheme, getStoredTheme, storeTheme } from './theme';
import { loadSavedContent, saveContent } from './persistence';
import { debounce } from './debounce';
import { createLiveChannel, type LiveMessage } from './liveChannel';
import { createVersionsPanel } from './versionsPanel';
import { createTemplatesPanel } from './templatesPanel';

const previewFrame = document.querySelector<HTMLIFrameElement>('#preview-frame')!;
const editorContainer = document.querySelector<HTMLElement>('#editor')!;
const liveChannel = createLiveChannel();

const broadcastLive = (html: string): void => {
  const message: LiveMessage = { type: 'update', html };
  liveChannel.postMessage(message);
};

const updatePreview = debounce((source: string) => {
  previewFrame.srcdoc = source;
}, 250);

const persistContent = debounce((source: string) => saveContent(source), 500);

const broadcastLiveDebounced = debounce(broadcastLive, 150);

const initialContent = loadSavedContent() ?? SAMPLE_HTML;

const editor = createEditor(editorContainer, initialContent, (value) => {
  updatePreview(value);
  persistContent(value);
  broadcastLiveDebounced(value);
});

previewFrame.srcdoc = initialContent;

// A live preview tab opened after this session started has no content yet;
// it asks for the current value on load, and this responds immediately.
liveChannel.onmessage = (event: MessageEvent<LiveMessage>) => {
  if (event.data.type === 'request') {
    broadcastLive(editor.getValue());
  }
};

let theme = getStoredTheme();
applyTheme(theme);
editor.setDark(theme === 'dark');

const themeButton = document.querySelector<HTMLButtonElement>('#btn-theme')!;
themeButton.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';

const toggleTheme = (): void => {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  storeTheme(theme);
  editor.setDark(theme === 'dark');
  themeButton.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
};

const versionsDialog = document.querySelector<HTMLDialogElement>('#versions-dialog')!;
const versionsPanel = createVersionsPanel(versionsDialog, editor);

const templatesDialog = document.querySelector<HTMLDialogElement>('#templates-dialog')!;
const templatesPanel = createTemplatesPanel(templatesDialog, editor);

const actions: Record<string, () => void> = {
  'btn-undo': () => editor.undo(),
  'btn-redo': () => editor.redo(),
  'btn-format': () => editor.setValue(formatHtml(editor.getValue())),
  'btn-expand': () => expandAll(editor.view),
  'btn-collapse': () => collapseAll(editor.view),
  'btn-templates': () => templatesPanel.open(),
  'btn-sample': () => editor.setValue(SAMPLE_HTML),
  'btn-clear': () => editor.setValue(''),
  'btn-save-version': () => versionsPanel.saveCurrent(),
  'btn-versions': () => versionsPanel.open(),
  'btn-live-preview': () => {
    broadcastLive(editor.getValue());
    window.open('/preview.html', '_blank', 'noopener,noreferrer');
  },
};

for (const [id, action] of Object.entries(actions)) {
  document.querySelector<HTMLButtonElement>(`#${id}`)!.addEventListener('click', action);
}

themeButton.addEventListener('click', toggleTheme);

const fileInput = document.querySelector<HTMLInputElement>('#file-input')!;
document.querySelector<HTMLButtonElement>('#btn-import')!.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  readFileAsText(file)
    .then((content) => editor.setValue(content))
    .catch(() => {
      // Silently ignore an unreadable file; the editor content is unchanged.
    })
    .finally(() => {
      fileInput.value = '';
    });
});

document.querySelector<HTMLButtonElement>('#btn-export')!.addEventListener('click', () => {
  exportToFile(editor.getValue());
});

const aboutDialog = document.querySelector<HTMLDialogElement>('#about-dialog')!;
document.querySelector<HTMLButtonElement>('#btn-about')!.addEventListener('click', () => aboutDialog.showModal());
document.querySelector<HTMLButtonElement>('#btn-about-close')!.addEventListener('click', () => aboutDialog.close());
document
  .querySelector<HTMLButtonElement>('#btn-versions-close')!
  .addEventListener('click', () => versionsDialog.close());
document
  .querySelector<HTMLButtonElement>('#btn-templates-close')!
  .addEventListener('click', () => templatesDialog.close());

const SHORTCUTS: Record<string, () => void> = {
  Digit1: () => actions['btn-format']!(),
  Digit2: () => actions['btn-expand']!(),
  Digit3: () => actions['btn-collapse']!(),
  Digit4: () => actions['btn-sample']!(),
  Digit5: () => actions['btn-clear']!(),
  Digit6: () => actions['btn-save-version']!(),
  Digit7: () => actions['btn-live-preview']!(),
};

window.addEventListener('keydown', (event) => {
  if (!event.altKey) return;
  const handler = SHORTCUTS[event.code];
  if (!handler) return;
  event.preventDefault();
  handler();
});
