import { test, expect } from '@playwright/test';
import * as matchesMock from './fixtures/matches.json';
import * as resourcesMock from './fixtures/ui-resources.json';

test.describe('11 - Notificacoes Push', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v3/calendar/matches**', async route => route.fulfill({ json: matchesMock }));
    await page.route('**/api/resources**', async route => route.fulfill({ json: resourcesMock }));
    await page.goto('/configuracoes');
  });

  test('should toggle push notifications in settings', async ({ page }) => {
    const settingItem = page.locator('.setting-item').first();
    const checkbox = settingItem.locator('input[type="checkbox"]');
    const slider = settingItem.locator('.slider');
    
    // In Chromium, Push might be denied by default, but we can just test if the switch triggers
    const isChecked = await checkbox.isChecked();
    // Click the visual slider instead of the hidden checkbox
    await slider.click({ force: true });
    
    // Use web-first auto-retrying assertion to avoid flakiness
    if (isChecked) {
      await expect(checkbox).not.toBeChecked();
    } else {
      await expect(checkbox).toBeChecked();
    }
  });
});
