/**
 * Renders the blog templates with Legiit's real posts into blog-preview/ (flat HTML files),
 * ready for `vite build --config vite.blog.config.mjs`.
 *
 *   node scripts/build-blog-preview.mjs [--feed path/to/blogs.xml]
 *
 * The feed is Legiit's own export (https://legiit.com/blogs.xml, about 29 MB). Without --feed the
 * script downloads it once into blog-preview/.cache/. The feed is treated as data: it is parsed as
 * text and never executed.
 *
 * Everything the CMS has to compute per post is done here in one place (processBody, excerpt,
 * reading time, table of contents, JSON-LD), so BLOG.md can point developers at the exact rules.
 */
import Handlebars from 'handlebars'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const argv = process.argv.slice(2)
const OUT = 'blog-preview'
const SAMPLE = 'blog/sample'
const TEMPLATES = 'blog/templates'
const PER_PAGE = 12
const PREVIEW_YEARS = ['2026']

const SITE = {
  name: 'Legiit',
  blogName: 'Legiit Blog',
  homeUrl: 'https://legiit.com',
  logo: '../src/assets/legiit-logo-128.png',
  trialUrl: 'https://legiit.com/subscription-purchase?plan=business_dashboard&billing=monthly',
  pricingUrl: 'https://legiit.com/pricing',
  marketplaceUrl: 'https://legiit.com/marketplace',
  coursesUrl: 'https://legiit.com/courses',
  supportUrl: 'https://legiit.freshdesk.com/support/home',
  signInUrl: 'https://legiit.com/sign-in',
  privacyUrl: 'https://legiit.com/privacy',
  termsUrl: 'https://legiit.com/terms',
  searchParam: 'search',
}

/** Production URL patterns the CMS should serve. The preview uses flat files instead (see previewUrl). */
const PROD = {
  index: 'https://legiit.com/blog',
  page: (n) => (n === 1 ? 'https://legiit.com/blog' : `https://legiit.com/blog/page/${n}`),
  category: (slug, n = 1) => `https://legiit.com/blog/category/${slug}${n > 1 ? `/page/${n}` : ''}`,
  post: (slug) => `https://legiit.com/blog/${slug}`,
  archive: (year) => `https://legiit.com/blog/archive/${year}`,
  author: (slug, n = 1) => `https://legiit.com/blog/author/${slug}${n > 1 ? `/page/${n}` : ''}`,
  search: (q) => `https://legiit.com/blogs${q ? `?search=${encodeURIComponent(q)}` : ''}`,
  topics: 'https://legiit.com/blog#topics',
}
const previewUrl = {
  index: 'index.html',
  page: (n) => (n === 1 ? 'index.html' : `page-${n}.html`),
  category: (slug, n = 1) => `category-${slug}${n > 1 ? `-page-${n}` : ''}.html`,
  post: (slug) => `post-${slug}.html`,
  archive: (year) => `archive-${year}.html`,
  author: (slug, n = 1) => `author-${slug}${n > 1 ? `-page-${n}` : ''}.html`,
  search: 'search.html',
  topics: 'index.html#topics',
}

const read = (p) => readFileSync(p, 'utf8')
const json = (p) => JSON.parse(read(p))

// ---------- Feed ----------

function feedPath() {
  const i = argv.indexOf('--feed')
  if (i >= 0 && argv[i + 1]) return argv[i + 1]
  const cached = join(OUT, '.cache', 'blogs.xml')
  if (!existsSync(cached)) {
    mkdirSync(join(OUT, '.cache'), { recursive: true })
    console.log('Downloading https://legiit.com/blogs.xml (about 29 MB)...')
    execFileSync('curl', ['-sS', '--max-time', '300', '-o', cached, 'https://legiit.com/blogs.xml'], { stdio: 'inherit' })
  }
  return cached
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#8217': '’', '#8216': '‘', '#8220': '“', '#8221': '”', '#8211': '–', '#8212': '—', '#038': '&' }
const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e in ENTITIES) return ENTITIES[e]
    if (/^#x/i.test(e)) return String.fromCodePoint(parseInt(e.slice(2), 16))
    if (/^#/.test(e)) return String.fromCodePoint(parseInt(e.slice(1), 10))
    return m
  })
const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const slugify = (s) =>
  decode(s)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function parseFeed(xml) {
  const re = /<item>\s*<creator>([\s\S]*?)<\/creator>\s*<title>([\s\S]*?)<\/title>\s*<link>([\s\S]*?)<\/link>\s*<pubDate>([\s\S]*?)<\/pubDate>\s*<category>([\s\S]*?)<\/category>\s*<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/g
  const posts = []
  const seen = new Set()
  for (const m of xml.matchAll(re)) {
    const [, creator, title, link, pubDate, categoryXml, body] = m
    const slug = link.trim().split('/blog/')[1]?.replace(/\/+$/, '')
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    const categories = [...categoryXml.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((x) => decode(x[1].trim())).filter(Boolean)
    posts.push({ slug, title: decode(title.trim()), creator: decode(creator.trim()), publishedISO: pubDate.trim().slice(0, 10), categories, rawBody: body })
  }
  posts.sort((a, b) => (a.publishedISO < b.publishedISO ? 1 : a.publishedISO > b.publishedISO ? -1 : a.slug.localeCompare(b.slug)))
  return posts
}

// ---------- Derived data ----------

const monthLong = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const monthShort = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const fmt = (f, iso) => f.format(new Date(`${iso}T00:00:00Z`))

function excerptOf(html) {
  for (const m of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = decode(strip(m[1]))
    if (text.length >= 60) return truncate(text, 170)
  }
  return truncate(decode(strip(html)), 170)
}
function truncate(text, max) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 60)).replace(/[,;:]$/, '')}...`
}

/**
 * Normalises editor HTML and builds the table of contents. The CMS should apply the same rules
 * at render time (or at save time). Rules:
 *  0. Escape any "<" that does not start a tag (for example "<20%"), so the page stays valid HTML.
 *  1. Remove "<!--more-->" markers, line breaks at the start or end of a block or between blocks
 *     (they only add blank space; 967 of 1,376 posts have them), then empty paragraphs and divs.
 *  2. Demote any H1 inside the body to H2: the page already has one H1, the title.
 *  3. Give every H2 and H3 a unique id made from its text, and list them for the table of contents.
 *  4. Strip font-family, font-size and line-height from inline styles (old editor output).
 *  5. Images: drop inline styles, add loading="lazy" and decoding="async".
 *  6. Links to legiit.com open in the same tab; external links with target="_blank" get rel="noopener".
 *  7. Editor call-to-action buttons (.rte-call-action-*) lose their inline styles; blog.css restyles them.
 *  8. Tables are wrapped in <div class="table-scroll"> so wide tables scroll instead of breaking the page.
 *  9. In posts of 600+ words with at least three H2s, a contextual call to action is inserted before the third H2.
 */
function processBody(html, ctaHtml) {
  let s = html
  // A "<" that does not start a tag (for example "<20%") must be escaped, or the page is invalid HTML.
  s = s.replace(/<(?![a-zA-Z/!?])/g, '&lt;')
  s = s.replace(/<!--more-->/g, '')
  const BLOCK = 'p|div|h[1-6]|li|td|th|blockquote|figcaption|figure|ul|ol|table|section|pre'
  s = s.replace(new RegExp(`(?:\\s*<br\\b[^>]*>)+(?=\\s*<\\/?(?:${BLOCK})\\b)`, 'gi'), '')
  s = s.replace(new RegExp(`(<\\/?(?:${BLOCK})\\b[^>]*>)(?:\\s*<br\\b[^>]*>)+`, 'gi'), '$1')
  s = s.replace(/^(\s*<br\b[^>]*>)+|(<br\b[^>]*>\s*)+$/gi, '')
  s = s.replace(/<p\b[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
  s = s.replace(/<div\b[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/div>/gi, '')
  s = s.replace(/<h1(\s[^>]*)?>/gi, (m, a = '') => `<h2${a}>`).replace(/<\/h1>/gi, '</h2>')
  s = s.replace(/\sstyle="([^"]*)"/gi, (m, css) => {
    const kept = css
      .split(';')
      .map((x) => x.trim())
      .filter((x) => x && !/^(font-family|font-size|line-height|font)\s*:/i.test(x))
    return kept.length ? ` style="${kept.join('; ')}"` : ''
  })
  const used = new Set()
  const toc = []
  s = s.replace(/<(h2|h3)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (m, tag, attrs = '', inner) => {
    const text = decode(strip(inner))
    if (!text) return m
    const base = slugify(text) || 'section'
    let id = base
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    const entry = { id, text, children: [] }
    if (tag.toLowerCase() === 'h2' || !toc.length) toc.push(entry)
    else toc[toc.length - 1].children.push(entry)
    return `<${tag} id="${id}"${attrs.replace(/\sid="[^"]*"/i, '')}>${inner}</${tag}>`
  })
  s = s.replace(/<img\b([^>]*?)\/?>/gi, (m, attrs) => {
    let a = attrs.replace(/\sstyle="[^"]*"/gi, '').replace(/\s+$/, '')
    if (!/\sloading=/i.test(a)) a += ' loading="lazy"'
    if (!/\sdecoding=/i.test(a)) a += ' decoding="async"'
    return `<img${a} />`
  })
  s = s.replace(/<a\b([^>]*)>/gi, (m, attrs) => {
    const href = (attrs.match(/href="([^"]*)"/i) || [])[1] || ''
    let a = attrs
    const internal = /^(https?:\/\/(www\.)?legiit\.com|\/|#)/i.test(href)
    if (internal) a = a.replace(/\starget="[^"]*"/gi, '').replace(/\srel="[^"]*"/gi, '')
    else if (/target="_blank"/i.test(a) && !/\srel=/i.test(a)) a += ' rel="noopener"'
    return `<a${a.replace(/\s+/g, ' ')}>`
  })
  s = s.replace(/<(a|div|p|span)\b([^>]*class="[^"]*rte-call-action[^"]*"[^>]*)>/gi, (m, tag, attrs) => `<${tag}${attrs.replace(/\sstyle="[^"]*"/gi, '')}>`)
  s = s.replace(/<table\b[\s\S]*?<\/table>/gi, (m) => `<div class="table-scroll">${m}</div>`)
  if (ctaHtml) {
    const h2s = [...s.matchAll(/<h2\b/gi)].map((x) => x.index)
    if (h2s.length >= 3) s = s.slice(0, h2s[2]) + ctaHtml + s.slice(h2s[2])
  }
  return { html: s.trim(), toc }
}

// ---------- Handlebars ----------

Handlebars.registerHelper('json', (v) => JSON.stringify(v))
for (const f of readdirSync(join(TEMPLATES, 'partials'))) Handlebars.registerPartial(basename(f, '.hbs'), read(join(TEMPLATES, 'partials', f)))
const layout = Handlebars.compile(read(join(TEMPLATES, 'layouts', 'base.hbs')))
const page = Object.fromEntries(['index', 'category', 'post', 'search', 'archive', 'author'].map((n) => [n, Handlebars.compile(read(join(TEMPLATES, `${n}.hbs`)))]))
const ctaBox = Handlebars.compile(read(join(TEMPLATES, 'partials', 'cta-box.hbs')))

// ---------- Build ----------

const ctas = json(join(SAMPLE, 'ctas.json'))
const authorsById = json(join(SAMPLE, 'authors.json'))
const images = json(join(SAMPLE, 'images.json')).images
const seoMeta = json(join(SAMPLE, 'seo-meta.json'))

const allPosts = parseFeed(read(feedPath()))
console.log(`Feed: ${allPosts.length} posts`)

const categoryBySlug = new Map()
for (const p of allPosts) {
  for (const name of p.categories) {
    const slug = slugify(name)
    const c = categoryBySlug.get(slug) || { slug, name, count: 0 }
    c.count++
    categoryBySlug.set(slug, c)
  }
}
const categories = [...categoryBySlug.values()].sort((a, b) => b.count - a.count)
const categoryUrl = (slug) => previewUrl.category(slug)

const authorRecord = (creator) => {
  const a = authorsById[creator] || { name: creator, slug: slugify(creator), url: '', avatar: '', role: 'Writer', bio: '' }
  return { ...a, initial: a.name.slice(0, 1).toUpperCase(), pageUrl: previewUrl.author(a.slug), pageUrlProd: PROD.author(a.slug) }
}

function enrich(p) {
  const primary = categoryBySlug.get(slugify(p.categories[0] || 'Business')) || categories[0]
  const words = strip(p.rawBody).split(' ').filter(Boolean).length
  const meta = seoMeta[p.slug] || {}
  const img = images[p.slug]
  const image = img ? { ...img, alt: '' } : null
  return {
    ...p,
    url: previewUrl.post(p.slug),
    prodUrl: PROD.post(p.slug),
    category: { name: primary.name, slug: primary.slug, url: categoryUrl(primary.slug), prodUrl: PROD.category(primary.slug) },
    words,
    readingMinutes: Math.max(1, Math.round(words / 238)),
    excerpt: excerptOf(p.rawBody),
    seoTitle: meta.seoTitle || `${p.title} | Legiit`,
    description: meta.description || excerptOf(p.rawBody),
    publishedText: fmt(monthLong, p.publishedISO),
    publishedShort: fmt(monthShort, p.publishedISO),
    image,
    author: authorRecord(p.creator),
  }
}
const posts = allPosts.map(enrich)
const bySlug = new Map(posts.map((p) => [p.slug, p]))

// Which posts get their own preview page: this year's posts plus everything a generated listing links to.
const generated = new Set(posts.filter((p) => PREVIEW_YEARS.includes(p.publishedISO.slice(0, 4))).map((p) => p.slug))
const listingsNeed = []

const BAND = {
  title: 'Need it done, not just explained?',
  body: 'Hire a reviewed freelancer on the Legiit marketplace, or run your business from one dashboard with Command Center.',
  primaryLabel: 'Browse The Marketplace',
  primaryUrl: SITE.marketplaceUrl,
  secondaryLabel: 'Start My 7-Day Free Trial',
  secondaryUrl: SITE.trialUrl,
}
const ctaFor = (slug) => ctas.byCategory[slug] || ctas.default

const navFor = (activeSlug) => ({
  primaryTopics: categories.slice(0, 3).map((c) => ({ name: c.name, url: categoryUrl(c.slug) })),
  footerTopics: categories.slice(0, 6).map((c) => ({ name: c.name, url: categoryUrl(c.slug) })),
  topics: categories.map((c) => ({ name: c.name, url: categoryUrl(c.slug), count: c.count, active: c.slug === activeSlug })),
  allActive: activeSlug === 'all',
})

function paginationFor(current, total, urlFor) {
  if (total <= 1) return null
  const wanted = new Set([1, 2, total - 1, total, current - 1, current, current + 1].filter((n) => n >= 1 && n <= total))
  const items = []
  let last = 0
  for (const n of [...wanted].sort((a, b) => a - b)) {
    if (n - last > 1) items.push({ gap: true })
    items.push({ n, url: urlFor(n), current: n === current })
    last = n
  }
  return { current, total, items, prevUrl: current > 1 ? urlFor(current - 1) : '', nextUrl: current < total ? urlFor(current + 1) : '' }
}

const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, ...(it.prodUrl ? { item: it.prodUrl } : {}) })),
})
const HOME = { name: 'Home', url: SITE.homeUrl, prodUrl: SITE.homeUrl }
const BLOG = { name: 'Blog', url: previewUrl.index, prodUrl: PROD.index }

mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) if (f.endsWith('.html')) rmSync(join(OUT, f))
const manifest = []
function write(name, html) {
  writeFileSync(join(OUT, name), html)
  manifest.push(name)
}
function render(template, ctx, name) {
  const body = page[template](ctx)
  write(name, layout({ ...ctx, body }))
}
const years = [...new Set(posts.map((p) => p.publishedISO.slice(0, 4)))].sort().reverse()
// Templates get plain URL strings. "Archive" links (header, footer, index) open the newest year.
const common = { site: SITE, url: { index: previewUrl.index, archive: previewUrl.archive(years[0]), search: previewUrl.search, topics: previewUrl.topics } }

// Index pages
const indexTotal = Math.ceil((posts.length - 1) / PER_PAGE)
const indexPages = [1, 2, 3, indexTotal - 1, indexTotal]
for (const n of indexPages) {
  const start = 1 + (n - 1) * PER_PAGE
  const slice = posts.slice(start, start + PER_PAGE)
  listingsNeed.push(...slice.map((p) => p.slug))
  const crumbs = n === 1 ? [HOME, { name: 'Blog' }] : [HOME, BLOG, { name: `Page ${n}` }]
  render(
    'index',
    {
      ...common,
      nav: navFor('all'),
      page: {
        title: n === 1 ? 'Legiit Blog: SEO, Marketing And Business Growth Guides' : `Legiit Blog, page ${n}`,
        description: 'Practical guides on SEO, marketing, freelancing and running a business, from the Legiit marketplace. New posts every week.',
        canonical: PROD.page(n),
        ogType: 'website',
        prevUrl: n > 1 ? PROD.page(n - 1) : '',
        nextUrl: n < indexTotal ? PROD.page(n + 1) : '',
        breadcrumbs: crumbs,
        jsonld: [{ '@context': 'https://schema.org', '@type': 'Blog', name: 'Legiit Blog', url: PROD.index, description: 'Guides on SEO, marketing, freelancing and running a business from the Legiit marketplace.', publisher: { '@type': 'Organization', name: 'Legiit', url: SITE.homeUrl } }, breadcrumbLd(crumbs)],
      },
      index: {
        h1Line1: 'The Legiit Blog',
        h1Line2: n === 1 ? 'Guides To Grow Your Business' : `Page ${n}`,
        intro: 'Practical guides on SEO, marketing, freelancing and running a business, written by the people who sell those services.',
        postCount: posts.length.toLocaleString('en-US'),
        featured: n === 1 ? posts[0] : null,
        posts: slice,
        gridTitle: n === 1 ? 'Latest posts' : `Posts, page ${n} of ${indexTotal}`,
        pagination: paginationFor(n, indexTotal, previewUrl.page),
        topics: categories.map((c) => ({ name: c.name, url: categoryUrl(c.slug), count: c.count })),
        band: BAND,
      },
    },
    previewUrl.page(n),
  )
}
listingsNeed.push(posts[0].slug)

// Category pages (page 1 of every topic, page 2 of the largest)
for (const c of categories) {
  const inCat = posts.filter((p) => p.categories.some((n) => slugify(n) === c.slug))
  const total = Math.ceil(inCat.length / PER_PAGE)
  const pagesToBuild = c === categories[0] ? [1, 2] : [1]
  for (const n of pagesToBuild) {
    const slice = inCat.slice((n - 1) * PER_PAGE, n * PER_PAGE)
    listingsNeed.push(...slice.map((p) => p.slug))
    const crumbs = n === 1 ? [HOME, BLOG, { name: c.name }] : [HOME, BLOG, { name: c.name, url: categoryUrl(c.slug), prodUrl: PROD.category(c.slug) }, { name: `Page ${n}` }]
    render(
      'category',
      {
        ...common,
        nav: navFor(c.slug),
        page: {
          title: `${c.name} Articles${n > 1 ? `, page ${n}` : ''} | Legiit Blog`,
          description: `${c.count} posts on ${c.name.toLowerCase()} from the Legiit blog: guides, comparisons and case studies, newest first.`,
          canonical: PROD.category(c.slug, n),
          ogType: 'website',
          prevUrl: n > 1 ? PROD.category(c.slug, n - 1) : '',
          nextUrl: n < total ? PROD.category(c.slug, n + 1) : '',
          breadcrumbs: crumbs,
          jsonld: [breadcrumbLd(crumbs)],
        },
        category: { name: c.name, count: c.count, description: '', posts: slice, pagination: paginationFor(n, total, (k) => previewUrl.category(c.slug, k)), cta: ctaFor(c.slug), band: BAND },
      },
      previewUrl.category(c.slug, n),
    )
  }
}

// Search (sample query)
{
  const q = 'local seo'
  const hits = posts.filter((p) => p.title.toLowerCase().includes(q) || strip(p.rawBody).toLowerCase().includes(q))
  const slice = hits.filter((p) => generated.has(p.slug)).slice(0, PER_PAGE)
  listingsNeed.push(...slice.map((p) => p.slug))
  const crumbs = [HOME, BLOG, { name: 'Search' }]
  render(
    'search',
    {
      ...common,
      nav: navFor(''),
      page: { title: `Search results for “${q}” | Legiit Blog`, description: `Blog posts matching “${q}”.`, canonical: PROD.search(''), ogType: 'website', robots: 'noindex, follow', breadcrumbs: crumbs, jsonld: [breadcrumbLd(crumbs)] },
      search: { query: q, total: hits.length, postCount: posts.length.toLocaleString('en-US'), posts: slice, pagination: paginationFor(1, Math.ceil(hits.length / PER_PAGE), (k) => `${previewUrl.search}#page-${k}`), band: BAND },
    },
    previewUrl.search,
  )
}

// Archive: one page per year, every post listed by month
for (const y of years) {
  const inYear = posts.filter((p) => p.publishedISO.startsWith(y))
  const months = []
  for (const p of inYear) {
    const key = p.publishedISO.slice(0, 7)
    let m = months.find((x) => x.key === key)
    if (!m) months.push((m = { key, id: `m-${key}`, name: fmt(monthName, `${key}-01`), count: 0, posts: [] }))
    m.count++
    m.posts.push(p)
  }
  const crumbs = [HOME, BLOG, { name: `Archive ${y}` }]
  render(
    'archive',
    {
      ...common,
      nav: navFor(''),
      page: { title: `All ${y} posts | Legiit Blog`, description: `Every Legiit blog post published in ${y}, by month.`, canonical: PROD.archive(y), ogType: 'website', breadcrumbs: crumbs, jsonld: [breadcrumbLd(crumbs)] },
      archive: { year: y, count: inYear.length, years: years.map((yy) => ({ year: yy, count: posts.filter((p) => p.publishedISO.startsWith(yy)).length, url: previewUrl.archive(yy), active: yy === y })), months },
    },
    previewUrl.archive(y),
  )
}

// Author pages (page 1 for every author)
for (const creator of Object.keys(authorsById).filter((k) => !k.startsWith('_'))) {
  const a = authorRecord(creator)
  const mine = posts.filter((p) => p.creator === creator)
  if (!mine.length) continue
  const slice = mine.slice(0, PER_PAGE)
  listingsNeed.push(...slice.map((p) => p.slug))
  const crumbs = [HOME, BLOG, { name: a.name }]
  render(
    'author',
    {
      ...common,
      nav: navFor(''),
      page: { title: `Posts by ${a.name} | Legiit Blog`, description: `${mine.length} posts by ${a.name} on the Legiit blog.`, canonical: PROD.author(a.slug), ogType: 'profile', breadcrumbs: crumbs, jsonld: [{ '@context': 'https://schema.org', '@type': 'ProfilePage', mainEntity: { '@type': 'Person', name: a.name, ...(a.url ? { url: a.url } : {}) } }, breadcrumbLd(crumbs)] },
      author: { ...a, count: mine.length, posts: slice, pagination: paginationFor(1, Math.ceil(mine.length / PER_PAGE), (k) => previewUrl.author(a.slug, k)), band: BAND },
    },
    previewUrl.author(a.slug),
  )
}

// Post pages
const OLD_POST = 'legiit-updates-8-28-2018'
for (const s of [...listingsNeed, OLD_POST]) generated.add(s)
const generatedPosts = posts.filter((p) => generated.has(p.slug))
for (let i = 0; i < generatedPosts.length; i++) {
  const p = generatedPosts[i]
  const cta = ctaFor(p.category.slug)
  const longEnough = p.words >= 600 && (p.rawBody.match(/<h2\b/gi) || []).length >= 3
  const { html, toc } = processBody(p.rawBody, longEnough ? ctaBox({ cta, placement: 'post-inline' }) : '')
  const related = generatedPosts.filter((o) => o.slug !== p.slug && o.category.slug === p.category.slug).slice(0, 3)
  const newer = generatedPosts[i - 1]
  const older = generatedPosts[i + 1]
  const crumbs = [HOME, BLOG, { name: p.category.name, url: p.category.url, prodUrl: p.category.prodUrl }, { name: p.title }]
  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      ...(p.image ? { image: [p.image.src] } : {}),
      datePublished: p.publishedISO,
      dateModified: p.updatedISO || p.publishedISO,
      author: { '@type': 'Person', name: p.author.name, url: p.author.url || p.author.pageUrlProd },
      publisher: { '@type': 'Organization', name: 'Legiit', url: SITE.homeUrl },
      mainEntityOfPage: { '@type': 'WebPage', '@id': p.prodUrl },
      articleSection: p.category.name,
      wordCount: p.words,
      inLanguage: 'en',
    },
    breadcrumbLd(crumbs),
  ]
  const canonical = p.prodUrl
  render(
    'post',
    {
      ...common,
      nav: navFor(p.category.slug),
      page: { title: p.seoTitle, description: p.description, canonical, ogType: 'article', ogImage: p.image?.src || '', publishedISO: p.publishedISO, modifiedISO: p.updatedISO || '', breadcrumbs: crumbs, jsonld },
      post: {
        ...p,
        bodyHtml: html,
        toc,
        cta,
        band: BAND,
        related,
        prev: older ? { title: older.title, url: older.url } : null,
        next: newer ? { title: newer.title, url: newer.url } : null,
        share: {
          x: `https://x.com/intent/post?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(p.title)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`,
        },
        commentsNote: 'Comments are loaded by the CMS here.',
      },
    },
    previewUrl.post(p.slug),
  )
}

// Preview only: the sample cannot hold every page (the artifact host takes about 500 files), so links to
// pages outside the sample open one explanatory page instead of a 404. The CMS serves every page.
{
  const crumbs = [HOME, BLOG, { name: 'Not in this preview' }]
  const body = Handlebars.compile(`<div class="mx-auto w-full max-w-page px-4 pb-20 pt-6 sm:px-6 sm:pt-8 lg:px-8">
  {{> breadcrumbs breadcrumbs=page.breadcrumbs}}
  <div class="mt-10 max-w-2xl">
    <p class="eyebrow">Preview</p>
    <h1 class="mt-2 text-[2.375rem] font-semibold leading-[1.08] tracking-[-0.025em] text-ink sm:text-[2.75rem]">This Page Isn’t In The Preview</h1>
    <p class="mt-4 text-lg leading-relaxed text-ink-soft">The preview holds a sample of {{sampleCount}} pages built from real Legiit posts. On the live blog, every listing page, post and archive link opens normally.</p>
    <div class="mt-8 flex flex-wrap gap-3">
      <a href="{{url.index}}" class="btn-brand inline-flex min-h-[48px] items-center justify-center rounded-lg border border-transparent px-5 text-base font-semibold leading-none btn-focus">Back To The Blog</a>
      <a href="{{url.archive}}" class="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-line-strong bg-canvas px-5 text-base font-semibold leading-none text-ink hover:border-ink-muted btn-focus">Browse The Archive</a>
    </div>
  </div>
</div>`)
  const ctx = { ...common, nav: navFor(''), sampleCount: manifest.length + 1, page: { title: 'Not in this preview | Legiit Blog', description: 'This page is outside the preview sample.', robots: 'noindex, nofollow', ogType: 'website', breadcrumbs: crumbs, jsonld: [breadcrumbLd(crumbs)] } }
  write('not-in-preview.html', layout({ ...ctx, body: body(ctx) }))
  const built = new Set(manifest)
  let rewritten = 0
  for (const name of manifest) {
    const file = join(OUT, name)
    const html = read(file)
    const out = html.replace(/href="([^"#?:/]+\.html)(#[^"]*)?"/g, (m, target) => (built.has(target) ? m : (rewritten++, `href="not-in-preview.html" data-preview-target="${target}"`)))
    if (out !== html) writeFileSync(file, out)
  }
  console.log(`${rewritten} links point outside the sample and open not-in-preview.html`)
}

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ pages: manifest, posts: generatedPosts.length, categories: categories.length, totalPosts: posts.length }, null, 1))
console.log(`Wrote ${manifest.length} pages to ${OUT}/ (${generatedPosts.length} posts, ${categories.length} topics, ${posts.length} posts in the feed)`)
