/** Reports the local Chromium's codec support and the hero video's load state. Usage: node qa/probe-media.mjs [baseUrl] */
import { chromium } from 'playwright-core'
import { readdirSync } from 'node:fs'
const base = process.argv[2] ?? 'http://127.0.0.1:4173'
const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers'
const dir = readdirSync(root).find((e) => e.startsWith('chromium-'))
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? `${root}/${dir}/chrome-linux/chrome`, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (m) => { if (/media|video|source/i.test(m.text())) console.log('console:', m.text()) })
const responses = []
page.on('response', (r) => {
  if (/\.(mp4|webm|vtt)/.test(r.url())) responses.push({ file: r.url().split('/').pop(), status: r.status(), type: r.headers()['content-type'], len: r.headers()['content-length'], range: r.headers()['content-range'] })
})
page.on('requestfailed', (r) => console.log('requestfailed:', r.url().split('/').pop(), r.failure()?.errorText))
// Instrument before the app renders: capture source/video error events with MediaError details
await page.addInitScript(() => {
  window.__mediaLog = []
  document.addEventListener('error', (e) => {
    const t = e.target
    if (t && (t.tagName === 'SOURCE' || t.tagName === 'VIDEO')) {
      const v = t.tagName === 'VIDEO' ? t : t.parentElement
      window.__mediaLog.push({ tag: t.tagName, src: (t.src || '').split('/').pop(), type: t.type, err: v?.error ? { code: v.error.code, message: v.error.message } : null, networkState: v?.networkState, readyState: v?.readyState })
    }
  }, true)
})
await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const info = await page.evaluate(() => {
  const probe = document.createElement('video')
  return {
    canPlay: { mp4: probe.canPlayType('video/mp4'), avc1: probe.canPlayType('video/mp4; codecs="avc1.42E01E"'), webm: probe.canPlayType('video/webm'), vp9: probe.canPlayType('video/webm; codecs="vp9"'), vp09: probe.canPlayType('video/webm; codecs="vp09.00.10.08"') },
    mediaLog: window.__mediaLog,
    fallbackShown: document.body.innerText.includes('could not be loaded'),
  }
})
console.log(JSON.stringify({ info, responses }, null, 2))

// Bare element tests on the same origin
const webmUrl = responses.find((r) => r.file.endsWith('.webm'))?.file
const mp4Url = responses.find((r) => r.file.endsWith('.mp4'))?.file
for (const [label, file, cors] of [['webm plain', webmUrl, false], ['webm crossorigin', webmUrl, true], ['mp4 plain', mp4Url, false]]) {
  if (!file) continue
  const r = await page.evaluate(async ({ file, cors }) => {
    const v = document.createElement('video')
    if (cors) v.crossOrigin = 'anonymous'
    v.muted = true
    v.src = '/assets/' + file
    document.body.appendChild(v)
    const result = await new Promise((resolve) => {
      const done = (why) => resolve({ why, err: v.error ? { code: v.error.code, message: v.error.message } : null, readyState: v.readyState, duration: v.duration, w: v.videoWidth, h: v.videoHeight })
      v.addEventListener('loadedmetadata', () => done('loadedmetadata'), { once: true })
      v.addEventListener('error', () => done('error'), { once: true })
      setTimeout(() => done('timeout'), 4000)
      v.load()
    })
    if (!result.err) { try { await v.play(); await new Promise((r) => setTimeout(r, 800)); result.playedTo = v.currentTime; v.pause() } catch (e) { result.playErr = String(e) } }
    v.remove()
    return result
  }, { file, cors })
  console.log(label, JSON.stringify(r))
}
await browser.close()
