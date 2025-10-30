import { test, expect } from '@playwright/test';

test('record demo test', async ({ page }) => {
  // Go to homepage
  await page.goto('http://127.0.0.1:5000/');

  // Click Login link
  await page.getByRole('navigation').getByRole('link', { name: 'Login' }).click();

  // Fill login form
  await page.getByRole('textbox', { name: 'Email' }).fill('mishaylin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('123467');

  // Handle dialog if any
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  // Submit login
  await page.getByRole('button', { name: 'Login' }).click();

  // Click logout
  await page.getByRole('link', { name: 'Logout' }).click();
});
