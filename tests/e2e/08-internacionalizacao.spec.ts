import { test, expect } from '@playwright/test';
import * as matchesMock from './fixtures/matches.json';
import * as resourcesMock from './fixtures/ui-resources.json';

test.describe('08 - Internacionalizacao', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v3/calendar/matches**', async route => route.fulfill({ json: matchesMock }));
    await page.route('**/api/resources**', async route => route.fulfill({ json: resourcesMock }));
    await page.goto('/');
  });

  test('should change language and persist it', async ({ page }) => {
    // Language toggle is in the global sidebar
    await page.click('button:has-text("EN")');
    const lang = await page.evaluate(() => localStorage.getItem('language'));
    expect(lang).toBe('en');
  });
});
