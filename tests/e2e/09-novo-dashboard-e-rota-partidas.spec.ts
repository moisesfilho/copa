import { test, expect } from '@playwright/test';
import * as matchesMock from './fixtures/matches.json';
import * as resourcesMock from './fixtures/ui-resources.json';

test.describe('09 - Novo Dashboard e Rota Partidas', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v3/calendar/matches**', async route => route.fulfill({ json: matchesMock }));
    await page.route('**/api/resources**', async route => route.fulfill({ json: resourcesMock }));
    await page.goto('/');
  });

  test('should navigate to /partidas when clicking matches link', async ({ page }) => {
    await page.click('text=Partidas');
    await expect(page).toHaveURL(/.*partidas/);
    
    // Check if matches are loaded in /partidas
    await expect(page.locator('app-match-card')).toHaveCount(2); // Since M1 and M2 are in the mock
  });
});
