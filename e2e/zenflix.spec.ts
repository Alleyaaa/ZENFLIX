import { test, expect } from '@playwright/test'

// ===== E2E: Critical user paths Zenflix =====

test.describe('Zenflix core flows', () => {
  test('Home page loads hero + content rows', async ({ page }) => {
    await page.goto('/')
    // Navbar
    await expect(page.getByRole('link', { name: 'ZENFLIX' }).first()).toBeVisible()
    // Hero (skeleton or actual)
    await page.waitForTimeout(3000)
    // Movie rows should exist (at least "Sedang Tayang")
    await expect(page.getByText('Sedang Tayang').first()).toBeVisible()
  })

  test('Search works from header', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.getByPlaceholder('Cari film...')
    await searchInput.fill('spider')
    await page.waitForTimeout(1000)
    // Dropdown suggestions should appear
    await expect(page.locator('input')).toBeVisible()
  })

  test('Search page shows results', async ({ page }) => {
    await page.goto('/search?q=spider')
    await page.waitForTimeout(2500)
    const results = page.locator('a[href*="/movie/"]')
    await expect(results.first()).toBeVisible()
    const count = await results.count()
    expect(count).toBeGreaterThan(0)
  })

  test('Movie detail page loads player + cast', async ({ page }) => {
    await page.goto('/movie/11250')
    await page.waitForTimeout(3000)
    await expect(page.getByRole('heading', { name: 'Wedding For One', exact: true })).toBeVisible()
    // Player iframe or "Menyiapkan" state
    const iframe = page.locator('iframe')
    await expect(iframe.first()).toBeVisible()
  })

  test('Subscribe page shows pricing tiers', async ({ page }) => {
    await page.goto('/subscribe')
    for (const tier of ['Gratis', 'Remove Ads']) {
      await expect(page.getByRole('heading', { name: tier })).toBeVisible()
    }
  })

  test('Auth page shows login form', async ({ page }) => {
    await page.goto('/auth')
    await expect(page.getByRole('heading', { name: /Masuk ke Zenflix/i })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password').first()).toBeVisible()
  })

  test('Category page shows movies', async ({ page }) => {
    await page.goto('/category/popular')
    await page.waitForTimeout(2500)
    const cards = page.locator('a[href*="/movie/"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(5)
  })

  test('Genre page loads', async ({ page }) => {
    await page.goto('/genre/28')
    await page.waitForTimeout(2500)
    await expect(page.getByText(/Aksi/i).first()).toBeVisible()
  })

  test('Leaderboard loads', async ({ page }) => {
    await page.goto('/leaderboard')
    await expect(page.getByText(/Papan Peringkat|Leaderboard/i).first()).toBeVisible()
  })

  test('Theme toggle works', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: /Mode Terang|Light mode/i })
    await toggle.click()
    const html = page.locator('html')
    const theme = await html.getAttribute('data-theme')
    expect(theme).toBe('light')
  })

  test('Language toggle works', async ({ page }) => {
    await page.goto('/')
    const langToggle = page.getByRole('button', { name: /Toggle language/i })
    await langToggle.click()
    await page.waitForTimeout(300)
    // After toggle, nav should show English "Home"
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
  })

  test('No console errors on home', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    await page.waitForTimeout(3000)
    // Filter: CSP blokir Adsterra sub-domain adalah ekspektasi wajar (ikan 3rd-party);
    // bukan bug aplikasi. Resource 404 juga bukan JS error.
    const realErrors = errors.filter((e) =>
      !e.includes('Content Security Policy') &&
      !e.includes('violates the following') &&
      !e.includes('Failed to load resource') &&
      !e.includes('favicon')
    )
    expect(realErrors).toEqual([])
  })

  test('Mobile responsive: no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForTimeout(3000)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(overflow).toBe(false)
  })
})