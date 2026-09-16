import type { EditorHandle } from './editor';
import { filterTemplates, listFolders, listTags, type Template } from './templates';
import { escapeHtml } from './escapeHtml';

export const createTemplatesPanel = (dialog: HTMLDialogElement, editor: EditorHandle) => {
  const folderList = dialog.querySelector<HTMLElement>('#templates-folders')!;
  const tagList = dialog.querySelector<HTMLElement>('#templates-tags')!;
  const grid = dialog.querySelector<HTMLElement>('#templates-grid')!;

  let activeFolder: string | null = null;
  const activeTags = new Set<string>();

  const render = (): void => {
    renderFolders();
    renderTags();
    renderGrid();
  };

  const renderFolders = (): void => {
    folderList.innerHTML = '';
    folderList.appendChild(folderChip('Todas', activeFolder === null, () => setFolder(null)));
    for (const folder of listFolders()) {
      folderList.appendChild(folderChip(folder, activeFolder === folder, () => setFolder(folder)));
    }
  };

  const renderTags = (): void => {
    tagList.innerHTML = '';
    for (const tag of listTags()) {
      tagList.appendChild(tagChip(tag, activeTags.has(tag), () => toggleTag(tag)));
    }
  };

  const renderGrid = (): void => {
    const templates = filterTemplates(activeFolder, [...activeTags]);
    grid.innerHTML = '';

    if (templates.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'templates-empty';
      empty.textContent = 'Nenhum template com esse filtro ainda.';
      grid.appendChild(empty);
      return;
    }

    for (const template of templates) {
      grid.appendChild(templateCard(template));
    }
  };

  const folderChip = (label: string, active: boolean, onClick: () => void): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip${active ? ' chip-active' : ''}`;
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  };

  const tagChip = (label: string, active: boolean, onClick: () => void): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip chip-tag${active ? ' chip-active' : ''}`;
    button.textContent = `#${label}`;
    button.addEventListener('click', onClick);
    return button;
  };

  const templateCard = (template: Template): HTMLElement => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'template-card';
    card.innerHTML = `
      <strong>${escapeHtml(template.label)}</strong>
      <span class="template-folder">${escapeHtml(template.folder)}</span>
      <span class="template-tags">${template.tags.map((tag) => `#${escapeHtml(tag)}`).join(' ')}</span>
    `;
    card.addEventListener('click', () => {
      if (window.confirm(`Carregar "${template.label}"? Isso substitui o conteúdo atual do editor.`)) {
        editor.setValue(template.content);
        dialog.close();
      }
    });
    return card;
  };

  const setFolder = (folder: string | null): void => {
    activeFolder = folder;
    render();
  };

  const toggleTag = (tag: string): void => {
    if (activeTags.has(tag)) {
      activeTags.delete(tag);
    } else {
      activeTags.add(tag);
    }
    render();
  };

  return {
    open: (): void => {
      activeFolder = null;
      activeTags.clear();
      render();
      dialog.showModal();
    },
  };
};
