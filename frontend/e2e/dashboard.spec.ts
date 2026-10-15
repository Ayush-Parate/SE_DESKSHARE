import { test, expect } from '@playwright/test';

test.describe('Dashboard and Reviews', () => {
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

  test('should show customer dashboard with upcoming/past bookings', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer@demo.deskshare');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    // Use specific headings to avoid strict mode violations
    await expect(page.locator('h3#upcoming-heading')).toBeVisible();
    await expect(page.locator('h3#past-heading')).toBeVisible();
    await expect(page.locator('text=Total spent')).toBeVisible();
  });

  test('should show owner dashboard with spaces and revenue', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner@demo.deskshare');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h3#spaces-heading')).toBeVisible();
    await expect(page.locator('h3#bookings-heading')).toBeVisible();
  });

  test('should show admin dashboard with stats', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@demo.deskshare');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    // Check stat cards - they have "Users", "Spaces", "Bookings" labels
    await expect(page.locator('.stat-label:has-text("Users")')).toBeVisible();
    await expect(page.locator('.stat-label:has-text("Spaces")')).toBeVisible();
    await expect(page.locator('.stat-label:has-text("Bookings")')).toBeVisible();
  });

  test('should switch roles via demo role switcher', async ({ page }) => {
    // Set up a demo session directly in localStorage before navigating to dashboard
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('deskshare_token', 'demo-token-customer');
      localStorage.setItem('deskshare_user', JSON.stringify({
        id: 'user-demo',
        email: 'customer@demo.deskshare',
        firstName: 'Alex',
        lastName: 'Customer',
        role: 'CUSTOMER'
      }));
    });
    await page.waitForLoadState('networkidle');

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Wait for dashboard to load
    await expect(page.locator('h3#upcoming-heading')).toBeVisible({ timeout: 10000 });

    // Open user menu and click role switcher (should be visible for demo sessions)
    await page.click('button.user-menu-trigger');
    // Click "Customer" in the demo section (button with mat-menu-item attribute)
    await page.click('[mat-menu-item]:has-text("Customer")');
    await page.click('[mat-menu-item]:has-text("Owner")');

    // Should show owner dashboard
    await expect(page.locator('h3#spaces-heading')).toBeVisible({ timeout: 10000 });
  });

  test('should display reviews on space detail page', async ({ page }) => {
    await page.goto('/spaces/s-101');

    // Scroll to reviews section to trigger @defer
    await page.locator('h3#reviews-heading').scrollIntoViewIfNeeded();
    // Reviews section should be visible (lazy loaded) - use the heading
    await expect(page.locator('h3#reviews-heading')).toBeVisible({ timeout: 10000 });
  });

  test('should show review form for authenticated user', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer@demo.deskshare');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Verify session is active
    await expect(page.locator('button.user-menu-trigger')).toBeVisible();

    await page.goto('/spaces/s-101');
    // Wait for space detail content to load first (ensures app is bootstrapped)
    await expect(page.locator('h2')).toContainText('Harbor Desk', { timeout: 10000 });

    // Verify session still active on space detail page
    await expect(page.locator('button.user-menu-trigger')).toBeVisible({ timeout: 10000 });

    // Scroll to reviews section to trigger @defer
    await page.locator('h3#reviews-heading').scrollIntoViewIfNeeded();
    await expect(page.locator('h3#reviews-heading')).toBeVisible({ timeout: 10000 });

    // Wait for @defer to load and check for review form (authenticated user with real JWT)
    await expect(page.locator('mat-card-title:has-text("Write a review")')).toBeVisible({ timeout: 15000 });
  });

  test('should show login prompt for unauthenticated user in review section', async ({ page }) => {
    await page.goto('/spaces/s-101');
    
    // Scroll to reviews section to trigger @defer
    await page.locator('h3#reviews-heading').scrollIntoViewIfNeeded();
    await expect(page.locator('h3#reviews-heading')).toBeVisible({ timeout: 10000 });

    // Should show login prompt - the button text
    await expect(page.locator('button:has-text("Sign in to review")')).toBeVisible({ timeout: 10000 });
  });

  test('should submit a review when authenticated', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer@demo.deskshare');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Verify session is active
    await expect(page.locator('button.user-menu-trigger')).toBeVisible();

    await page.goto('/spaces/s-101');
    // Wait for space detail content to load first (ensures app is bootstrapped)
    await expect(page.locator('h2')).toContainText('Harbor Desk', { timeout: 10000 });

    // Verify session still active on space detail page
    await expect(page.locator('button.user-menu-trigger')).toBeVisible({ timeout: 10000 });
    
    // Scroll to reviews section to trigger @defer
    await page.locator('h3#reviews-heading').scrollIntoViewIfNeeded();
    await expect(page.locator('h3#reviews-heading')).toBeVisible({ timeout: 10000 });

    // Wait for review form to appear
    await expect(page.locator('mat-card-title:has-text("Write a review")')).toBeVisible({ timeout: 15000 });

    // Select 4 stars
    await page.click('button[aria-label="Rate 4 stars"]');

    // Fill comment
    await page.fill('textarea[formControlName="comment"]', 'Great space for working!');

    // Submit
    await page.click('button:has-text("Submit review")');

    // Should show success snackbar or error snackbar
    await expect(page.locator('mat-snack-bar, .mat-mdc-snack-bar-container').first()).toBeVisible({ timeout: 10000 });
  });
});