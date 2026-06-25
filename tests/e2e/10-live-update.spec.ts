import { test, expect } from '@playwright/test';
import * as matchesMock from './fixtures/matches.json';
import * as resourcesMock from './fixtures/ui-resources.json';

test.describe('10 - Live Update', () => {
  test('should poll API every 10 seconds for live updates', async ({ page }) => {
    await page.clock.install({ time: new Date() });
    let apiCallCount = 0;
    await page.route('**/api/v3/calendar/matches**', async route => {
      apiCallCount++;
      await route.fulfill({ json: matchesMock });
    });
    await page.route('**/api/resources**', async route => route.fulfill({ json: resourcesMock }));
    
    await page.goto('/');
    expect(apiCallCount).toBeGreaterThanOrEqual(1);
    
    // Wait for the next API call to be initiated by the interval
    const nextCallPromise = page.waitForRequest(req => req.url().includes('/api/v3/calendar/matches'));
    await page.clock.fastForward(11000);
    await nextCallPromise;
    
    expect(apiCallCount).toBeGreaterThanOrEqual(2);
  });
});
