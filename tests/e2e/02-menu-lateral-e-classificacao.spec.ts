import { test, expect } from '@playwright/test';
import * as matchesMock from './fixtures/matches.json';
import * as resourcesMock from './fixtures/ui-resources.json';

test.describe('02 - Menu Lateral e Classificacao', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v3/calendar/matches**', async route => route.fulfill({ json: matchesMock }));
    await page.route('**/api/resources**', async route => route.fulfill({ json: resourcesMock }));
    await page.goto('/');
  });

  test('should navigate to standings and show data', async ({ page }) => {
    await page.click('text=Classificação');
    await expect(page).toHaveURL(/.*classificacao/);
    await expect(page.locator('.standings-table').locator('text=Argentina')).toBeVisible();
  });

  test('should toggle sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuBtn = page.locator('button', { hasText: '☰' }).or(page.locator('.menu-btn'));
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await expect(page.locator('.sidebar')).toHaveClass(/open/);
    }
  });
});
