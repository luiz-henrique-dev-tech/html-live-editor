import { expect, test } from '@playwright/test';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const editorContent = async (page: import('@playwright/test').Page) =>
  (await page.locator('.cm-content').innerText()).trim();

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads with the sample HTML already rendered in the preview', async ({ page }) => {
  const frame = page.frameLocator('#preview-frame');
  await expect(frame.getByRole('heading', { name: 'Hello, world!' })).toBeVisible();
});

test('typing in the editor updates the live preview', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.locator('.cm-content').click();
  await page.keyboard.type('<h1>Typed content</h1>');

  const frame = page.frameLocator('#preview-frame');
  await expect(frame.getByRole('heading', { name: 'Typed content' })).toBeVisible();
});

test('Format beautifies minified HTML', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.locator('.cm-content').click();
  await page.keyboard.type('<div><p>a</p><p>b</p></div>');
  await page.getByRole('button', { name: 'Format' }).click();

  const text = await editorContent(page);
  expect(text.split('\n').length).toBeGreaterThan(1);
});

test('Sample restores the example content after Clear', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear' }).click();
  expect(await editorContent(page)).toBe('');

  await page.getByRole('button', { name: 'Sample' }).click();
  expect(await editorContent(page)).toContain('Hello, world!');
});

test('Undo reverts the last change and Redo brings it back', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear' }).click();
  expect(await editorContent(page)).toBe('');

  // CodeMirror groups replace transactions into one undo step when they land
  // within its history grouping window; two clicks this close together is
  // not a realistic editing pace, so this waits past that window on purpose.
  await page.waitForTimeout(600);

  await page.getByRole('button', { name: 'Sample' }).click();
  expect(await editorContent(page)).toContain('Hello, world!');

  await page.getByRole('button', { name: 'Undo' }).click();
  expect(await editorContent(page)).toBe('');

  await page.getByRole('button', { name: 'Redo' }).click();
  expect(await editorContent(page)).toContain('Hello, world!');
});

test('Dark mode toggles the theme and persists across a reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Light mode' })).toBeVisible();
});

test('Export to file downloads the current content as HTML', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export to file' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^export-.*\.html$/);
});

test('Import from file loads a local HTML file into the editor', async ({ page }) => {
  const filePath = join(tmpdir(), `html-live-editor-import-${Date.now()}.html`);
  writeFileSync(filePath, '<p>Imported from disk</p>');

  try {
    await page.locator('#file-input').setInputFiles(filePath);
    expect(await editorContent(page)).toContain('Imported from disk');
  } finally {
    unlinkSync(filePath);
  }
});

test('keyboard shortcuts trigger the same actions as their buttons', async ({ page }) => {
  await page.keyboard.press('Alt+Digit5');
  expect(await editorContent(page)).toBe('');

  await page.keyboard.press('Alt+Digit4');
  expect(await editorContent(page)).toContain('Hello, world!');
});

test('About dialog opens and closes', async ({ page }) => {
  const dialog = page.locator('#about-dialog');

  await page.getByRole('button', { name: 'About' }).click();
  await expect(dialog.getByRole('heading', { name: 'HTML Live Editor' })).toBeVisible();

  await page.getByRole('button', { name: 'Fechar' }).click();
  await expect(dialog).toBeHidden();
});

test('Live preview opens with the current content and keeps updating as you type', async ({ page, context }) => {
  const pagePromise = context.waitForEvent('page');
  await page.locator('#btn-live-preview').click();
  const livePage = await pagePromise;

  const liveFrame = livePage.frameLocator('#preview-frame');
  await expect(liveFrame.getByRole('heading', { name: 'Hello, world!' })).toBeVisible();

  await page.locator('.cm-content').click();
  await page.keyboard.press('Control+End');
  await page.keyboard.type('<h2>Second screen</h2>');

  await expect(liveFrame.getByRole('heading', { name: 'Second screen' })).toBeVisible();
});

test('Live preview opened before any edits still receives the current content', async ({ page, context }) => {
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.locator('.cm-content').click();
  await page.keyboard.type('<p>Already here before the tab opened</p>');

  const pagePromise = context.waitForEvent('page');
  await page.locator('#btn-live-preview').click();
  const livePage = await pagePromise;

  const liveFrame = livePage.frameLocator('#preview-frame');
  await expect(liveFrame.getByText('Already here before the tab opened')).toBeVisible();
});

test('saving a version and restoring it round-trips the content', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.locator('.cm-content').click();
  await page.keyboard.type('<p>version one</p>');

  await page.getByRole('button', { name: 'Save version' }).click();
  await page.locator('.dialog-input').fill('Primeira versão');
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.getByRole('button', { name: 'Clear' }).click();
  expect(await editorContent(page)).toBe('');

  await page.getByRole('button', { name: 'Versions' }).click();
  await expect(page.getByText('Primeira versão')).toBeVisible();

  await page.getByRole('button', { name: 'Restaurar' }).click();
  await page.locator('dialog.app-dialog:not([id])').getByRole('button', { name: 'Restaurar' }).click();

  expect(await editorContent(page)).toContain('version one');
});

test('comparing a saved version against the current content shows a diff view', async ({ page }) => {
  await page.getByRole('button', { name: 'Save version' }).click();
  await page.locator('.dialog-input').fill('Base');
  await page.getByRole('button', { name: 'Salvar' }).click();

  await page.locator('.cm-content').click();
  await page.keyboard.press('Control+End');
  await page.keyboard.type('<p>changed</p>');

  await page.getByRole('button', { name: 'Versions' }).click();
  await page.getByRole('button', { name: 'Comparar com atual' }).click();

  await expect(page.locator('.cm-mergeView')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Voltar à lista' })).toBeVisible();
});

test('loading a template replaces the editor content', async ({ page }) => {
  await page.getByRole('button', { name: 'Templates' }).click();
  await expect(page.getByText('Formulário de contato')).toBeVisible();

  await page.getByRole('button', { name: /Formulário de contato/ }).click();
  await page.getByRole('button', { name: 'Carregar' }).click();

  expect(await editorContent(page)).toContain('form');
});

test('filtering templates by folder narrows the grid', async ({ page }) => {
  await page.getByRole('button', { name: 'Templates' }).click();
  await page.getByRole('button', { name: 'E-mail', exact: true }).click();

  await expect(page.getByText('E-mail HTML: newsletter')).toBeVisible();
  await expect(page.getByText('Formulário de contato')).toBeHidden();
});

test('capture a screenshot for the README', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'docs/screenshot.png' });
});
