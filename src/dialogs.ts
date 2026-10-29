import { escapeHtml } from './escapeHtml';

const buildDialog = (): HTMLDialogElement => {
  const dialog = document.createElement('dialog');
  dialog.className = 'app-dialog';
  document.body.appendChild(dialog);
  return dialog;
};

// Replaces window.confirm/prompt, which render as plain OS chrome that
// clashes with the rest of the UI. Any interpolated user text (a version
// label, a template name) must already be inside `message`; it is escaped
// here before going into innerHTML, the same discipline used everywhere
// else user-authored strings reach the DOM.
export const confirmDialog = (message: string, confirmLabel = 'Confirmar'): Promise<boolean> =>
  new Promise((resolve) => {
    const dialog = buildDialog();
    dialog.innerHTML = `
      <p>${escapeHtml(message)}</p>
      <div class="dialog-actions">
        <button type="button" class="pill-button pill-subtle" data-action="cancel">Cancelar</button>
        <button type="button" class="pill-button pill-primary" data-action="confirm">${escapeHtml(confirmLabel)}</button>
      </div>
    `;

    const finish = (value: boolean): void => {
      dialog.close();
      dialog.remove();
      resolve(value);
    };

    dialog.querySelector('[data-action="cancel"]')!.addEventListener('click', () => finish(false));
    dialog.querySelector('[data-action="confirm"]')!.addEventListener('click', () => finish(true));
    dialog.addEventListener('cancel', () => finish(false));
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('[data-action="confirm"]')!.focus();
  });

export const promptDialog = (message: string, confirmLabel = 'Salvar'): Promise<string | null> =>
  new Promise((resolve) => {
    const dialog = buildDialog();
    dialog.innerHTML = `
      <p>${escapeHtml(message)}</p>
      <form method="dialog">
        <input type="text" class="dialog-input" autocomplete="off" aria-label="${escapeHtml(message)}" />
        <div class="dialog-actions">
          <button type="button" class="pill-button pill-subtle" data-action="cancel">Cancelar</button>
          <button type="submit" class="pill-button pill-primary" data-action="confirm">${escapeHtml(confirmLabel)}</button>
        </div>
      </form>
    `;

    const input = dialog.querySelector<HTMLInputElement>('.dialog-input')!;
    const form = dialog.querySelector('form')!;

    const finish = (value: string | null): void => {
      dialog.close();
      dialog.remove();
      resolve(value);
    };

    dialog.querySelector('[data-action="cancel"]')!.addEventListener('click', () => finish(null));
    dialog.addEventListener('cancel', () => finish(null));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      finish(input.value);
    });
    dialog.showModal();
    input.focus();
  });
