import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:5000/');
  await page.getByRole('navigation').getByRole('link', { name: 'START MY SEARCH!' }).click();
  await page.getByRole('link', { name: 'Download' }).first().click();
  await page.getByRole('link', { name: 'Download' }).nth(1).click();
  await page.getByRole('button', { name: '♡' }).first().click();
  await page.getByRole('button', { name: '♡' }).nth(1).click();
  await page.getByRole('button', { name: '♡' }).nth(2).click();
  await page.getByRole('button', { name: '♡' }).nth(3).click();
  await page.getByRole('button', { name: '✕' }).first().click();
  await page.getByRole('button', { name: '✕' }).nth(1).click();
  await page.getByRole('link', { name: 'Back to Top ↑' }).click();
  await page.getByRole('link', { name: 'Edit' }).click();
});