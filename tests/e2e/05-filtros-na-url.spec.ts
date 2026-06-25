import { test, expect } from '@playwright/test';
import * as matchesMock from './fixtures/matches.json';
import * as resourcesMock from './fixtures/ui-resources.json';

test.describe('05 - Filtros na URL', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v3/calendar/matches**', async route => route.fulfill({ json: matchesMock }));
    await page.route('**/api/resources**', async route => route.fulfill({ json: resourcesMock }));
  });

  test('should update URL when filter is selected', async ({ page }) => {
    await page.goto('/partidas');
    await page.goto('/partidas?stage=Group%20Stage');
    await expect(page).toHaveURL(/.*stage=Group(%20|\+)Stage/);
  });
});
