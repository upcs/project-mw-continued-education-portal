const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('https://cs341s26mwed.campus.up.edu:3000/admin');

  await expect(page).toHaveTitle(/UPLENDO/);
});
