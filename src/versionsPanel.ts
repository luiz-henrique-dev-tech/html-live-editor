import type { MergeView } from '@codemirror/merge';
import type { EditorHandle } from './editor';
import { createDiffView } from './diffView';
import { deleteVersion, listVersions, saveVersion, type SavedVersion } from './versions';
import { escapeHtml } from './escapeHtml';

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const createVersionsPanel = (dialog: HTMLDialogElement, editor: EditorHandle) => {
  const listEl = dialog.querySelector<HTMLElement>('#versions-list')!;
  const diffContainer = dialog.querySelector<HTMLElement>('#versions-diff')!;
  const backButton = dialog.querySelector<HTMLButtonElement>('#btn-versions-back')!;
  let diffView: MergeView | null = null;

  const closeDiff = (): void => {
    diffView?.destroy();
    diffView = null;
    diffContainer.hidden = true;
    diffContainer.innerHTML = '';
    backButton.hidden = true;
    listEl.hidden = false;
  };

  const renderList = (): void => {
    const versions = listVersions();
    listEl.innerHTML = '';

    if (versions.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'versions-empty';
      empty.textContent = 'Nenhuma versão salva ainda.';
      listEl.appendChild(empty);
      return;
    }

    for (const version of versions) {
      listEl.appendChild(renderRow(version));
    }
  };

  const renderRow = (version: SavedVersion): HTMLElement => {
    const row = document.createElement('div');
    row.className = 'version-row';

    const info = document.createElement('div');
    info.className = 'version-info';
    info.innerHTML = `<strong>${escapeHtml(version.label)}</strong><span>${formatDate(version.createdAt)}</span>`;

    const actions = document.createElement('div');
    actions.className = 'version-actions';

    const restoreButton = document.createElement('button');
    restoreButton.type = 'button';
    restoreButton.className = 'pill-button pill-subtle';
    restoreButton.textContent = 'Restaurar';
    restoreButton.addEventListener('click', () => {
      if (window.confirm(`Restaurar "${version.label}"? Isso substitui o conteúdo atual do editor.`)) {
        editor.setValue(version.content);
        dialog.close();
      }
    });

    const compareButton = document.createElement('button');
    compareButton.type = 'button';
    compareButton.className = 'pill-button pill-subtle';
    compareButton.textContent = 'Comparar com atual';
    compareButton.addEventListener('click', () => showDiff(version));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'pill-button pill-subtle';
    deleteButton.textContent = 'Remover';
    deleteButton.addEventListener('click', () => {
      if (window.confirm(`Remover "${version.label}"? Essa ação não pode ser desfeita.`)) {
        deleteVersion(version.id);
        renderList();
      }
    });

    actions.append(restoreButton, compareButton, deleteButton);
    row.append(info, actions);
    return row;
  };

  const showDiff = (version: SavedVersion): void => {
    listEl.hidden = true;
    diffContainer.hidden = false;
    backButton.hidden = false;
    diffView = createDiffView(diffContainer, version.content, editor.getValue());
  };

  backButton.addEventListener('click', closeDiff);
  dialog.addEventListener('close', closeDiff);

  return {
    open: (): void => {
      renderList();
      dialog.showModal();
    },
    saveCurrent: (): void => {
      const input = window.prompt('Nome da versão (opcional):');
      if (input === null) return;
      saveVersion(editor.getValue(), input.trim() || undefined);
    },
  };
};
