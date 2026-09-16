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
  await page.keyboard.press('Alt+Digit7');
  expect(await editorContent(page)).toBe('');

  await page.keyboard.press('Alt+Digit6');
  expect(await editorContent(page)).toContain('Hello, world!');
});

test('About dialog opens and closes', async ({ page }) => {
  const dialog = page.locator('#about-dialog');

  await page.getByRole('button', { name: 'About' }).click();
  await expect(dialog.getByRole('heading', { name: 'HTML Live Editor' })).toBeVisible();

  await page.getByRole('button', { name: 'Fechar' }).click();
  await expect(dialog).toBeHidden();
});

test('Preview opens the rendered page in a new tab', async ({ page, context }) => {
  const pagePromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Preview' }).click();
  const newPage = await pagePromise;

  await expect(newPage.getByRole('heading', { name: 'Hello, world!' })).toBeVisible();
});

test('Highlight opens a read-only syntax-highlighted view in a new tab', async ({ page, context }) => {
  const pagePromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Highlight' }).click();
  const newPage = await pagePromise;

  await expect(newPage.locator('pre code')).toContainText('Hello, world!');
});
