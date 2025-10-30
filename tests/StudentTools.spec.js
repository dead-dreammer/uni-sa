import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:5000/');
  await page.getByRole('link', { name: 'Student Tools' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Admissions Calendar' }).click();
  await page.getByLabel('Filter by University:').selectOption('ukzn');
  await page.getByLabel('Filter by Type:').selectOption('bursary');
  await page.getByRole('button', { name: 'Previous' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('6').nth(1).click();
  await page.locator('div').filter({ hasText: '6' }).nth(5).click();
  await page.getByRole('button', { name: 'Reset Filters' }).click();
});