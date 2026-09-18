/**
 * Local QA (developer tool, not shipped).
 *
 * Usage: node qa/check-page.mjs [baseUrl]   (default http://127.0.0.1:4173)
 *
 * Checks 390, 768, and 1440 px (plus 360 for overflow): no horizontal overflow,
 * section order, CTA hrefs, media loading (logo, screenshots, video metadata,
 * caption track), "Watch product overview" playback, walkthrough controls,
 * enlarge dialog, FAQ and allowances disclosures, 44px targets, focus
 * behaviour, reduced motion, and image fallbacks. Screenshots -> qa/screenshots.
 */
import { chromium } from 'playwright-core'
import { mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const base = process.argv[2] ?? 'http://127.0.0.1:4173'
const outDir = 'qa/screenshots'
mkdirSync(outDir, { recursive: true })

function findChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers'
  for (const entry of readdirSync(root)) {
    if (!entry.startsWith('chromium')) continue
    for (const sub of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome']) {
      const p = join(root, entry, sub)
      try {
        if (statSync(p).isFile()) return p
      } catch {
        /* keep looking */
      }
    }
  }
  return undefined
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? findChromium(), headless: true })
const results = []
const pass = (m) => results.push({ ok: true, m })
const fail = (m) => results.push({ ok: false, m })
const CTA = 'https://dashboard.legiit.com/'

for (const width of [360, 390, 768, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const failedRequests = []
  const mediaResponses = []
  // Media elements cancel open-ended range requests once they have enough data; that is ERR_ABORTED by design.
  page.on('requestfailed', (r) => {
    if (/\.(mp4|webm)(\?|$)/.test(r.url()) && r.failure()?.errorText === 'net::ERR_ABORTED') return
    failedRequests.push(`${r.url()} (${r.failure()?.errorText})`)
  })
  page.on('response', (r) => {
    if (/\.(mp4|webm|vtt)(\?|$)/.test(r.url())) mediaResponses.push({ file: r.url().split('/').pop(), status: r.status(), type: r.headers()['content-type'] })
  })
  await page.goto(base, { waitUntil: 'networkidle' })

  const m = await page.evaluate(() => {
    const rect = (el) => el.getBoundingClientRect()
    const sections = Array.from(document.querySelectorAll('main > section')).map((s) => s.querySelector('h1,h2')?.textContent.trim())
    const video = document.querySelector('video')
    const imgs = Array.from(document.querySelectorAll('img'))
    const targets = Array.from(document.querySelectorAll('a[href], button'))
      .filter((el) => el.offsetParent !== null && !el.classList.contains('sr-only'))
      .map((el) => ({ t: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30), h: rect(el).height, w: rect(el).width }))
      .filter((t) => t.h < 44 || t.w < 44)
    const hero = document.querySelector('#hero-heading')
    const vRect = video ? rect(video) : null
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      sections,
      ctas: Array.from(document.querySelectorAll('a[data-cta-placement]')).map((a) => ({ p: a.dataset.ctaPlacement, href: a.href })),
      externalLinks: Array.from(document.querySelectorAll('a[href^="http"]')).map((a) => a.href),
      imgsFailed: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')),
      imgsWithoutDims: imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).length,
      lazyBelowFold: imgs.filter((i) => i.loading === 'lazy').length,
      video: video
        ? {
            controls: video.controls,
            autoplay: video.autoplay,
            poster: !!video.poster,
            tracks: video.textTracks.length,
            trackLang: video.textTracks[0]?.language,
            trackMode: video.textTracks[0]?.mode,
            readyState: video.readyState,
            duration: video.duration,
            width: Math.round(vRect.width),
            heroVideoBelowHeading: window.innerWidth < 1024 ? vRect.top > rect(hero).bottom : true,
          }
        : null,
      smallTargets: targets,
      words: document.body.innerText.trim().split(/\s+/).length,
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => `${h.tagName}:${h.textContent.trim().slice(0, 40)}`),
    }
  })

  m.scrollWidth <= m.innerWidth ? pass(`${width}: no horizontal overflow`) : fail(`${width}: overflow ${m.scrollWidth}>${m.innerWidth}`)
  const expectedSections = [
    'Take control of your marketing, from plan to done.',
    'Understand your online position',
    'Know what deserves attention',
    'Get the marketing work done',
    'Keep work and progress connected',
    'Try it for 7 days. Then one price for one business.',
    'Common questions',
    'Start with one business.',
  ]
  JSON.stringify(m.sections) === JSON.stringify(expectedSections) ? pass(`${width}: section order correct (${m.sections.length})`) : fail(`${width}: sections ${JSON.stringify(m.sections)}`)
  m.ctas.length === 4 && m.ctas.every((c) => c.href === CTA) ? pass(`${width}: 4 CTAs -> ${CTA}`) : fail(`${width}: CTAs ${JSON.stringify(m.ctas)}`)
  m.externalLinks.every((h) => h === CTA) ? pass(`${width}: no other external links`) : fail(`${width}: external ${JSON.stringify(m.externalLinks)}`)
  m.imgsFailed.length === 0 ? pass(`${width}: all images loaded`) : fail(`${width}: failed images ${m.imgsFailed}`)
  m.imgsWithoutDims === 0 ? pass(`${width}: all images reserve dimensions`) : fail(`${width}: ${m.imgsWithoutDims} images without dimensions`)
  m.lazyBelowFold >= 5 ? pass(`${width}: ${m.lazyBelowFold} below-fold images lazy`) : fail(`${width}: only ${m.lazyBelowFold} lazy images`)
  if (m.video) {
    m.video.controls && !m.video.autoplay && m.video.poster ? pass(`${width}: video has controls, poster, no autoplay`) : fail(`${width}: video ${JSON.stringify(m.video)}`)
    m.video.tracks === 1 && m.video.trackLang === 'en' ? pass(`${width}: English caption track attached (mode ${m.video.trackMode})`) : fail(`${width}: tracks ${JSON.stringify(m.video)}`)
    m.video.readyState >= 1 && Math.abs(m.video.duration - 42) < 2 ? pass(`${width}: video metadata loaded, ${m.video.duration.toFixed(1)}s`) : fail(`${width}: video metadata readyState=${m.video.readyState} duration=${m.video.duration}`)
    m.video.heroVideoBelowHeading ? pass(`${width}: video sits under the hero message on small screens`) : fail(`${width}: video above hero message`)
    pass(`${width}: video rendered ${m.video.width}px wide`)
  } else fail(`${width}: no video element`)
  m.smallTargets.length === 0 ? pass(`${width}: all targets >= 44px`) : fail(`${width}: small targets ${JSON.stringify(m.smallTargets)}`)
  const vtt = mediaResponses.find((r) => r.file.endsWith('.vtt'))
  vtt && vtt.status === 200 && /text\/vtt/.test(vtt.type) ? pass(`${width}: caption file served same-origin as text/vtt`) : fail(`${width}: vtt response ${JSON.stringify(mediaResponses)}`)
  const webm = mediaResponses.find((r) => r.file.endsWith('.webm'))
  if (webm) (webm.status === 206 || webm.status === 200) && /video\/webm/.test(webm.type) ? pass(`${width}: WebM fallback served as video/webm (${webm.status})`) : fail(`${width}: webm response ${JSON.stringify(webm)}`)
  const mp4 = mediaResponses.find((r) => r.file.endsWith('.mp4'))
  mp4 && (mp4.status === 206 || mp4.status === 200) && /video\/mp4/.test(mp4.type) ? pass(`${width}: primary MP4 requested and served as video/mp4 (${mp4.status})`) : fail(`${width}: mp4 response ${JSON.stringify(mediaResponses)}`)
  failedRequests.length === 0 ? pass(`${width}: no failed requests`) : fail(`${width}: failed requests ${failedRequests.join(', ')}`)
  if (width === 1440) console.log('Headings:', m.headings.join(' | '), `\nVisible words: ${m.words}`)

  // Scroll through the page so lazy images load, then confirm every image is decoded before capturing.
  await page.evaluate(async () => {
    const step = Math.max(300, window.innerHeight * 0.8)
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 150))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForFunction(() => Array.from(document.querySelectorAll('img')).every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 8000 }).catch(() => {})
  const afterScroll = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute('src')))
  afterScroll.length === 0 ? pass(`${width}: every image decoded after scrolling (lazy images load)`) : fail(`${width}: images not loaded after scroll ${afterScroll}`)

  await page.screenshot({ path: `${outDir}/page-${width}.png`, fullPage: true })
  if (width === 360) {
    await context.close()
    continue
  }

  // Watch product overview: scrolls to the video and starts playback (user gesture).
  // Playwright's Chromium ships without H.264, so if the source errors here the
  // page shows its honest fallback; that is reported as an environment limitation.
  const codec = await page.evaluate(() => {
    const v = document.querySelector('video')
    return { present: !!v, canAvc1: document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"'), error: v?.error?.code ?? null, src: v?.currentSrc?.split('/').pop() ?? null }
  })
  await page.getByRole('button', { name: 'Watch product overview' }).click()
  await page.waitForTimeout(900)
  const playing = await page.evaluate(() => {
    const v = document.querySelector('video')
    const box = document.getElementById('product-overview')
    const r = box.getBoundingClientRect()
    return {
      videoPresent: !!v,
      paused: v ? v.paused : null,
      currentTime: v ? v.currentTime : null,
      inView: r.top >= -10 && r.bottom <= window.innerHeight + 10,
      cues: v?.textTracks[0]?.cues?.length ?? null,
      mode: v?.textTracks[0]?.mode ?? null,
      fallbackShown: document.body.innerText.includes('could not be loaded'),
      src: v?.currentSrc?.split('/').pop() ?? null,
    }
  })
  playing.inView ? pass(`${width}: Watch product overview scrolls the player into view`) : fail(`${width}: watch action did not scroll (${JSON.stringify(playing)})`)
  if (playing.videoPresent && playing.paused === false) {
    const via = codec.canAvc1 === '' && /webm/.test(playing.src) ? ' via the WebM fallback because this Chromium has no H.264 decoder' : ''
    pass(`${width}: playback started from the click${via} (src ${playing.src}, t=${playing.currentTime.toFixed(2)}s, ${playing.cues} caption cues, captions ${playing.mode})`)
    playing.cues === 6 && playing.mode === 'showing' ? pass(`${width}: 6 English caption cues loaded and showing`) : fail(`${width}: captions cues=${playing.cues} mode=${playing.mode}`)
    // Real playback events: seek near the end and let it finish
    const events = await page.evaluate(async () => {
      const v = document.querySelector('video')
      const seen = []
      const orig = console.debug
      console.debug = (...args) => { if (args[0] === '[cc-events]') seen.push(args[1]?.name); orig(...args) }
      v.currentTime = Math.max(0, v.duration - 1.2)
      await v.play().catch(() => {})
      await new Promise((r) => { v.addEventListener('ended', () => r(), { once: true }); setTimeout(r, 4000) })
      console.debug = orig
      return { ended: v.ended, duration: v.duration, videoWidth: v.videoWidth, videoHeight: v.videoHeight }
    })
    events.ended && events.videoWidth === 1280 && events.videoHeight === 720 ? pass(`${width}: real playback reached the end (${events.duration.toFixed(1)}s, ${events.videoWidth}x${events.videoHeight})`) : fail(`${width}: playback end ${JSON.stringify(events)}`)
  } else if (!playing.videoPresent && playing.fallbackShown && codec.canAvc1 === '') {
    pass(`${width}: no H.264 decoder in this Chromium, so the page showed its honest fallback`)
  } else {
    fail(`${width}: playback state ${JSON.stringify({ codec, playing })}`)
  }

  // Walkthrough dialog
  const explore = page.getByRole('button', { name: 'Explore Command Center' })
  await explore.scrollIntoViewIfNeeded()
  await explore.click()
  const dialog = page.locator('dialog[open]')
  await dialog.waitFor({ state: 'visible' })
  const chapters = await dialog.locator('nav ol li').count()
  chapters === 7 ? pass(`${width}: walkthrough lists 7 chapters`) : fail(`${width}: walkthrough chapters ${chapters}`)
  const focusIn = await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'))
  focusIn ? pass(`${width}: focus moved into walkthrough`) : fail(`${width}: focus not in walkthrough`)
  const prevDisabled = await dialog.getByRole('button', { name: 'Previous' }).isDisabled()
  await dialog.getByRole('button', { name: 'Next' }).click()
  const ch2 = await dialog.locator('h3').textContent()
  await dialog.getByRole('button', { name: 'Previous' }).click()
  const ch1 = await dialog.locator('h3').textContent()
  prevDisabled && ch2 === 'Online visibility' && ch1 === 'Business overview' ? pass(`${width}: Next/Previous work`) : fail(`${width}: walkthrough nav prev=${prevDisabled} ch2=${ch2} ch1=${ch1}`)
  await dialog.locator('nav button').last().click()
  const last = await dialog.locator('h3').textContent()
  const noScreen = await dialog.getByText('No screen for this chapter').count()
  const nextDisabled = await dialog.getByRole('button', { name: 'Next' }).isDisabled()
  last === 'Ongoing work' && noScreen === 1 && nextDisabled ? pass(`${width}: last chapter is text-only and Next disables`) : fail(`${width}: last chapter ${last} noScreen=${noScreen} nextDisabled=${nextDisabled}`)
  await dialog.locator('nav button').nth(2).click()
  await page.waitForFunction(() => {
    const img = document.querySelector('dialog[open] section img')
    return img && img.complete && img.naturalWidth > 0
  }, null, { timeout: 8000 }).catch(() => {})
  const walkImg = await page.evaluate(() => {
    const d = document.querySelector('dialog[open]')
    const img = d.querySelector('section img')
    const r = img?.getBoundingClientRect()
    const body = d.querySelector('[data-dialog-body]')
    return { loaded: !!img && img.complete && img.naturalWidth > 0, w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0, scrollLeft: body ? body.scrollLeft : 0, overflowX: body ? body.scrollWidth - body.clientWidth : 0 }
  })
  walkImg.loaded && walkImg.h >= 150 && walkImg.w >= 200 ? pass(`${width}: walkthrough chapter image renders (${walkImg.w}x${walkImg.h})`) : fail(`${width}: walkthrough image ${JSON.stringify(walkImg)}`)
  walkImg.overflowX <= 0 && walkImg.scrollLeft === 0 ? pass(`${width}: walkthrough has no horizontal overflow`) : fail(`${width}: walkthrough horizontal overflow ${JSON.stringify(walkImg)}`)
  await page.screenshot({ path: `${outDir}/walkthrough-${width}.png` })
  await page.keyboard.press('Escape')
  await page.locator('dialog[open]').waitFor({ state: 'detached' }).catch(() => {})
  const restored = await page.evaluate(() => document.activeElement?.textContent?.includes('Explore Command Center'))
  restored ? pass(`${width}: Escape closes walkthrough and restores focus`) : fail(`${width}: focus not restored after walkthrough`)

  // Enlarge dialog on the first product screen
  const enlarge = page.getByRole('button', { name: /Enlarge the Online Visibility screenshot/ })
  await enlarge.scrollIntoViewIfNeeded()
  await enlarge.click()
  await page.locator('dialog[open]').waitFor({ state: 'visible' })
  const dialogImgs = await page.locator('dialog[open] img').count()
  await page.screenshot({ path: `${outDir}/enlarge-${width}.png` })
  for (let i = 0; i < 3; i++) await page.keyboard.press('Tab')
  const stillInside = await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'))
  await page.getByRole('button', { name: 'Close' }).click()
  await page.locator('dialog[open]').waitFor({ state: 'detached' }).catch(() => {})
  const restored2 = await page.evaluate(() => document.activeElement?.getAttribute('aria-label')?.includes('Enlarge'))
  const lockReleased = await page.evaluate(() => document.documentElement.style.overflow === '')
  dialogImgs === 1 && stillInside && restored2 && lockReleased ? pass(`${width}: enlarge dialog opens, traps Tab, closes, restores focus`) : fail(`${width}: enlarge imgs=${dialogImgs} inside=${stillInside} restored=${restored2} lock=${lockReleased}`)

  // Allowances disclosure
  const allow = page.getByRole('button', { name: 'Plan allowances' })
  await allow.scrollIntoViewIfNeeded()
  await allow.click()
  const allowText = await page.locator('#' + (await allow.getAttribute('aria-controls')).replace(/:/g, '\\:')).innerText()
  const allowOk = /25 Backlink Data/.test(allowText) && /50,000 AI credits per month/.test(allowText) && (await allow.getAttribute('aria-expanded')) === 'true'
  allowOk ? pass(`${width}: allowances disclosure works`) : fail(`${width}: allowances ${allowText}`)

  // FAQ
  const faq = page.locator('h3 button[aria-expanded]').first()
  await faq.scrollIntoViewIfNeeded()
  await faq.click()
  const opened = (await faq.getAttribute('aria-expanded')) === 'true'
  await faq.press('Enter')
  const closed = (await faq.getAttribute('aria-expanded')) === 'false'
  opened && closed ? pass(`${width}: FAQ opens and closes`) : fail(`${width}: FAQ open=${opened} closed=${closed}`)

  await context.close()
}

// Reduced motion + tab order
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  const order = []
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    order.push(await page.evaluate(() => (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent || document.activeElement?.tagName || '').trim().slice(0, 34)))
  }
  console.log('Tab order:', order.join(' -> '))
  order[0] === 'Skip to content' ? pass('keyboard: skip link first') : fail(`keyboard: first ${order[0]}`)
  const skip = await page.evaluate(() => {
    const a = document.querySelector('a[href="#main"]')
    a.focus()
    const r = a.getBoundingClientRect()
    return r.height
  })
  skip >= 44 ? pass(`skip link: ${Math.round(skip)}px tall when focused`) : fail(`skip link: ${skip}px`)
  await context.close()
}

// Asset fallbacks
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.route('**/legiit-logo*.png', (r) => r.abort())
  await page.route('**/visibility-*.jpg', (r) => r.abort())
  await page.route('**/command-center-overview-*.mp4', (r) => r.abort())
  await page.route('**/command-center-overview-*.webm', (r) => r.abort())
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const fb = await page.evaluate(() => ({
    logoText: document.querySelector('header a')?.textContent?.trim().startsWith('Legiit'),
    logoImgs: document.querySelectorAll('header img').length,
    shotFallback: document.querySelectorAll('figure [role="img"]').length,
    videoFallback: !!document.querySelector('#product-overview img'),
    videoMsg: document.body.innerText.includes('could not be loaded'),
  }))
  fb.logoText && fb.logoImgs === 0 ? pass('fallback: logo text when image fails') : fail(`fallback: logo ${JSON.stringify(fb)}`)
  fb.shotFallback === 1 ? pass('fallback: screenshot text description when image fails') : fail(`fallback: screenshot ${JSON.stringify(fb)}`)
  fb.videoFallback && fb.videoMsg ? pass('fallback: video failure keeps poster and explains') : fail(`fallback: video ${JSON.stringify(fb)}`)
  await page.screenshot({ path: `${outDir}/fallback-390.png`, fullPage: true })
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.m}`)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
