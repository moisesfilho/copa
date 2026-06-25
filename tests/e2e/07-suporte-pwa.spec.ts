import { test, expect } from '@playwright/test';

test.describe('07 - Suporte PWA', () => {
  test('should have a web manifest registered', async ({ page }) => {
    await page.goto('/');
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', 'manifest.webmanifest');
    
    // Verify the manifest file returns a valid response
    const response = await page.request.get('/manifest.webmanifest');
    expect(response.ok()).toBeTruthy();
  });
});
