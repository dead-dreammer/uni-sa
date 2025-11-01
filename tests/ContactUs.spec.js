import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:5000/');
  await page.getByRole('navigation').getByRole('link', { name: 'Contact Us' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Mishaylin');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('mishaylin@gmail.com');
  await page.getByRole('textbox', { name: 'Phone' }).click();
  await page.getByRole('textbox', { name: 'Phone' }).fill('0314505678');
  await page.getByLabel('Subject/Topic *').selectOption('admissions');
  await page.getByRole('textbox', { name: 'Message' }).click();
  await page.getByRole('textbox', { name: 'Message' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Message' }).fill('I');
  await page.getByRole('textbox', { name: 'Message' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Message' }).fill('I need help with applying to ');
  await page.getByRole('textbox', { name: 'Message' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Message' }).fill('I need help with applying to R');
  await page.getByRole('textbox', { name: 'Message' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Message' }).fill('I need help with applying to Richfield');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await page.getByText('Go back').click();
});