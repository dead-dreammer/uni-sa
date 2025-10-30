import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:5000/');
  await page.getByRole('navigation').getByRole('link', { name: 'Home' }).click();
  await page.getByRole('textbox', { name: 'Search courses, universities' }).click();
  await page.getByRole('textbox', { name: 'Search courses, universities' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Search courses, universities' }).fill('R');
  await page.getByRole('textbox', { name: 'Search courses, universities' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Search courses, universities' }).fill('Richfield');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('navigation').getByRole('listitem').filter({ hasText: 'Home' }).click();
  await page.getByRole('link', { name: 'Start Your Search' }).click();
  await page.getByRole('navigation').getByRole('listitem').filter({ hasText: 'Home' }).click();
  await page.getByRole('link', { name: 'Learn More About Us' }).click();
  await page.getByRole('navigation').getByRole('listitem').filter({ hasText: 'Home' }).click();
  await page.getByRole('link', { name: 'Back to Top ↑' }).click();
  await page.getByRole('contentinfo').getByRole('link', { name: 'Home' }).click();
});