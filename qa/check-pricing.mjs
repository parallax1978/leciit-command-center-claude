/**
 * Pricing page QA (developer tool, not shipped).
 *
 * Usage: node qa/check-pricing.mjs [baseUrl]   (default http://127.0.0.1:4173)
 *
 * Checks at 360, 390, 768, and 1440 px: no horizontal overflow, heading order,
 * exact prices and billing disclosures in both billing states (from the
 * verified Legiit plan data), plan button destinations including the billing
 * parameter, keyboard operation of the billing switch, the FAQ accordion,
 * comparison table semantics, Initial Caps on every button label, no em
 * dashes, 44px targets, and page metadata. Screenshots go to qa/screenshots.
 */
import { chromium } from 'playwright-core'
import { mkdirSync, existsSync } from 'node:fs'

const base = (process.argv[2] ?? 'http://127.0.0.1:4173').replace(/\/$/, '')
const url = `${base}/pricing.html`
const outDir = 'qa/screenshots'
mkdirSync(outDir, { recursive: true })
const executablePath = process.env.CHROMIUM_PATH ?? ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => existsSync(p))
const browser = await chromium.launch({ executablePath, headless: true })

const results = []
const pass = (m) => results.push({ ok: true, m })
const fail = (m) => results.push({ ok: false, m })

const TRIAL = 'https://legiit.com/command-center/start'
const REGISTER = 'https://legiit.com/register'
const subscribe = (plan, billing) => `https://legiit.com/sign-in?redirect=${encodeURIComponent(`/subscription-purchase?plan=${plan}&billing=${billing}`)}`
const EXPECT = {
  monthly: { business: '$49', agency: '$169', businessLine: 'Billed monthly. Pay annually and save $117.60 a year.', agencyLine: 'Billed monthly. Pay annually and save $405.60 a year.', perBusiness: '$8.45 per business' },
  yearly: { business: '$39.20', agency: '$135.20', businessLine: 'Billed annually at $470.40. $49/month if billed monthly.', agencyLine: 'Billed annually at $1,622.40. $169/month if billed monthly.', perBusiness: '$6.76 per business' },
}

const readCards = (page) =>
  page.evaluate(() => {
    const card = (id) => {
      const a = document.querySelector(`article[aria-labelledby="plan-${id}"]`)
      if (!a) return null
      return { text: a.innerText.replace(/\s+/g, ' '), href: a.querySelector('a[data-plan-cta]')?.href }
    }
    return { business: card('business_dashboard'), agency: card('agency_dashboard') }
  })

for (const width of [360, 390, 768, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(url, { waitUntil: 'networkidle' })

  const m = await page.evaluate(() => {
    const rect = (el) => el.getBoundingClientRect()
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => ({ level: Number(h.tagName[1]), text: h.textContent.trim() }))
    const buttonLabels = Array.from(document.querySelectorAll('button, a[data-plan-cta], a[data-cta-placement], label[for]'))
      .filter((el) => el.offsetParent !== null || el.closest('details'))
      .map((el) => (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' '))
      .filter(Boolean)
    const notCaps = buttonLabels.filter((t) => t.split(' ').filter((w) => /[A-Za-z]/.test(w)).some((w) => !/^[^A-Za-z]*[A-Z0-9]/.test(w)))
    const small = Array.from(document.querySelectorAll('a[href], button, label[for]'))
      .filter((el) => el.offsetParent !== null && !el.classList.contains('sr-only'))
      .map((el) => ({ t: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40), h: Math.round(rect(el).height), w: Math.round(rect(el).width), inline: getComputedStyle(el).display === 'inline' }))
      .filter((x) => !x.inline && (x.h < 44 || x.w < 44))
    const table = document.querySelector('table')
    return {
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content,
      headings,
      h1Count: headings.filter((h) => h.level === 1).length,
      emDash: /—/.test(document.body.innerText),
      notCaps,
      small,
      tableOk: !!table && table.querySelectorAll('th[scope="col"]').length === 2 && table.querySelectorAll('th[scope="row"]').length >= 10 && !!table.querySelector('caption'),
      planCtas: Array.from(document.querySelectorAll('a[data-plan-cta]')).map((a) => ({ plan: a.dataset.planCta, href: a.href, text: a.innerText.trim() })),
      radios: Array.from(document.querySelectorAll('input[type="radio"]')).map((r) => ({ value: r.value, checked: r.checked })),
    }
  })

  m.sw <= m.iw ? pass(`${width}: no horizontal overflow`) : fail(`${width}: overflow ${m.sw} > ${m.iw}`)
  m.h1Count === 1 ? pass(`${width}: one h1`) : fail(`${width}: ${m.h1Count} h1 elements`)
  const skips = m.headings.filter((h, i) => i > 0 && h.level > m.headings[i - 1].level + 1)
  skips.length === 0 ? pass(`${width}: heading levels never skip`) : fail(`${width}: heading skips ${JSON.stringify(skips)}`)
  !m.emDash ? pass(`${width}: no em dashes`) : fail(`${width}: em dash in page text`)
  m.notCaps.length === 0 ? pass(`${width}: every button label is Initial Caps`) : fail(`${width}: labels not Initial Caps ${JSON.stringify(m.notCaps)}`)
  m.small.length === 0 ? pass(`${width}: all targets at least 44px`) : fail(`${width}: small targets ${JSON.stringify(m.small)}`)
  m.tableOk ? pass(`${width}: comparison table has caption, column and row headers`) : fail(`${width}: comparison table semantics`)
  errors.length === 0 ? pass(`${width}: no console errors`) : fail(`${width}: console errors ${errors.join(' | ')}`)

  // Billing states: check prices, disclosures, and destinations for each.
  for (const billing of ['monthly', 'yearly']) {
    const label = billing === 'monthly' ? 'Monthly' : 'Annual'
    await page.locator('label').filter({ hasText: new RegExp(`^${label}`) }).first().click()
    await page.waitForTimeout(100)
    const cards = await readCards(page)
    const e = EXPECT[billing]
    const bOk = cards.business && cards.business.text.includes(`${e.business} /month`) && cards.business.text.includes(e.businessLine)
    const aOk = cards.agency && cards.agency.text.includes(`${e.agency} /month`) && cards.agency.text.includes(e.agencyLine) && cards.agency.text.includes(e.perBusiness)
    bOk ? pass(`${width} ${billing}: Business shows ${e.business}/month with its billing disclosure`) : fail(`${width} ${billing}: Business card text ${cards.business?.text}`)
    aOk ? pass(`${width} ${billing}: Agency shows ${e.agency}/month, disclosure, and ${e.perBusiness}`) : fail(`${width} ${billing}: Agency card text ${cards.agency?.text}`)
    const ctas = await page.evaluate(() => Array.from(document.querySelectorAll('a[data-plan-cta]')).map((a) => ({ plan: a.dataset.planCta, href: a.href })))
    const want = { business_dashboard: TRIAL, agency_dashboard: subscribe('agency_dashboard', billing), marketplace: REGISTER }
    const wrong = ctas.filter((c) => c.href !== want[c.plan])
    wrong.length === 0 && ctas.length >= 4 ? pass(`${width} ${billing}: all ${ctas.length} plan buttons go to the right destination`) : fail(`${width} ${billing}: wrong destinations ${JSON.stringify(wrong)} (count ${ctas.length})`)
  }

  // Keyboard: arrow keys move between billing options.
  await page.locator('input[type="radio"][value="monthly"]').focus()
  await page.keyboard.press('ArrowRight')
  const afterKey = await page.evaluate(() => document.querySelector('input[type="radio"]:checked')?.value)
  afterKey === 'yearly' ? pass(`${width}: arrow key switches billing to annual`) : fail(`${width}: arrow key result ${afterKey}`)

  // FAQ accordion.
  const faq = page.locator('h3 button[aria-expanded]').first()
  await faq.scrollIntoViewIfNeeded()
  await faq.click()
  const opened = (await faq.getAttribute('aria-expanded')) === 'true'
  await faq.press('Enter')
  const closed = (await faq.getAttribute('aria-expanded')) === 'false'
  opened && closed ? pass(`${width}: FAQ opens and closes`) : fail(`${width}: FAQ open=${opened} closed=${closed}`)

  if (width === 1440) {
    m.title.startsWith('Command Center Pricing') && /Agency/.test(m.desc ?? '') ? pass('metadata: title and description set') : fail(`metadata: ${m.title} / ${m.desc}`)
    console.log('Headings:', m.headings.map((h) => `H${h.level}:${h.text.slice(0, 40)}`).join(' | '))
  }
  await page.locator('label').filter({ hasText: /^Monthly/ }).first().click()
  await page.screenshot({ path: `${outDir}/pricing-${width}.png`, fullPage: true })
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.m}`)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
