import { test, expect } from '@playwright/test';
import * as matchesMock from './fixtures/matches.json';
import * as resourcesMock from './fixtures/ui-resources.json';

test.describe('06 - Rota Direta Partida', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v3/calendar/matches**', async route => route.fulfill({ json: matchesMock }));
    await page.route('**/api/resources**', async route => route.fulfill({ json: resourcesMock }));
    await page.route('**/api/v1/timeline**', async route => route.fulfill({ json: { Event: [] } }));
  });

  test('should automatically open match modal if ?match=ID is in URL', async ({ page }) => {
    await page.goto('/?match=M1');
    const modal = page.locator('.modal-content');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Mexico')).toBeVisible();
  });
});
