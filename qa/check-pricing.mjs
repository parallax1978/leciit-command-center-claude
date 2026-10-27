/**
 * Pricing page QA (developer tool, not shipped).
 *
 * Usage: node qa/check-pricing.mjs [baseUrl]   (default http://127.0.0.1:4173)
 *        PRICING_URL=<full page URL> node qa/check-pricing.mjs
 *
 * Checks at realistic window sizes (phones with browser toolbars, a tablet,
 * and laptop windows from 1280x620 to 1440x789): no horizontal overflow,
 * heading order, a two-line H1 on phones, plan buttons in the first screen,
 * exact prices and billing disclosures in both billing states (from the
 * verified Legiit plan data), every plan link's destination including the
 * billing parameter, keyboard operation of the billing switch, the FAQ
 * accordion, table semantics, Initial Caps on every button label, no em
 * dashes, no "Popular" label, no rounded $39, 44px targets, and page
 * metadata. Screenshots go to qa/screenshots.
 */
import { chromium } from 'playwright-core'
import { mkdirSync, existsSync } from 'node:fs'

const base = (process.argv[2] ?? 'http://127.0.0.1:4173').replace(/\/$/, '')
// PRICING_URL tests a deployed copy, e.g. PRICING_URL=http://127.0.0.1:4200/pricing/ or a file:// preview.
const url = process.env.PRICING_URL ?? `${base}/pricing.html`
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
  monthly: {
    business: '$49',
    agency: '$169',
    businessLine: 'Billed monthly. Or $39.20/month billed annually, saving $117.60 a year.',
    agencyLine: 'Billed monthly. Or $135.20/month billed annually, saving $405.60 a year.',
    perBusiness: '$8.45 per business per month with all 20 in use',
  },
  yearly: {
    business: '$39.20',
    agency: '$135.20',
    businessLine: 'Billed annually at $470.40. Save $117.60 a year.',
    agencyLine: 'Billed annually at $1,622.40. Save $405.60 a year.',
    perBusiness: '$6.76 per business per month with all 20 in use',
  },
}
const SETUPS = ['1 Business $49/month', '2 Business plus 1 additional business $59/month', 'Up to 20 Agency $169/month', '21 Agency plus 1 additional business $179/month']
// Every plan link on the page: 4 in the cards, 1 marketplace, 2 per-business, 3 compare, 3 final.
const EXPECTED_ROUTED_LINKS = 13

const readCards = (page) =>
  page.evaluate(() => {
    const card = (id) => {
      const a = document.querySelector(`article[aria-labelledby="plan-${id}"]`)
      if (!a) return null
      return { text: a.innerText.replace(/\s+/g, ' '), href: a.querySelector('a[data-plan-cta]')?.href }
    }
    return { business: card('business_dashboard'), agency: card('agency_dashboard') }
  })

for (const [width, height] of [
  [320, 640],
  [360, 640],
  [390, 664],
  [768, 1024],
  [1280, 620],
  [1366, 657],
  [1440, 789],
]) {
  const context = await browser.newContext({ viewport: { width, height } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  await page.goto(url, { waitUntil: 'networkidle' })

  const m = await page.evaluate(() => {
    const rect = (el) => el.getBoundingClientRect()
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => ({ level: Number(h.tagName[1]), text: h.textContent.trim() }))
    const buttonLabels = Array.from(document.querySelectorAll('button, a[data-plan-cta], a[data-cta-placement], label[for]'))
      .filter((el) => el.offsetParent !== null)
      .map((el) => (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' '))
      .filter(Boolean)
    const notCaps = buttonLabels.filter((t) =>
      t
        .split(' ')
        .filter((w) => /[A-Za-z]/.test(w))
        .some((w) => !/^[^A-Za-z]*[A-Z0-9]/.test(w)),
    )
    const small = Array.from(document.querySelectorAll('a[href], button, label[for]'))
      .filter((el) => el.offsetParent !== null && !el.classList.contains('sr-only'))
      .map((el) => ({ t: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40), h: Math.round(rect(el).height), w: Math.round(rect(el).width), inline: getComputedStyle(el).display === 'inline' }))
      .filter((x) => !x.inline && (x.h < 44 || x.w < 44))
    const table = document.querySelector('#compare table')
    const setupRows = Array.from(document.querySelectorAll('#per-business tbody tr')).map((tr) => tr.innerText.replace(/\s+/g, ' ').trim())
    const h1Spans = Array.from(document.querySelectorAll('h1 > span'))
    const bottom = (sel) => {
      const el = document.querySelector(sel)
      return el ? Math.round(rect(el).bottom) : null
    }
    // Table text may wrap at spaces or before a unit's slash, never inside a word.
    const midWord = []
    for (const cell of document.querySelectorAll('#compare td, #per-business td')) {
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT)
      let node
      while ((node = walker.nextNode())) {
        for (const piece of node.textContent.matchAll(/[^\s/]+/g)) {
          const range = document.createRange()
          range.setStart(node, piece.index)
          range.setEnd(node, piece.index + piece[0].length)
          if (new Set(Array.from(range.getClientRects()).map((r) => Math.round(r.top))).size > 1) midWord.push(piece[0])
        }
      }
    }
    const faqLinks = Array.from(document.querySelectorAll('[role="region"] a')).map((a) => a.getAttribute('href'))
    const text = document.body.innerText
    // textContent includes collapsed FAQ answers, which innerText skips.
    const allText = document.body.textContent
    const banned = (allText.match(/unlimited|guarantee|refund|cancel|no credit card|money.back|risk.free/gi) || []).map((t) => t.toLowerCase())
    const longParagraphs = Array.from(document.querySelectorAll('main p'))
      .map((p) => p.textContent.trim().replace(/\s+/g, ' '))
      .filter((t) => t.split(/(?<=[.!?])\s+(?=[A-Z“"$0-9])/).length > 2)
    return {
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
      ih: window.innerHeight,
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content,
      headings,
      h1Count: headings.filter((h) => h.level === 1).length,
      h1LinesPerSpan: h1Spans.map((s) => s.getClientRects().length),
      emDash: /—/.test(allText),
      midWord,
      faqLinks,
      banned,
      longParagraphs,
      popular: /popular/i.test(text),
      rounded39: /\$39(?!\.20)/.test(text),
      notCaps,
      small,
      tableOk: !!table && table.querySelectorAll('th[scope="col"]').length === 2 && table.querySelectorAll('th[scope="row"]').length >= 10 && !!table.querySelector('caption'),
      setupRows,
      anchors: ['business', 'agency', 'per-business', 'compare'].filter((id) => !document.getElementById(id)),
      cardRows: ['a[data-plan-cta]', 'ul'].map((sel) => ['business_dashboard', 'agency_dashboard'].map((id) => Math.round(rect(document.querySelector(`article[aria-labelledby="plan-${id}"] ${sel}`)).top))),
      businessCtaTop: Math.round(rect(document.querySelector('article[aria-labelledby="plan-business_dashboard"] a[data-plan-cta]')).top),
      agencyCtaTop: Math.round(rect(document.querySelector('article[aria-labelledby="plan-agency_dashboard"] a[data-plan-cta]')).top),
      bigButtons: Array.from(document.querySelectorAll('a.btn-xl')).map((a) => ({
        label: a.textContent.trim(),
        fits: a.scrollWidth <= a.clientWidth + 1,
        height: Math.round(rect(a).height),
        font: getComputedStyle(a).fontSize,
      })),
      headerCta: document.querySelector('a[data-cta-placement="header"]')?.href,
      headerOverlap: (() => {
        const visible = Array.from(document.querySelectorAll('header a[href="#top"] > *')).filter((el) => getComputedStyle(el).display !== 'none')
        const right = Math.max(...visible.map((el) => el.getBoundingClientRect().right))
        return Math.round(right - document.querySelector('a[data-cta-placement="header"]').getBoundingClientRect().left)
      })(),
    }
  })

  m.sw <= m.iw ? pass(`${width}: no horizontal overflow`) : fail(`${width}: overflow ${m.sw} > ${m.iw}`)
  m.h1Count === 1 ? pass(`${width}: one h1`) : fail(`${width}: ${m.h1Count} h1 elements`)
  // Same heading type as the landing page: exactly two lines from tablet width, natural wrapping on phones.
  if (width >= 768) {
    m.h1LinesPerSpan.length === 2 && m.h1LinesPerSpan.every((n) => n === 1) ? pass(`${width}: H1 is exactly two lines`) : fail(`${width}: H1 lines per span ${JSON.stringify(m.h1LinesPerSpan)}`)
  }
  m.headerOverlap <= 0 ? pass(`${width}: header lockup and trial button do not overlap`) : fail(`${width}: header overlap ${m.headerOverlap}px`)
  const skips = m.headings.filter((h, i) => i > 0 && h.level > m.headings[i - 1].level + 1)
  skips.length === 0 ? pass(`${width}: heading levels never skip`) : fail(`${width}: heading skips ${JSON.stringify(skips)}`)
  !m.emDash ? pass(`${width}: no em dashes`) : fail(`${width}: em dash in page text`)
  !m.popular ? pass(`${width}: no "Popular" label`) : fail(`${width}: "popular" appears in page text`)
  m.banned.length === 0 ? pass(`${width}: no unverified terms (unlimited, guarantee, refund, cancel, no credit card)`) : fail(`${width}: unverified terms in page text ${JSON.stringify(m.banned)}`)
  m.longParagraphs.length === 0 ? pass(`${width}: every paragraph has two sentences or fewer`) : fail(`${width}: long paragraphs ${JSON.stringify(m.longParagraphs)}`)
  !m.rounded39 ? pass(`${width}: no rounded $39 price`) : fail(`${width}: "$39" without ".20" appears`)
  m.notCaps.length === 0 ? pass(`${width}: every button label is Initial Caps`) : fail(`${width}: labels not Initial Caps ${JSON.stringify(m.notCaps)}`)
  m.small.length === 0 ? pass(`${width}: all targets at least 44px`) : fail(`${width}: small targets ${JSON.stringify(m.small)}`)
  m.tableOk ? pass(`${width}: comparison table has caption, column and row headers`) : fail(`${width}: comparison table semantics`)
  JSON.stringify(m.setupRows) === JSON.stringify(SETUPS) ? pass(`${width}: common-setups table prices are exact`) : fail(`${width}: setups ${JSON.stringify(m.setupRows)}`)
  m.midWord.length === 0 ? pass(`${width}: table text never breaks inside a word`) : fail(`${width}: mid-word breaks ${JSON.stringify(m.midWord)}`)
  JSON.stringify(m.faqLinks) === JSON.stringify(['mailto:help@legiit.com', 'https://legiit.freshdesk.com/support/home'])
    ? pass(`${width}: FAQ contact answer links the email and support center`)
    : fail(`${width}: FAQ links ${JSON.stringify(m.faqLinks)}`)
  m.anchors.length === 0 ? pass(`${width}: anchors #business, #agency, #per-business, #compare exist`) : fail(`${width}: missing anchors ${m.anchors}`)
  m.headerCta === TRIAL ? pass(`${width}: header button goes to the trial start`) : fail(`${width}: header button ${m.headerCta}`)
  // 320px is the WCAG reflow width (400% zoom); there the header's trial button is the first-screen action.
  // The plan buttons are 108px tall, so "in the first screen" means at least 44px of the button shows.
  if (width >= 360) {
    m.businessCtaTop + 44 <= m.ih
      ? pass(`${width}x${height}: Business trial button shows in the first screen (top ${m.businessCtaTop})`)
      : fail(`${width}x${height}: Business trial button below the fold (top ${m.businessCtaTop})`)
  }
  const badButtons = m.bigButtons.filter((b) => !b.fits || b.height < 108)
  m.bigButtons.length === 7 && badButtons.length === 0
    ? pass(`${width}: all 7 double-size buttons are 108px tall with labels on one line (${[...new Set(m.bigButtons.map((b) => b.font))].join(', ')})`)
    : fail(`${width}: double-size buttons ${JSON.stringify(badButtons.length ? badButtons : m.bigButtons.length)}`)
  if (width >= 768) {
    m.cardRows.every(([b, a]) => Math.abs(b - a) <= 2) ? pass(`${width}: both cards' buttons and lists line up`) : fail(`${width}: card rows out of line ${JSON.stringify(m.cardRows)}`)
    m.agencyCtaTop + 44 <= m.ih
      ? pass(`${width}x${height}: Agency button shows in the first screen (top ${m.agencyCtaTop})`)
      : fail(`${width}x${height}: Agency button below the fold (top ${m.agencyCtaTop})`)
  }
  errors.length === 0 ? pass(`${width}: no console errors`) : fail(`${width}: console errors ${errors.join(' | ')}`)

  // Billing states: prices, disclosures, and every routed link's destination.
  // Annual first, then back to Monthly, so each step is a real change that gets announced.
  for (const billing of ['yearly', 'monthly']) {
    const label = billing === 'monthly' ? 'Monthly' : 'Annual'
    await page.locator('label').filter({ hasText: new RegExp(`^${label}`) }).first().click()
    await page.waitForTimeout(100)
    const cards = await readCards(page)
    const e = EXPECT[billing]
    const status = await page.evaluate(() => document.querySelector('[role="status"]')?.textContent)
    const wantStatus = billing === 'yearly' ? 'Annual billing: Business $39.20 a month, billed $470.40 a year; Agency $135.20 a month, billed $1,622.40 a year.' : 'Monthly billing: Business $49 a month; Agency $169 a month.'
    status === wantStatus ? pass(`${width} ${billing}: billing change is announced in one sentence`) : fail(`${width} ${billing}: status text ${JSON.stringify(status)}`)
    const bOk = cards.business && cards.business.text.includes(`${e.business} /month`) && cards.business.text.includes(e.businessLine)
    const aOk = cards.agency && cards.agency.text.includes(`${e.agency} /month`) && cards.agency.text.includes(e.agencyLine) && cards.agency.text.includes(e.perBusiness)
    bOk ? pass(`${width} ${billing}: Business shows ${e.business}/month with its billing disclosure`) : fail(`${width} ${billing}: Business card text ${cards.business?.text}`)
    aOk ? pass(`${width} ${billing}: Agency shows ${e.agency}/month, disclosure, and per-business price`) : fail(`${width} ${billing}: Agency card text ${cards.agency?.text}`)
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[data-cta-route]')).map((a) => ({ plan: a.dataset.planCta || a.dataset.altPlan, route: a.dataset.ctaRoute, href: a.href })),
    )
    const want = (l) => (l.route === 'trial' ? TRIAL : l.route === 'register' ? REGISTER : subscribe(l.plan, billing))
    const wrong = links.filter((l) => l.href !== want(l) || (l.route === 'trial' && l.plan !== 'business_dashboard') || (l.route === 'register' && l.plan !== 'marketplace'))
    wrong.length === 0 && links.length === EXPECTED_ROUTED_LINKS
      ? pass(`${width} ${billing}: all ${links.length} plan links go to the right destination`)
      : fail(`${width} ${billing}: wrong destinations ${JSON.stringify(wrong)} (count ${links.length})`)
  }

  // Keyboard: arrow keys move between billing options.
  await page.locator('label').filter({ hasText: /^Monthly/ }).first().click()
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
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: `${outDir}/pricing-${width}-fold.png` })
  await page.screenshot({ path: `${outDir}/pricing-${width}.png`, fullPage: true })

  // Deep link: the planned redirect target /pricing#agency must open on the Agency plan.
  const deep = await context.newPage()
  await deep.goto(`${url}#agency`, { waitUntil: 'networkidle' })
  await deep.waitForTimeout(150)
  const agencyTop = await deep.evaluate(() => Math.round(document.getElementById('agency').getBoundingClientRect().top))
  agencyTop >= 0 && agencyTop <= 64 ? pass(`${width}: /pricing#agency opens on the Agency plan (top ${agencyTop})`) : fail(`${width}: /pricing#agency lands with the Agency plan at ${agencyTop}`)
  await context.close()
}

// Forced colors (Windows High Contrast): the selected billing option must still look different.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, forcedColors: 'active' })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  const shot = async () => page.locator('fieldset').first().screenshot()
  const monthly = await shot()
  await page.locator('label').filter({ hasText: /^Annual/ }).first().click()
  const yearly = await shot()
  !monthly.equals(yearly) ? pass('forced colors: the selected billing option is visible') : fail('forced colors: both billing states look identical')
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.m}`)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
