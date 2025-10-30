import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:5000/');
  await page.getByRole('navigation').getByRole('link', { name: 'How it Works' }).click();
  await page.getByRole('link', { name: 'START MY SEARCH NOW' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'How it Works' }).click();
  await page.getByRole('contentinfo').getByRole('link', { name: 'How it Works' }).click();
  await page.getByRole('link', { name: 'Back to Top ↑' }).click();
});