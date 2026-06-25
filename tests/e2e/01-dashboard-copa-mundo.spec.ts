import { test, expect } from '@playwright/test';
import * as matchesMock from './fixtures/matches.json';
import * as resourcesMock from './fixtures/ui-resources.json';

test.describe('01 - Dashboard Copa Mundo', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v3/calendar/matches**', async route => route.fulfill({ json: matchesMock }));
    await page.route('**/api/resources**', async route => route.fulfill({ json: resourcesMock }));
    await page.goto('/');
  });

  test('should load matches on dashboard', async ({ page }) => {
    await expect(page.locator('app-match-card')).toHaveCount(1);
    await expect(page.locator('app-match-card').locator('text=Mexico')).toBeVisible();
    await expect(page.locator('app-match-card').locator('text=Brazil')).toBeVisible();
  });
});
