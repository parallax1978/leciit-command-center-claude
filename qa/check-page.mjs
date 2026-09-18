/**
 * Local QA script (developer tool, not shipped to visitors).
 *
 * Usage: node qa/check-page.mjs [baseUrl]
 * Default baseUrl is http://127.0.0.1:4173 (vite preview).
 *
 * Checks at 360, 390, 768 and 1440 px: no horizontal overflow, visible word
 * count, section count, media region position, CTA hrefs (with and without
 * campaign parameters), FAQ controls, full-size preview dialog behaviour,
 * asset loading, and reduced-motion rendering. Screenshots go to qa/screenshots.
 */
import { chromium } from 'playwright-core'
import { mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const base = process.argv[2] ?? 'http://127.0.0.1:4173'
const outDir = 'qa/screenshots'
mkdirSync(outDir, { recursive: true })

function findChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers'
  const candidates = []
  for (const entry of readdirSync(root)) {
    if (!entry.startsWith('chromium')) continue
    for (const sub of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome']) {
      const p = join(root, entry, sub)
      try {
        if (statSync(p).isFile()) candidates.push(p)
      } catch {
        /* not here */
      }
    }
  }
  return candidates[0]
}

const executablePath = process.env.CHROMIUM_PATH ?? findChromium()
const browser = await chromium.launch({ executablePath, headless: true })
const results = []
const fail = (msg) => results.push({ ok: false, msg })
const pass = (msg) => results.push({ ok: true, msg })

const EXPECTED_HREF = 'https://dashboard.legiit.com/?cc_variant=C'

for (const width of [360, 390, 768, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const failedRequests = []
  page.on('requestfailed', (r) => failedRequests.push(r.url()))
  await page.goto(base, { waitUntil: 'networkidle' })

  const metrics = await page.evaluate(() => {
    const words = document.body.innerText.trim().split(/\s+/).filter(Boolean)
    const hiddenFaqWords = Array.from(document.querySelectorAll('[role="region"][hidden]'))
      .map((n) => n.textContent.trim().split(/\s+/).filter(Boolean).length)
      .reduce((a, b) => a + b, 0)
    const sections = document.querySelectorAll('main > section').length
    const media = document.querySelector('figure')
    const mediaTop = media ? media.getBoundingClientRect().top + window.scrollY : null
    const howTop = document.querySelector('#how-heading')?.getBoundingClientRect().top + window.scrollY
    const ctas = Array.from(document.querySelectorAll('a[data-cta-placement]')).map((a) => ({ placement: a.dataset.ctaPlacement, href: a.href }))
    const commercialLinks = Array.from(document.querySelectorAll('a[href*="legiit.com"]')).map((a) => a.href)
    const logo = document.querySelector('header img')
    const shot = document.querySelector('figure img')
    const touch = Array.from(document.querySelectorAll('a[href], button'))
      .filter((el) => el.offsetParent !== null && !el.classList.contains('sr-only'))
      .map((el) => ({ text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40), h: el.getBoundingClientRect().height, w: el.getBoundingClientRect().width }))
      .filter((t) => t.h < 44 || t.w < 44)
    const playIcons = document.querySelectorAll('figure svg path[d^="M8 5.5v13"]').length
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      visibleWords: words.length,
      hiddenFaqWords,
      sections,
      mediaTop,
      howTop,
      ctas,
      commercialLinks,
      logoLoaded: !!logo && logo.complete && logo.naturalWidth > 0,
      shotLoaded: !!shot && shot.complete && shot.naturalWidth > 0,
      shotRenderedWidth: shot ? Math.round(shot.getBoundingClientRect().width) : 0,
      smallTargets: touch,
      playIcons,
      h1: document.querySelector('h1')?.textContent,
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => `${h.tagName}:${h.textContent.trim().slice(0, 50)}`),
    }
  })

  metrics.scrollWidth <= metrics.innerWidth
    ? pass(`${width}px: no horizontal overflow (${metrics.scrollWidth}/${metrics.innerWidth})`)
    : fail(`${width}px: horizontal overflow ${metrics.scrollWidth} > ${metrics.innerWidth}`)
  metrics.sections === 4 ? pass(`${width}px: 4 body sections`) : fail(`${width}px: ${metrics.sections} body sections`)
  metrics.mediaTop !== null && metrics.mediaTop < metrics.howTop ? pass(`${width}px: media region precedes How it works`) : fail(`${width}px: media region not before How it works`)
  const total = metrics.visibleWords + metrics.hiddenFaqWords
  total <= 550 ? pass(`${width}px: ${total} words incl. closed FAQ answers (visible ${metrics.visibleWords})`) : fail(`${width}px: ${total} words exceeds 550`)
  metrics.ctas.length === 3 && metrics.ctas.every((c) => c.href === EXPECTED_HREF)
    ? pass(`${width}px: 3 CTAs -> ${EXPECTED_HREF}`)
    : fail(`${width}px: CTA mismatch ${JSON.stringify(metrics.ctas)}`)
  metrics.commercialLinks.every((h) => h === EXPECTED_HREF) ? pass(`${width}px: no stray legiit.com links`) : fail(`${width}px: stray links ${JSON.stringify(metrics.commercialLinks)}`)
  metrics.logoLoaded ? pass(`${width}px: logo loaded`) : fail(`${width}px: logo not loaded`)
  metrics.shotLoaded ? pass(`${width}px: screenshot loaded at ${metrics.shotRenderedWidth}px wide`) : fail(`${width}px: screenshot not loaded`)
  metrics.smallTargets.length === 0 ? pass(`${width}px: all interactive targets >= 44px`) : fail(`${width}px: small targets ${JSON.stringify(metrics.smallTargets)}`)
  metrics.playIcons === 0 ? pass(`${width}px: no play icon in placeholder state`) : fail(`${width}px: play icon present`)
  failedRequests.length === 0 ? pass(`${width}px: no failed requests`) : fail(`${width}px: failed requests ${failedRequests.join(', ')}`)
  if (width === 1440) console.log('Headings:', metrics.headings.join(' | '))

  await page.screenshot({ path: `${outDir}/page-${width}.png`, fullPage: true })

  // FAQ controls
  const firstFaq = page.locator('h3 button[aria-expanded]').first()
  await firstFaq.click()
  const expanded = await firstFaq.getAttribute('aria-expanded')
  const panelVisible = await page.locator('[role="region"]:not([hidden])').count()
  expanded === 'true' && panelVisible === 1 ? pass(`${width}px: FAQ opens`) : fail(`${width}px: FAQ did not open`)
  await firstFaq.press('Enter')
  ;(await firstFaq.getAttribute('aria-expanded')) === 'false' ? pass(`${width}px: FAQ closes with keyboard`) : fail(`${width}px: FAQ did not close`)

  // Full-size preview dialog
  const opener = page.getByRole('button', { name: 'View full-size screenshot' })
  await opener.focus()
  await opener.press('Enter')
  const dialog = page.locator('dialog[open]')
  await dialog.waitFor({ state: 'visible' })
  const focusedInDialog = await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'))
  focusedInDialog ? pass(`${width}px: focus moved into dialog`) : fail(`${width}px: focus not in dialog`)
  const dialogImgs = await dialog.locator('img').count()
  dialogImgs === 1 ? pass(`${width}px: dialog shows the one screenshot`) : fail(`${width}px: dialog shows ${dialogImgs} images`)
  await page.screenshot({ path: `${outDir}/dialog-${width}.png` })
  // Tab loop stays inside
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab')
  const stillInside = await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'))
  stillInside ? pass(`${width}px: Tab stays inside dialog`) : fail(`${width}px: focus escaped dialog`)
  await page.keyboard.press('Escape')
  await page.locator('dialog[open]').waitFor({ state: 'detached' }).catch(() => {})
  const closed = (await page.locator('dialog[open]').count()) === 0
  const restored = await page.evaluate(() => document.activeElement?.textContent?.includes('View full-size screenshot'))
  closed && restored ? pass(`${width}px: Escape closes dialog and restores focus`) : fail(`${width}px: dialog close/restore failed (closed=${closed}, restored=${restored})`)
  const overflowReset = await page.evaluate(() => document.documentElement.style.overflow === '')
  overflowReset ? pass(`${width}px: scroll lock released`) : fail(`${width}px: scroll lock not released`)

  await context.close()
}

// CTA builder through the real page: valid, rejected, and override attempts
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const query = '?utm_source=meta&utm_medium=paid_social&utm_campaign=cc-ai-2026.q3&utm_content=bad%20value&utm_term=ok~term&cc_variant=A&email=x%40y.com&fbclid=abc&redirect=https%3A%2F%2Fevil.example'
  await page.goto(base + query, { waitUntil: 'networkidle' })
  const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a[data-cta-placement]')).map((a) => a.href))
  const expected = { utm_source: 'meta', utm_medium: 'paid_social', utm_campaign: 'cc-ai-2026.q3', utm_term: 'ok~term', cc_variant: 'C' }
  const parsedOk = hrefs.every((h) => {
    const u = new URL(h)
    return u.origin + u.pathname === 'https://dashboard.legiit.com/' && JSON.stringify(Object.fromEntries(u.searchParams)) === JSON.stringify(expected)
  })
  hrefs.length === 3 && parsedOk ? pass(`campaign params: filtered correctly -> ${hrefs[0]}`) : fail(`campaign params: got ${JSON.stringify(hrefs)}`)
  // Skip link becomes a visible, adequately sized target when focused
  await page.keyboard.press('Tab')
  const skip = await page.evaluate(() => {
    const el = document.activeElement
    const r = el.getBoundingClientRect()
    return { text: el.textContent.trim(), h: r.height, w: r.width }
  })
  skip.text === 'Skip to content' && skip.h >= 44 ? pass(`skip link: visible on focus at ${Math.round(skip.h)}px tall`) : fail(`skip link: ${JSON.stringify(skip)}`)
  await context.close()
}

// Reduced motion + keyboard walk of the header and hero
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  const order = []
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    order.push(await page.evaluate(() => (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent || '').trim().slice(0, 40)))
  }
  console.log('Tab order (first 6):', order.join(' -> '))
  order[0] === 'Skip to content' ? pass('keyboard: skip link is first') : fail(`keyboard: first focus was ${order[0]}`)
  await page.screenshot({ path: `${outDir}/reduced-motion-1440.png` })
  await context.close()
}

// Failed asset fallback: block the logo and screenshot
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.route('**/legiit-logo.png', (r) => r.abort())
  await page.route('**/product/ai-visibility.jpg', (r) => r.abort())
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  const fb = await page.evaluate(() => ({
    logoText: document.querySelector('header a')?.textContent?.trim(),
    logoImgs: document.querySelectorAll('header img').length,
    shotFallback: !!document.querySelector('figure [role="img"]'),
    shotImgs: document.querySelectorAll('figure img').length,
    previewButton: !!Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('View full-size')),
  }))
  fb.logoText === 'Legiit' && fb.logoImgs === 0 ? pass('fallback: logo text shown when image fails') : fail(`fallback: logo ${JSON.stringify(fb)}`)
  fb.shotFallback && fb.shotImgs === 0 && !fb.previewButton ? pass('fallback: screenshot text fallback shown, preview hidden') : fail(`fallback: screenshot ${JSON.stringify(fb)}`)
  await page.screenshot({ path: `${outDir}/fallback-390.png`, fullPage: true })
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.msg}`)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
