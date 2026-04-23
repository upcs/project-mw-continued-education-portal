// tests/welcome.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Welcome page (localStorage auth)', () => {
  test('shows welcome page when NOT authenticated', async ({ page }) => {
    await page.goto('/');

    // Ensure no auth state
    await page.evaluate(() => {
      localStorage.clear();
    });

    await page.reload();

    await expect(page.locator('.welcome-page')).toBeVisible();
  });

  test('redirects to dashboard when authenticated', async ({ page }) => {
    // Set localStorage BEFORE page loads
    await page.addInitScript(() => {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          isAuthenticated: true,
        })
      );
    });

    await page.goto('/');

    // Wait for redirect triggered by useEffect
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
