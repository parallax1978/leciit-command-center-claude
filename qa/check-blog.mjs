/**
 * Blog QA (developer tool, not shipped).
 *
 * Usage: node qa/check-blog.mjs [baseUrl]   (default http://127.0.0.1:4174, the built blog preview)
 *
 * On a sample of page types (index, page 2, topic, topic page 2, a long post, an old post, search,
 * archive, author) at 360, 390, 768, 1024 and 1440 px: no horizontal overflow, exactly one H1 and
 * no skipped heading levels, title, description, canonical and Open Graph tags, valid JSON-LD with
 * a BreadcrumbList that matches the visible breadcrumb, BlogPosting on posts, a table of contents
 * whose links resolve, no H1 or new-tab internal links inside the body, wrapped tables, lazy card
 * images and an eager hero, numbered pagination with real links, noindex on search, 44px buttons
 * and 24px links (WCAG 2.2 AA target size), sentence-case button labels, no console errors. Then
 * every internal link on every generated page must resolve to a generated file. Screenshots go to
 * qa/screenshots.
 */
import { chromium } from 'playwright-core'
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'

const base = (process.argv[2] ?? 'http://127.0.0.1:4174').replace(/\/$/, '')
const outDir = 'qa/screenshots'
mkdirSync(outDir, { recursive: true })
const executablePath = process.env.CHROMIUM_PATH ?? ['/opt/pw-browsers/chromium'].find((p) => existsSync(p))
const browser = await chromium.launch({ executablePath, headless: true })

const results = []
const pass = (m) => results.push({ ok: true, m })
const fail = (m) => results.push({ ok: false, m })

const manifest = JSON.parse(readFileSync('blog-preview/manifest.json', 'utf8'))
const longPost = manifest.pages.find((p) => p === 'post-best-ecommerce-seo-agencies-scale-your-store.html') ?? manifest.pages.find((p) => p.startsWith('post-'))
const SAMPLE = [
  { file: 'index.html', type: 'index' },
  { file: 'page-2.html', type: 'index' },
  { file: 'category-seo.html', type: 'category' },
  { file: 'category-seo-page-2.html', type: 'category' },
  { file: longPost, type: 'post' },
  { file: 'post-legiit-updates-8-28-2018.html', type: 'post' },
  { file: 'buyers-guides.html', type: 'category' },
  { file: 'search.html', type: 'search' },
  { file: 'archive-2026.html', type: 'archive' },
  { file: 'author-amit.html', type: 'author' },
].filter((s) => manifest.pages.includes(s.file))

for (const [width, height] of [
  [360, 640],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
]) {
  for (const sample of SAMPLE) {
    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      // Old posts reference images that no longer exist; those 401/404s are the content's, not the page's.
      if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text())
    })
    await page.goto(`${base}/${sample.file}`, { waitUntil: 'load' })
    const tag = `${width} ${sample.file.replace(/\.html$/, '')}`

    const m = await page.evaluate(() => {
      const rect = (el) => el.getBoundingClientRect()
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => ({ level: Number(h.tagName[1]), text: h.textContent.trim().replace(/\s+/g, ' ') }))
      const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => {
        try {
          return JSON.parse(s.textContent)
        } catch {
          return { '@type': 'INVALID' }
        }
      })
      // Phones and tablets get a breadcrumb list above the title; the blog home has only the footer breadcrumb (logo, then the trail).
      const crumbNav = document.querySelector('nav[aria-label="Breadcrumb"]')
      const crumbs = crumbNav ? Array.from(crumbNav.querySelectorAll('li')) : Array.from(document.querySelectorAll('.foot-crumbs > a, .foot-crumbs > span:not(.sep)'))
      const crumbLast = crumbs[crumbs.length - 1]
      const content = document.getElementById('post-content')
      const toc = Array.from(document.querySelectorAll('.rail .toc-link, .toc-mobile .toc-link')).map((a) => a.hash.slice(1))
      const buttonLabels = Array.from(document.querySelectorAll('button, .btn-main, .btn-ghost, a[data-cta], .rte-call-action-button'))
        .filter((el) => el.offsetParent !== null)
        .map((el) => el.innerText.trim().replace(/\s+/g, ' '))
        .filter(Boolean)
      // Buttons and calls to action are 44px targets. Text links in the bars, sidebar, rail, lists and cards follow the
      // text, so they meet the 24px WCAG 2.2 AA minimum instead. Inline links inside a paragraph are exempt.
      const targets = Array.from(document.querySelectorAll('a[href], button, summary')).filter((el) => el.offsetParent !== null && !el.classList.contains('sr-only') && !el.closest('.post-content') && getComputedStyle(el).display !== 'inline')
      const box = (el) => ({ t: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30), h: Math.round(rect(el).height), w: Math.round(rect(el).width) })
      const isButton = (el) => (el.tagName === 'BUTTON' && !el.classList.contains('share-copy')) || el.matches('.btn-main, .btn-ghost, .pathway-actions a, .rte-call-action-button, .pager-num, .pager-step, .seg-item, .gbar-login, .sbar-menu > summary')
      const small = targets.map((el) => ({ el, b: box(el) })).filter(({ el, b }) => (isButton(el) ? b.h < 44 || b.w < 44 : b.h < 24 || b.w < 24)).map(({ b }) => b)
      return {
        sw: document.documentElement.scrollWidth,
        iw: window.innerWidth,
        title: document.title,
        desc: document.querySelector('meta[name="description"]')?.content ?? '',
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? '',
        robots: document.querySelector('meta[name="robots"]')?.content ?? '',
        ogType: document.querySelector('meta[property="og:type"]')?.content ?? '',
        ogImage: document.querySelector('meta[property="og:image"]')?.content ?? '',
        headings,
        h1Count: headings.filter((h) => h.level === 1).length,
        ldTypes: ld.map((x) => x['@type']),
        breadcrumbLd: ld.find((x) => x['@type'] === 'BreadcrumbList'),
        posting: ld.find((x) => x['@type'] === 'BlogPosting'),
        crumbCount: crumbs.length,
        crumbLastIsText: !!crumbLast && !crumbLast.querySelector('a') && crumbLast.tagName !== 'A' && (!crumbNav || !!crumbLast.querySelector('[aria-current="page"]')),
        postRows: document.querySelectorAll('.post-list li').length,
        contentH1: content ? content.querySelectorAll('h1').length : 0,
        contentH2: content ? content.querySelectorAll('h2').length : 0,
        contentNewTabInternal: content ? Array.from(content.querySelectorAll('a[target="_blank"]')).filter((a) => /legiit\.com/.test(a.href)).length : 0,
        unwrappedTables: content ? Array.from(content.querySelectorAll('table')).filter((t) => !t.parentElement.classList.contains('table-scroll')).length : 0,
        toc,
        tocMissing: toc.filter((id) => !document.getElementById(id)),
        inlineCta: !!document.querySelector('.post-content [data-cta-placement="post-inline"]'),
        heroLazy: document.querySelector('figure.post-hero img')?.loading ?? 'none',
        heroFetch: document.querySelector('figure.post-hero img')?.getAttribute('fetchpriority') ?? 'none',
        cardImgs: Array.from(document.querySelectorAll('.vgrid-media img, .tile-media img, .story-media img, .videos img')).map((i) => i.loading),
        featuredEager: !document.querySelector('.hero-row img') || document.querySelector('.hero-row img').loading !== 'lazy',
        contentWords: content ? content.innerText.split(/\s+/).filter(Boolean).length : 0,
        imgsNoAlt: Array.from(document.querySelectorAll('img')).filter((i) => !i.hasAttribute('alt') && !i.closest('.post-content')).length,
        contentImgsNoAlt: content ? Array.from(content.querySelectorAll('img')).filter((i) => !i.hasAttribute('alt')).length : 0,
        pagination: Array.from(document.querySelectorAll('nav[aria-label="Pagination"] a')).map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href'), rel: a.rel })),
        relPrev: document.querySelector('link[rel="prev"]')?.href ?? '',
        relNext: document.querySelector('link[rel="next"]')?.href ?? '',
        badLabels: buttonLabels.filter((t) => !/^[A-Z0-9]/.test(t) || (t.length > 3 && t === t.toUpperCase())),
        small,
        timeCount: document.querySelectorAll('time[datetime]').length,
        bodyTime: document.querySelector('article time[datetime]')?.getAttribute('datetime') ?? '',
      }
    })

    m.sw <= m.iw ? pass(`${tag}: no horizontal overflow`) : fail(`${tag}: overflow ${m.sw} > ${m.iw}`)
    m.h1Count === 1 ? pass(`${tag}: one h1`) : fail(`${tag}: ${m.h1Count} h1 elements`)
    const skips = m.headings.filter((h, i) => i > 0 && h.level > m.headings[i - 1].level + 1)
    skips.length === 0 ? pass(`${tag}: heading levels never skip`) : fail(`${tag}: heading skips ${JSON.stringify(skips.slice(0, 3))}`)
    m.title.length > 0 && m.desc.length > 0 ? pass(`${tag}: title and meta description present`) : fail(`${tag}: title "${m.title}" / description "${m.desc}"`)
    const canonicalOk = /^https:\/\/legiit\.com\//.test(m.canonical)
    canonicalOk ? pass(`${tag}: canonical is a production URL`) : fail(`${tag}: canonical ${m.canonical}`)
    !m.ldTypes.includes('INVALID') && m.ldTypes.includes('BreadcrumbList') ? pass(`${tag}: JSON-LD parses and includes BreadcrumbList`) : fail(`${tag}: JSON-LD ${JSON.stringify(m.ldTypes)}`)
    m.breadcrumbLd && m.breadcrumbLd.itemListElement.length === m.crumbCount ? pass(`${tag}: BreadcrumbList matches the ${m.crumbCount} visible breadcrumb items`) : fail(`${tag}: breadcrumb items ${m.crumbCount} vs JSON-LD ${m.breadcrumbLd?.itemListElement?.length}`)
    m.crumbLastIsText ? pass(`${tag}: current page is plain text in the breadcrumb`) : fail(`${tag}: last breadcrumb item is a link`)
    m.badLabels.length === 0 ? pass(`${tag}: every button label starts with a capital and is not all caps`) : fail(`${tag}: button labels ${JSON.stringify(m.badLabels)}`)
    m.small.length === 0 ? pass(`${tag}: buttons at least 44px, links at least 24px`) : fail(`${tag}: small targets ${JSON.stringify(m.small.slice(0, 5))}`)
    m.imgsNoAlt === 0 ? pass(`${tag}: every template image has an alt attribute`) : fail(`${tag}: ${m.imgsNoAlt} template images without alt`)
    errors.length === 0 ? pass(`${tag}: no console errors`) : fail(`${tag}: console errors ${errors.join(' | ').slice(0, 200)}`)

    if (sample.type === 'post') {
      m.ogType === 'article' && m.posting ? pass(`${tag}: og:type article and BlogPosting JSON-LD`) : fail(`${tag}: og:type ${m.ogType}, BlogPosting ${!!m.posting}`)
      m.posting && m.posting.headline && m.posting.datePublished && m.posting.author?.name ? pass(`${tag}: BlogPosting has headline, datePublished and author`) : fail(`${tag}: BlogPosting fields ${JSON.stringify(m.posting)}`)
      m.contentH1 === 0 ? pass(`${tag}: no h1 inside the body`) : fail(`${tag}: ${m.contentH1} h1 inside the body`)
      m.contentNewTabInternal === 0 ? pass(`${tag}: no internal links open in a new tab`) : fail(`${tag}: ${m.contentNewTabInternal} internal links with target=_blank`)
      m.unwrappedTables === 0 ? pass(`${tag}: every table scrolls inside a wrapper`) : fail(`${tag}: ${m.unwrappedTables} unwrapped tables`)
      m.tocMissing.length === 0 ? pass(`${tag}: every table-of-contents link resolves (${m.toc.length / 2} entries)`) : fail(`${tag}: TOC targets missing ${JSON.stringify(m.tocMissing)}`)
      const wantsCta = m.contentH2 >= 3 && m.contentWords >= 700
      const noCta = m.contentH2 < 3 || m.contentWords < 600
      ;(m.inlineCta ? !noCta : !wantsCta) ? pass(`${tag}: inline CTA ${m.inlineCta ? 'present' : 'absent'} for ${m.contentH2} H2s and ${m.contentWords} words`) : fail(`${tag}: inline CTA ${m.inlineCta} with ${m.contentH2} H2s and ${m.contentWords} words`)
      m.heroLazy === 'none' || (m.heroLazy !== 'lazy' && m.heroFetch === 'high') ? pass(`${tag}: hero image is eager`) : fail(`${tag}: hero loading=${m.heroLazy} fetchpriority=${m.heroFetch}`)
      m.bodyTime ? pass(`${tag}: published date uses <time datetime>`) : fail(`${tag}: no <time datetime> in the article`)
      if (m.contentImgsNoAlt) console.log(`note ${tag}: ${m.contentImgsNoAlt} body images without alt (CMS content)`)
    }
    if (sample.type === 'index' || sample.type === 'category') {
      // Page 1 is cards with images; pages 2 and up are a plain list of posts, like Apple's archive pages.
      if (/page-\d/.test(sample.file)) m.postRows >= 10 && m.cardImgs.length === 0 ? pass(`${tag}: list page shows ${m.postRows} posts`) : fail(`${tag}: list page has ${m.postRows} rows and ${m.cardImgs.length} card images`)
      else m.cardImgs.length > 0 && m.cardImgs.every((l) => l === 'lazy') && m.featuredEager ? pass(`${tag}: ${m.cardImgs.length} card images lazy-load, featured image eager`) : fail(`${tag}: card image loading ${JSON.stringify(m.cardImgs.slice(0, 4))}, featured eager ${m.featuredEager}`)
      const nums = m.pagination.filter((p) => /^\d+$/.test(p.text))
      nums.length >= 3 && nums.every((p) => p.href && /\.html$/.test(p.href)) ? pass(`${tag}: numbered pagination with real links (${nums.length} pages shown)`) : fail(`${tag}: pagination ${JSON.stringify(m.pagination.slice(0, 4))}`)
      if (/page-2/.test(sample.file)) m.relPrev && m.relNext ? pass(`${tag}: rel prev and next set`) : fail(`${tag}: rel prev "${m.relPrev}" next "${m.relNext}"`)
    }
    if (sample.type === 'search') {
      /noindex/.test(m.robots) ? pass(`${tag}: search results are noindex`) : fail(`${tag}: search robots "${m.robots}"`)
    }
    if (sample.type === 'archive') {
      m.timeCount >= 20 ? pass(`${tag}: archive lists dated posts (${m.timeCount})`) : fail(`${tag}: archive has ${m.timeCount} dated entries`)
    }

    if (width === 1440 || width === 390) {
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 40))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(500)
      await page.screenshot({ path: `${outDir}/blog-${sample.file.replace(/\.html$/, '')}-${width}.png`, fullPage: true })
    }
    await context.close()
  }
}

// Every internal link on every generated page must resolve.
{
  const files = readdirSync('blog-preview').filter((f) => f.endsWith('.html'))
  const links = new Set()
  for (const f of files) {
    const html = readFileSync(`blog-preview/${f}`, 'utf8')
    for (const m of html.matchAll(/href="([^"#?:]+\.html)(#[^"]*)?"/g)) links.add(m[1]) // relative links only; external sites are not checked
  }
  const missing = [...links].filter((l) => !existsSync(`blog-preview/${l}`))
  missing.length === 0 ? pass(`links: all ${links.size} internal page links on ${files.length} pages resolve`) : fail(`links: ${missing.length} dead links, e.g. ${missing.slice(0, 5).join(', ')}`)
  // Anchors inside posts: table-of-contents targets exist in the same file.
  let badAnchors = 0
  for (const f of files.filter((f) => f.startsWith('post-'))) {
    const html = readFileSync(`blog-preview/${f}`, 'utf8')
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
    for (const m of html.matchAll(/class="toc-link[^"]*" href="#([^"]+)"/g)) if (!ids.has(m[1])) badAnchors++
    for (const m of html.matchAll(/href="#([^"]+)" class="toc-link/g)) if (!ids.has(m[1])) badAnchors++
  }
  badAnchors === 0 ? pass(`links: every table-of-contents anchor on every post resolves`) : fail(`links: ${badAnchors} table-of-contents anchors do not resolve`)
  // Stray "<" would make a page invalid HTML.
  let stray = 0
  for (const f of files) stray += (readFileSync(`blog-preview/${f}`, 'utf8').match(/<(?![a-zA-Z/!?])/g) || []).length
  stray === 0 ? pass('html: no stray "<" characters in any page') : fail(`html: ${stray} stray "<" characters`)
}

await browser.close()
const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.m}`)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
