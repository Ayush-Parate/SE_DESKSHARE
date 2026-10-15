import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.use({
    storageState: { cookies: [], origins: [] },
  });

  test.beforeEach(async ({ page }) => {
    // Clear storage once at the start of each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // Give time for app to initialize with cleared storage
    await page.waitForLoadState('networkidle');
  });

  test('should redirect unauthenticated user from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fdashboard/);
    await expect(page.locator('mat-card-title:has-text("Welcome back")')).toBeVisible();
  });

  test('should redirect unauthenticated user from /bookings to /login', async ({ page }) => {
    await page.goto('/bookings');
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fbookings/);
  });

  test('should redirect unauthenticated user from /bookings/new to /login', async ({ page }) => {
    await page.goto('/bookings/new');
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fbookings%2Fnew/);
  });

  test('should show login form with validation', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('mat-card-title:has-text("Welcome back")')).toBeVisible();

    // Try submit without filling
    await page.click('button[type="submit"]');
    await expect(page.locator('mat-error').first()).toBeVisible();

    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('mat-error:has-text("valid email")')).toBeVisible();

    // Fill valid email but no password
    await page.fill('input[type="email"]', 'customer@demo.deskshare');
    await page.click('button[type="submit"]');
    await expect(page.locator('mat-error:has-text("Password is required")')).toBeVisible();
  });

  test('should login successfully with demo credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer@demo.deskshare');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    // Use the heading specifically to avoid strict mode violation
    await expect(page.locator('h3#upcoming-heading')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@demo.deskshare');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Should show error snackbar
    await expect(page.locator('mat-snack-bar, .mat-mdc-snack-bar-container')).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('mat-card-title:has-text("Create your account")')).toBeVisible();

    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.fill('input[formControlName="firstName"]', 'Test');
    await page.fill('input[formControlName="lastName"]', 'User');
    await page.fill('input[formControlName="email"]', email);
    await page.fill('input[formControlName="password"]', 'password123');
    await page.fill('input[formControlName="confirmPassword"]', 'password123');
    
    // Handle mat-select
    await page.click('mat-select[formControlName="role"]');
    await page.click('mat-option:has-text("Customer")');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('mat-snack-bar, .mat-mdc-snack-bar-container').filter({ hasText: 'Account created successfully' })).toBeVisible();
  });

  test('should show password mismatch error on register', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[formControlName="firstName"]', 'Test');
    await page.fill('input[formControlName="lastName"]', 'User');
    await page.fill('input[formControlName="email"]', 'test@example.com');
    await page.fill('input[formControlName="password"]', 'password123');
    await page.fill('input[formControlName="confirmPassword"]', 'different');
    
    await page.click('mat-select[formControlName="role"]');
    await page.click('mat-option:has-text("Customer")');
    await page.click('button[type="submit"]');

    await expect(page.locator('mat-error:has-text("Passwords do not match")')).toBeVisible();
  });

  test('should logout and return to login page', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer@demo.deskshare');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Open user menu and logout - click the account circle button
    await page.click('button.user-menu-trigger');
    await page.click('text=Sign out');

    // Should be logged out, toolbar shows sign in
    await expect(page.locator('a:has-text("Sign in")')).toBeVisible();
  });
});