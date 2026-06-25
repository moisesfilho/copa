import { test, expect } from '@playwright/test';
import * as matchesMock from './fixtures/matches.json';
import * as resourcesMock from './fixtures/ui-resources.json';

test.describe('03 - Detalhes da Partida', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v3/calendar/matches**', async route => route.fulfill({ json: matchesMock }));
    await page.route('**/api/resources**', async route => route.fulfill({ json: resourcesMock }));
    await page.route('**/api/v1/timeline**', async route => route.fulfill({ json: { Event: [] } }));
    await page.goto('/');
  });

  test('should open match details modal', async ({ page }) => {
    await page.locator('.match-card').first().click();
    const modal = page.locator('.modal-content');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Estádio Azteca')).toBeVisible();
    await modal.locator('button.close-btn').click();
    await expect(modal).not.toBeVisible();
  });
});
