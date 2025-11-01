import { test, expect } from '@playwright/test';

test('chat opens and sends messages', async ({ page }) => {
  await page.goto('http://127.0.0.1:5000/');

  // Force click to bypass stability checks
  await page.locator('#chatButton').click({ force: true });
  await expect(page.locator('#chatWidget')).toHaveClass(/open/);

  // Send message 1
  await page.fill('#userInput', 'Hi');
  await page.click('#sendButton');
  await page.waitForSelector('#typingIndicator', { state: 'visible' }); // Wait for typing indicator
  await page.waitForSelector('#typingIndicator', { state: 'hidden' });  // Wait for response

  // Send message 2
  await page.fill('#userInput', 'Whats up');
  await page.click('#sendButton');
  await page.waitForSelector('#typingIndicator', { state: 'visible' });
  await page.waitForSelector('#typingIndicator', { state: 'hidden' });

  // Send message 3
  await page.fill('#userInput', 'Tell me about Richfield');
  await page.click('#sendButton');
  await page.waitForSelector('#typingIndicator', { state: 'visible' });
  await page.waitForSelector('#typingIndicator', { state: 'hidden' });

  // Send message 4
  await page.fill('#userInput', 'Introduce the team');
  await page.click('#sendButton');
  await page.waitForSelector('#typingIndicator', { state: 'visible' });
  await page.waitForSelector('#typingIndicator', { state: 'hidden' });

  // Send message 5
  await page.fill('#userInput', 'Goodbye');
  await page.click('#sendButton');
  await page.waitForSelector('#typingIndicator', { state: 'visible' });
  await page.waitForSelector('#typingIndicator', { state: 'hidden' });

  // Verify messages appear in chat
  const messages = page.locator('.message:not(#typingIndicator)');
  await expect(messages).toHaveCount(10); // 5 user + 5 bot messages
});
