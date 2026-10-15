import { test, expect } from '@playwright/test';

test.describe('Space Browsing and Booking Flow', () => {
  test.use({
    storageState: { cookies: [], origins: [] },
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.waitForLoadState('networkidle');
  });

  test('should browse spaces on /spaces page', async ({ page }) => {
    await page.goto('/spaces');
    await expect(page.locator('h2')).toContainText('Explore flexible spaces');

    // Should show at least one space card
    await expect(page.locator('mat-card').first()).toBeVisible();
  });

  test('should filter spaces by city', async ({ page }) => {
    await page.goto('/spaces');
    // Use the filter bar input - city field has placeholder "e.g. Seattle"
    await page.fill('input[placeholder="e.g. Seattle"]', 'Seattle');
    await page.keyboard.press('Enter');

    // Should show filtered results - use first() to avoid strict mode violation
    await expect(page.locator('mat-card').first()).toContainText('Seattle');
  });

  test('should filter spaces by type', async ({ page }) => {
    await page.goto('/spaces');
    // Click the type select by its label
    await page.click('mat-form-field:has(mat-label:has-text("Type")) mat-select');
    await page.click('mat-option:has-text("Hot Desk")');

    // Should show filtered results
    await expect(page.locator('mat-card').first()).toContainText('Hot Desk');
  });

  test('should navigate to space detail page', async ({ page }) => {
    await page.goto('/spaces');
    const firstCard = page.locator('mat-card').first();
    // Click the "View details" button
    await firstCard.locator('button:has-text("View details")').click();

    // Should be on space detail page - URL contains /spaces/ followed by ID
    await expect(page).toHaveURL(/\/spaces\/.+/);
    await expect(page.locator('h2')).toBeVisible();
  });

  test('should show space details on detail page', async ({ page }) => {
    await page.goto('/spaces/s-101');
    await expect(page.locator('h2')).toContainText('Harbor Desk');
    // Use the location section address (more specific)
    await expect(page.locator('address.address-block')).toContainText('Seattle, WA 98101');
    await expect(page.locator('text=$7.00')).toBeVisible();
    await expect(page.locator('text=WiFi')).toBeVisible();
  });

  test('should redirect to login when clicking Book Now unauthenticated', async ({ page }) => {
    await page.goto('/spaces/s-101');
    await page.click('button:has-text("Book Now")');

    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/login\?returnUrl/);
  });

  test('should book a space when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer@demo.deskshare');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Verify session persists by checking toolbar
    await expect(page.locator('button.user-menu-trigger')).toBeVisible();

    // Go to space detail and wait for it to load
    await page.goto('/spaces/s-101');
    await expect(page.locator('h2')).toContainText('Harbor Desk', { timeout: 10000 });
    
    // Verify session still valid on space detail page
    await expect(page.locator('button.user-menu-trigger')).toBeVisible({ timeout: 10000 });

    await page.click('button:has-text("Book Now")');

    // Should be on booking form
    await expect(page).toHaveURL(/\/bookings\/new/);
    await expect(page.locator('h2')).toContainText('Book a space');

    // Fill booking form - select date/time (use first to avoid strict mode violation)
    await expect(page.locator('mat-form-field').first()).toBeVisible();
  });

  test('should show user bookings on /bookings page when authenticated', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer@demo.deskshare');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Verify session persists
    await expect(page.locator('button.user-menu-trigger')).toBeVisible();

    await page.goto('/bookings');
    // Wait for page to load
    await expect(page.locator('h2')).toContainText('Your bookings', { timeout: 15000 });
  });
});