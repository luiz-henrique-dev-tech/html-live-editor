import { test } from '@playwright/test';

test('capture a screenshot for the README', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'docs/screenshot.png' });
});
