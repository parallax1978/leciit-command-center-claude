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
 * Everything the CMS has to compute per post is done here in one place (processBody, splitIntro,
 * excerpt, reading time, table of contents, JSON-LD, goal hubs, tile art, buyer's guides), so
 * BLOG.md can point developers at the exact rules.
 */
import Handlebars from 'handlebars'
import { parseFragment, serialize } from 'parse5'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const argv = process.argv.slice(2)
const OUT = 'blog-preview'
const SAMPLE = 'blog/sample'
const TEMPLATES = 'blog/templates'
const PER_PAGE = 12

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
  registerUrl: 'https://legiit.com/register',
  seoCategoryUrl: 'https://legiit.com/categories/seo',
  socialCategoryUrl: 'https://legiit.com/categories/social-media-marketing',
  devCategoryUrl: 'https://legiit.com/categories/programming-technology',
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
  latest: 'https://legiit.com/blog#latest',
  guides: 'https://legiit.com/blog#buyers-guides',
  guidesAll: 'https://legiit.com/blog/buyers-guides',
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
  latest: 'index.html#latest',
  guides: 'index.html#buyers-guides',
  guidesAll: (n = 1) => `buyers-guides${n > 1 ? `-page-${n}` : ''}.html`,
}

const read = (p) => readFileSync(p, 'utf8')
const json = (p) => JSON.parse(read(p))

// ---------- Library structure ----------
// Goal hubs group the topics by what a reader wants to get done. They drive the sidebar topic tree,
// the hub sections on the blog home and the colour family of every tile. Each topic sits in one hub;
// a topic the list does not name joins "Run Your Business", so a new CMS category still appears.
// Tile colours are tints of the brand purple (#6A13CF) and magenta (#C71E92); `ink` is the darker
// shade used for the icon and the blueprint grid.
const HUBS = [
  {
    id: 'rank-higher-on-google',
    name: 'Rank higher on Google',
    icon: 'chart',
    description: 'Search guides, from link building and local SEO to audits and the tools that track rankings.',
    topics: ['seo', 'website', 'ecommerce', 'case-studies'],
    art: { from: '#9F7AEA', to: '#DA8CD2', ink: '#3F0C86' },
  },
  {
    id: 'win-more-clients',
    name: 'Win more clients',
    icon: 'people',
    description: 'For freelancers and agencies who sell services: platforms, partners and ways to get more orders.',
    topics: ['freelancing', 'agency', 'success-stories'],
    art: { from: '#E27BB9', to: '#F4AECD', ink: '#740E54' },
  },
  {
    id: 'grow-on-social',
    name: 'Grow on social',
    icon: 'megaphone',
    description: 'Social media marketing on LinkedIn, TikTok and beyond, plus affiliate marketing.',
    topics: ['social-media-marketing', 'linkedin', 'tiktok', 'affiliate-marketing'],
    art: { from: '#C47EDB', to: '#EEA6D3', ink: '#640F62' },
  },
  {
    id: 'run-your-business',
    name: 'Run your business',
    icon: 'dashboard',
    description: 'Outsourcing, virtual assistants, analytics and the everyday work of running a small business.',
    topics: ['business', 'growth', 'outsourcing', 'virtual-assistant', 'get-more-stuff-done'],
    art: { from: '#A88EEF', to: '#DCC6F8', ink: '#3A0B7C' },
  },
  {
    id: 'legiit-news',
    name: 'Legiit news',
    icon: 'news',
    description: 'Product updates, best-seller roundups and stories from the Legiit community.',
    topics: ['announcements', 'roundup', 'community', 'page'],
    art: { from: '#DDBAF3', to: '#F7CFE4', ink: '#5E127C' },
  },
]

/** Per topic: its line icon (a symbol in partials/art-defs.hbs), the tile gradient angle, and the lead on its topic page. */
const TOPIC = {
  seo: { icon: 'search', angle: 120, about: 'guides to ranking on Google, from link building and local SEO to keyword research and the agencies that do the work' },
  website: { icon: 'browser', angle: 160, about: 'guides to building, auditing and speeding up a business website' },
  ecommerce: { icon: 'bag', angle: 200, about: 'guides to selling online, from store SEO and site audits to AI product images' },
  'case-studies': { icon: 'chart', angle: 240, about: 'case studies from SEO campaigns, from local map rankings to link building tests' },
  freelancing: { icon: 'laptop', angle: 120, about: 'guides for freelancers, from finding first clients to selling services on Legiit' },
  agency: { icon: 'building', angle: 160, about: 'guides for agencies and the people who hire them, from white-label partners to agency shortlists' },
  'success-stories': { icon: 'trophy', angle: 200, about: 'stories from sellers who built a business on Legiit' },
  'social-media-marketing': { icon: 'share', angle: 120, about: 'guides to social media marketing, from content scheduling to AI tools and paid campaigns' },
  linkedin: { icon: 'briefcase', angle: 160, about: 'guides to LinkedIn marketing, from profile tips to cold messaging' },
  tiktok: { icon: 'music', angle: 200, about: 'guides to TikTok for business, from content ideas and ads to the algorithm' },
  'affiliate-marketing': { icon: 'link', angle: 240, about: 'guides to affiliate marketing, niche research and getting traffic to a site' },
  business: { icon: 'store', angle: 120, about: 'guides to running a small business, from marketing tools to analytics and AI' },
  growth: { icon: 'sprout', angle: 160, about: 'guides to growing a business, from analytics and audience building to online courses' },
  outsourcing: { icon: 'exchange', angle: 200, about: 'guides to outsourcing marketing work and comparing freelance marketplaces' },
  'virtual-assistant': { icon: 'headset', angle: 240, about: 'guides to hiring a virtual assistant and to working as one' },
  'get-more-stuff-done': { icon: 'check', angle: 280, about: 'posts on productivity and getting more done' },
  announcements: { icon: 'megaphone', angle: 120, about: 'posts on Legiit product updates, launches and best-selling services' },
  roundup: { icon: 'list', angle: 160, about: 'roundups of Legiit services, offers and SEO tips' },
  community: { icon: 'chat', angle: 200, about: 'posts for the Legiit community, from getting more orders to marketing ideas' },
  page: { icon: 'file', angle: 240, about: 'posts on getting started with Legiit, landing pages and on-page basics' },
}

/**
 * Each tile shows one line icon. A post's icon comes from the first rule its title matches, so a row
 * of posts from the same topic still reads as different subjects; otherwise it is the topic's icon.
 */
const ICON_RULES = [
  [/\b(vs\.?|versus|alternatives?|competitors?|compared|comparison|similar to|better than|like upwork)\b/i, 'scale'],
  [/youtube|\bvideos?\b/i, 'play'],
  [/\blocal\b|google maps|\bmaps?\b/i, 'pin'],
  [/dashboard|command center/i, 'dashboard'],
  [/rank tracking|analytics|\bdata\b|insights?|statistics|\broi\b|reporting/i, 'bars'],
  [/customer service|support|phone|\bcalls?\b/i, 'headset'],
  [/focus groups?|feedback|surveys?|audience/i, 'users'],
  [/copywrit|content|guest post|writ|blog/i, 'pen'],
  [/\bai\b|chat ?gpt|\bgpt\b|chatbots?/i, 'sparkles'],
  [/backlinks?|link building|\blinks?\b|\bpbns?\b|niche edits?/i, 'link'],
  [/e-?commerce|\bstores?\b|shopify|dropshipping|etsy|amazon/i, 'bag'],
  [/keyword/i, 'key'],
  [/schedul|calendar/i, 'calendar'],
  [/\bemails?\b|newsletter/i, 'mail'],
  [/audit|checker/i, 'clipboard'],
  [/white[ -]label|reseller/i, 'layers'],
  [/reddit|comments?|forums?|facebook groups?/i, 'chat'],
  [/best[ -]selling|roundup|top rated|of the year/i, 'trophy'],
  [/design|images?\b|photo|graphic|thumbnails?|brand/i, 'image'],
  [/courses?\b|learn|beginners?|training|skills?/i, 'cap'],
  [/speed|faster|quick/i, 'bolt'],
  [/\$|money|pric|cheap|deals?\b|coupons?|black friday|revenue|income|\bcosts?\b/i, 'tag'],
  [/platforms?|software|tools?\b|\bapps?\b/i, 'gear'],
  [/\bhire\b|hiring|freelancers?\b|assistants?\b/i, 'users'],
]

/** Buyer's guides wear the full brand gradient with white line art, so commercial posts read apart from the lighter learning tiles. */
const GUIDE_ART = { from: '#6A13CF', to: '#C71E92', ink: '#FFFFFF' }

/**
 * Buyer's guides: posts with commercial intent in the title (Best, Top, Alternatives, vs, Compared,
 * Review). Advice titles that merely contain those words, and Legiit's own news, are left out.
 */
const GUIDE_RX = /\b(best|top|alternatives?|vs\.?|versus|compared|comparison|reviews?)\b/i
const NOT_GUIDE_RX = /best practices|best time|best ways?\b|best types|best kept|tips|strategies|tactics|ideas|quotes|on top|in review|of the year/i
const NEWS_HUB = 'legiit-news'

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

/** Excerpts and meta descriptions: the first paragraph of 60+ characters, at most two sentences and 170 characters. */
function excerptOf(html) {
  for (const m of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = decode(strip(m[1]))
    if (text.length >= 60) return truncate(firstSentences(text), 170)
  }
  return truncate(firstSentences(decode(strip(html))), 170)
}
/** The text up to the end of its second sentence. Abbreviations such as "vs." and "e.g." do not end a sentence. */
function firstSentences(text, n = 2) {
  return text.slice(0, sentenceEnds(text)[n - 1] ?? text.length).trim()
}
function sentenceEnds(text) {
  const ends = []
  for (const m of text.matchAll(/[.!?]["”’)]*(?=\s+["“‘(]?[A-Z0-9])/g)) {
    if (/\b(vs|e\.g|i\.e|etc|approx|Mr|Mrs|Ms|Dr|St|No)\.$/i.test(text.slice(Math.max(0, m.index - 6), m.index + 1))) continue
    ends.push(m.index + m[0].length)
  }
  return ends
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
 *     (they only add blank space; 967 of 1,376 posts have them), then empty paragraphs and divs,
 *     including ones that hold only empty inline wrappers such as <div><em><span>&nbsp;</span></em></div>
 *     (59 posts). A block whose only text is "?" is an emoji the old editor lost, and goes too.
 *  2. Demote any H1 inside the body to H2: the page already has one H1, the title.
 *  3. Give every H2 and H3 a unique id made from its text, and list them for the table of contents.
 *  4. Strip font-family, font-size and line-height from inline styles (old editor output). Quoted
 *     font names (&quot;) are read as quotes first, so the declarations split cleanly.
 *  5. Images: drop inline styles, add loading="lazy" and decoding="async".
 *  6. Links to legiit.com open in the same tab; external links with target="_blank" get rel="noopener".
 *  7. Editor call-to-action buttons (.rte-call-action-*) lose their inline styles; blog.css restyles them.
 *  8. Tables are wrapped in <div class="table-scroll"> so they never widen the page. Tables of three or
 *     more columns also get the class table-scroll--stack and a data-label on every cell, taken from the
 *     header row, so phones show one card per row instead of a table that scrolls sideways (see wrapTable).
 * The topic's call to action is placed by the post template, right after the intro (see splitIntro).
 */
function processBody(html, groupTitle = 'The list') {
  // Some bodies in the feed are cut off inside a tag, and old ones carry unclosed or stray tags. Parsing and
  // serializing with the browser's own algorithm (parse5) gives well-formed HTML that every tool downstream accepts.
  html = serialize(parseFragment(html))
  let s = html
  // A "<" that does not start a tag (for example "<20%") must be escaped, or the page is invalid HTML.
  s = s.replace(/<(?![a-zA-Z/!?])/g, '&lt;')
  s = s.replace(/<!--more-->/g, '')
  const BLOCK = 'p|div|h[1-6]|li|td|th|blockquote|figcaption|figure|ul|ol|table|section|pre'
  const INLINE = '(?:span|em|strong|b|i|u|font)'
  s = s.replace(new RegExp(`(?:\\s*<br\\b[^>]*>)+(?=\\s*<\\/?(?:${BLOCK})\\b)`, 'gi'), '')
  s = s.replace(new RegExp(`(<\\/?(?:${BLOCK})\\b[^>]*>)(?:\\s|&nbsp;)*(?:<br\\b[^>]*>\\s*)+`, 'gi'), '$1')
  s = s.replace(/^(\s*<br\b[^>]*>)+|(<br\b[^>]*>\s*)+$/gi, '')
  s = s.replace(new RegExp(`<(p|div)\\b[^>]*>(?:\\s|<\\/?${INLINE}\\b[^>]*>)*\\?+(?:\\s|&nbsp;|<\\/?${INLINE}\\b[^>]*>)*<\\/\\1>`, 'gi'), '')
  // Blocks that hold only spaces, line breaks and empty inline wrappers; nested ones empty from the inside out.
  const EMPTY = new RegExp(`<(p|div)\\b[^>]*>(?:\\s|&nbsp;|<br\\s*\\/?>|<\\/?${INLINE}\\b[^>]*>)*<\\/\\1>`, 'gi')
  for (let pass = 0; pass < 3 && EMPTY.test(s); pass++) s = s.replace(EMPTY, '')
  s = s.replace(/<h1(\s[^>]*)?>/gi, (m, a = '') => `<h2${a}>`).replace(/<\/h1>/gi, '</h2>')
  s = s.replace(/\sstyle="([^"]*)"/gi, (m, css) => {
    const kept = css
      .replace(/&quot;/g, "'")
      .split(';')
      .map((x) => x.trim())
      .filter((x) => x && !/^(font-family|font-size|line-height|font)\s*:/i.test(x))
    return kept.length ? ` style="${kept.join('; ')}"` : ''
  })
  const used = new Set()
  const toc = []
  // Numbered items ("#1. Name", "2) Name") written as H2s are a list under one topic, so they become H3s
  // under one shared H2 ("Top N ..." from the post title, or "The list"), as the brand brief asks.
  const NUMBERED = /^\s*#?\s*(\d{1,2})[.):]\s+/
  const h2Texts = [...s.matchAll(/<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/gi)].map((m) => decode(strip(m[1])))
  const numbered = h2Texts.filter((t) => NUMBERED.test(t)).length
  const groupNumbered = numbered >= 3
  let groupOpen = false
  s = s.replace(/<(h2|h3)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (m, tag, attrs = '', inner) => {
    let text = decode(strip(inner))
    if (!text) return m
    let level = tag.toLowerCase()
    let prefix = ''
    if (groupNumbered && level === 'h2' && NUMBERED.test(text)) {
      if (!groupOpen) {
        groupOpen = true
        const gid = 'the-list'
        used.add(gid)
        toc.push({ id: gid, text: groupTitle, children: [] })
        prefix = `<h2 id="${gid}">${groupTitle}</h2>`
      }
      level = 'h3'
      text = text.replace(NUMBERED, '')
      inner = inner.replace(/^\s*(?:<[^>]+>\s*)*#?\s*\d{1,2}[.):]\s+/, (lead) => lead.replace(/#?\s*\d{1,2}[.):]\s+$/, ''))
    } else if (level === 'h2') groupOpen = false
    const base = slugify(text) || 'section'
    let id = base
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    const entry = { id, text, children: [] }
    if (level === 'h2' || !toc.length) toc.push(entry)
    else toc[toc.length - 1].children.push(entry)
    return `${prefix}<${level} id="${id}"${attrs.replace(/\sid="[^"]*"/i, '')}>${inner}</${level}>`
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
  s = s.replace(/<table\b[\s\S]*?<\/table>/gi, wrapTable)
  return { html: s.trim(), toc }
}

/**
 * Wraps one table. Two-column tables (most are label and value pairs) fit a phone as they are. Wider tables
 * get table-scroll--stack: on phones each row becomes a card, and every cell shows its column name from
 * the header row (a <thead>, a first row of <th>, or a first row whose cells are all bold) as a data-label.
 */
function wrapTable(table) {
  const cellsOf = (row) => [...row.matchAll(/<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => m[2])
  const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1])
  const columns = Math.max(0, ...rows.map((r) => cellsOf(r).length))
  if (columns < 3) return `<div class="table-scroll">${table}</div>`
  const head = cellsOf(rows[0] || '')
  const bold = (html) => /^\s*<(strong|b)\b[^>]*>[\s\S]*<\/\1>\s*$/i.test(html) || /^\s*<span\b[^>]*font-weight:\s*(bold|[6-9]00)\b[^>]*>[\s\S]*<\/span>\s*$/i.test(html)
  const hasHead = /<thead\b/i.test(table) || /<th\b/i.test(rows[0] || '') || (head.length > 0 && head.every(bold))
  const attr = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const labels = hasHead ? head.map((c) => attr(decode(strip(c)))) : []
  let index = 0
  const out = table.replace(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi, (m, attrs, inner) => {
    if (hasHead && index++ === 0) return `<tr${attrs} data-head>${inner}</tr>`
    let col = 0
    const cells = inner.replace(/<(td|th)\b([^>]*)>/gi, (c, tag, a) => (labels[col++] ? `<${tag}${a} data-label="${labels[col - 1]}">` : c))
    return `<tr${attrs}>${cells}</tr>`
  })
  return `<div class="table-scroll table-scroll--stack">${out}</div>`
}

/**
 * Splits a processed body into the three parts the post template places:
 *  - lead:  the opening paragraph, shown large under the H1 (like Apple's abstract), when it is plain
 *           text of 8 to 70 words in at most two sentences that does not just repeat the title.
 *           Otherwise there is no lead and the paragraph stays in the body.
 *  - intro: everything else before the first H2. The topic's call to action and the featured image
 *           follow it, so both sit after the intro and before the first H2.
 *  - body:  the rest, from the first H2 on (the whole body when there is no H2 or no intro).
 */
function splitIntro(html, title) {
  let rest = html.trim()
  let lead = ''
  const first = rest.match(/^<p\b[^>]*>([\s\S]*?)<\/p>/i)
  if (first) {
    const text = decode(strip(first[1]))
    const words = text.split(' ').filter(Boolean).length
    const repeatsTitle = slugify(text).startsWith(slugify(title).slice(0, 32))
    const sentences = sentenceEnds(text).length + 1
    if (words >= 8 && words <= 70 && sentences <= 2 && !repeatsTitle && !/<(img|iframe|video|table|ul|ol|div)\b/i.test(first[1])) {
      lead = first[1].trim()
      rest = rest.slice(first[0].length).trim()
    }
  }
  const h2 = rest.search(/<h2\b/i)
  if (h2 > 0) return { lead, intro: rest.slice(0, h2).trim(), body: rest.slice(h2).trim() }
  return { lead, intro: '', body: rest }
}

// ---------- Handlebars ----------

Handlebars.registerHelper('json', (v) => JSON.stringify(v).replace(/</g, '\\u003c'))
Handlebars.registerHelper('eq', (a, b) => a === b)
/** Separator for "A, B and C" lists: pass @index and the list length. */
Handlebars.registerHelper('andSep', (i, n) => (i >= n - 1 ? '' : i === n - 2 ? ' and ' : ', '))
for (const f of readdirSync(join(TEMPLATES, 'partials'))) Handlebars.registerPartial(basename(f, '.hbs'), read(join(TEMPLATES, 'partials', f)))
const layout = Handlebars.compile(read(join(TEMPLATES, 'layouts', 'base.hbs')))
const page = Object.fromEntries(['index', 'category', 'post', 'search', 'archive', 'author'].map((n) => [n, Handlebars.compile(read(join(TEMPLATES, `${n}.hbs`)))]))

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

const hubOf = new Map()
for (const h of HUBS) for (const t of h.topics) hubOf.set(t, h)
for (const c of categories) {
  if (hubOf.has(c.slug)) continue
  const fallback = HUBS.find((h) => h.id === 'run-your-business')
  fallback.topics.push(c.slug)
  hubOf.set(c.slug, fallback)
}
const topicInfo = (slug) => TOPIC[slug] || { icon: 'file', angle: 160, about: '' }

/** Tile art: the topic's gradient (hub colours, topic angle), or the brand gradient for a buyer's guide, and one line icon. */
function artFor(topicSlug, title = '', guide = false) {
  const hub = hubOf.get(topicSlug) || HUBS[0]
  const t = topicInfo(topicSlug)
  const rule = title ? ICON_RULES.find(([rx]) => rx.test(title)) : null
  const colors = guide ? GUIDE_ART : hub.art
  return { icon: rule ? rule[1] : t.icon, angle: t.angle, from: colors.from, to: colors.to, ink: colors.ink, guide }
}

const authorRecord = (creator) => {
  const a = authorsById[creator] || { name: creator, slug: slugify(creator), url: '', avatar: '', role: 'Writer', bio: '' }
  return { ...a, initial: a.name.slice(0, 1).toUpperCase(), pageUrl: previewUrl.author(a.slug), pageUrlProd: PROD.author(a.slug) }
}


/** The post's featured image: the live page's og:image, or the first image in the body. The build has one for every post. */
function imageFor(p) {
  const img = images[p.slug]
  if (img) return { ...img }
  const m = p.rawBody.match(/<img\b[^>]*?\ssrc="(https?:\/\/[^"]+)"/i)
  return m ? { src: m[1].replace(/&amp;/g, '&'), width: 1200, height: 675 } : { src: '', width: 1200, height: 675 }
}

/** A short title for the rail: the title up to its first colon, dash or " to ", at most 60 characters. */
const shortTitle = (t) => truncate(t.split(/:| - | – | — /)[0].trim(), 60)

function enrich(p) {
  const primary = categoryBySlug.get(slugify(p.categories[0] || 'Business')) || categories[0]
  const words = strip(p.rawBody).split(' ').filter(Boolean).length
  const meta = seoMeta[p.slug] || {}
  const hub = hubOf.get(primary.slug)
  const isGuide = GUIDE_RX.test(p.title) && !NOT_GUIDE_RX.test(p.title) && hub.id !== NEWS_HUB
  return {
    ...p,
    url: previewUrl.post(p.slug),
    prodUrl: PROD.post(p.slug),
    category: { name: primary.name, slug: primary.slug, url: categoryUrl(primary.slug), prodUrl: PROD.category(primary.slug) },
    hub: { id: hub.id, name: hub.name },
    words,
    readingMinutes: Math.max(1, Math.round(words / 238)),
    excerpt: excerptOf(p.rawBody),
    seoTitle: meta.seoTitle || `${p.title} | Legiit`,
    description: meta.description || excerptOf(p.rawBody),
    publishedText: fmt(monthLong, p.publishedISO),
    publishedShort: fmt(monthShort, p.publishedISO),
    image: imageFor(p),
    author: authorRecord(p.creator),
    isGuide,
    shortTitle: shortTitle(p.title),
  }
}
const posts = allPosts.map(enrich)
const guides = posts.filter((p) => p.isGuide)
const inTopic = new Map(categories.map((c) => [c.slug, posts.filter((p) => p.categories.some((n) => slugify(n) === c.slug))]))
const withImage = posts.filter((p) => p.image.src)
console.log(`${withImage.length} of ${posts.length} posts have a featured image`)

const BAND = {
  title: 'Need it done, not just explained?',
  body: 'Hire a reviewed freelancer on the Legiit marketplace, or run your business from one dashboard with Command Center.',
  primaryLabel: 'Browse the marketplace',
  primaryUrl: SITE.marketplaceUrl,
  secondaryLabel: 'Start a free trial',
  secondaryUrl: SITE.trialUrl,
}
/** The topic's call to action, with the two short forms the rail card needs. */
const ctaFor = (slug) => {
  const c = ctas.byCategory[slug] || ctas.default
  return { ...c, short: truncate(firstSentences(c.body, 1), 90), railLabel: c.railLabel || c.ctaLabel.replace(/^See Agency /, 'See ').replace(/^Start My 7-Day Free Trial$/, 'Start free trial').replace(/^Browse The /, 'Browse ') }
}

/** The sidebar topic tree: every hub with its topics (icon and count). The current topic is marked. */
function treeFor(activeSlug) {
  return HUBS.map((h) => {
    const topics = h.topics
      .map((slug) => categoryBySlug.get(slug))
      .filter(Boolean)
      .map((c) => ({ name: c.name, slug: c.slug, url: categoryUrl(c.slug), count: c.count, icon: topicInfo(c.slug).icon, active: c.slug === activeSlug }))
    return { id: h.id, name: h.name, icon: h.icon, open: topics.some((t) => t.active), topics }
  })
}

const authorList = Object.keys(authorsById)
  .filter((k) => !k.startsWith('_') && posts.some((p) => p.creator === k))
  .map((k) => authorRecord(k))
const navFor = (activeSlug, section = '') => ({
  section,
  primaryTopics: categories.slice(0, 4).map((c) => ({ name: c.name, url: categoryUrl(c.slug) })),
  footerTopics: categories.slice(0, 7).map((c) => ({ name: c.name, url: categoryUrl(c.slug) })),
  moreTopics: categories.slice(7, 13).map((c) => ({ name: c.name, url: categoryUrl(c.slug) })),
  footerBlog: categories.filter((c) => ['case-studies', 'success-stories', 'announcements'].includes(c.slug)).map((c) => ({ name: c.name, url: categoryUrl(c.slug) })),
  authors: authorList.filter((a) => a.slug === 'amit').map((a) => ({ name: a.name, url: a.pageUrl })),
  hubs: treeFor(activeSlug),
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
const HOME = { name: 'Legiit', url: SITE.homeUrl, prodUrl: SITE.homeUrl }
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
const yearList = (active = '') => years.map((y) => ({ year: y, count: posts.filter((p) => p.publishedISO.startsWith(y)).length, url: previewUrl.archive(y), active: y === active }))
const stats = {
  posts: posts.length.toLocaleString('en-US'),
  topics: categories.length,
  authors: authorList.length,
  firstYear: years[years.length - 1],
  lastYear: years[0],
  years: years.length,
}
const common = {
  site: SITE,
  stats,
  url: { index: previewUrl.index, archive: previewUrl.archive(years[0]), search: previewUrl.search, topics: previewUrl.topics, latest: previewUrl.latest, guides: previewUrl.guides, guidesAll: previewUrl.guidesAll(1) },
}

// ---------- Blog home and its numbered pages ----------
const indexTotal = Math.ceil(posts.length / PER_PAGE)
const top = categories[0]
const hubCards = HUBS.map((h) => {
  const list = posts.filter((p) => h.topics.includes(p.category.slug))
  const names = h.topics.map((s) => categoryBySlug.get(s)).filter(Boolean).map((c) => c.name)
  return { name: h.name, url: `${previewUrl.index}#hub-${h.id}`, count: list.length.toLocaleString('en-US'), topicNames: names.slice(0, 3).join(', ') + (names.length > 3 ? ` and ${names.length - 3} more` : ''), post: list.find((p) => p.image.src) || withImage[0], hubUrl: categoryUrl(h.topics[0]) }
}).map((c) => ({ ...c, url: c.hubUrl }))
for (let n = 1; n <= indexTotal; n++) {
  const start = (n - 1) * PER_PAGE
  const slice = posts.slice(start, start + PER_PAGE)
  const crumbs = n === 1 ? [HOME, { name: 'Blog' }] : [HOME, BLOG, { name: `Page ${n}` }]
  render(
    'index',
    {
      ...common,
      nav: navFor('all', n === 1 ? 'overview' : 'latest'),
      page: {
        title: n === 1 ? 'Legiit Blog: Guides To Grow Your Business' : `Latest posts, page ${n} | Legiit Blog`,
        description: 'Practical guides on SEO, marketing, freelancing and running a business, from the Legiit marketplace. New posts every week.',
        canonical: PROD.page(n),
        ogType: 'website',
        prevUrl: n > 1 ? PROD.page(n - 1) : '',
        nextUrl: n < indexTotal ? PROD.page(n + 1) : '',
        breadcrumbs: crumbs,
        jsonld: [{ '@context': 'https://schema.org', '@type': 'Blog', name: 'Legiit Blog', url: PROD.index, description: 'Guides on SEO, marketing, freelancing and running a business from the Legiit marketplace.', publisher: { '@type': 'Organization', name: 'Legiit', url: SITE.homeUrl } }, breadcrumbLd(crumbs)],
      },
      index: {
        isFirst: n === 1,
        pageNumber: n,
        totalPages: indexTotal,
        intro: `Posts ${start + 1} to ${start + slice.length} of ${stats.posts}, newest first.`,
        heroPosts: guides.filter((p) => p.image.src).slice(0, 3),
        topTopic: { name: top.name, url: categoryUrl(top.slug), blurb: `${top.count} ${topicInfo(top.slug).about}.`, post: inTopic.get(top.slug).find((p) => p.image.src) },
        guides: n === 1 ? guides.slice(0, 6) : [],
        posts: n === 1 ? slice.slice(0, 3) : slice,
        hubs: hubCards,
        pagination: paginationFor(n, indexTotal, previewUrl.page),
        years: yearList(),
        band: BAND,
      },
    },
    previewUrl.page(n),
  )
}

// ---------- Buyer's guides listing (every commercial-intent post) ----------
{
  const total = Math.ceil(guides.length / PER_PAGE)
  for (let n = 1; n <= total; n++) {
    const slice = guides.slice((n - 1) * PER_PAGE, n * PER_PAGE)
    const crumbs = n === 1 ? [HOME, BLOG, { name: 'Buyer’s guides' }] : [HOME, BLOG, { name: 'Buyer’s guides', url: previewUrl.guidesAll(1), prodUrl: PROD.guidesAll }, { name: `Page ${n}` }]
    render(
      'category',
      {
        ...common,
        nav: navFor('', 'guides'),
        page: { title: `Buyer’s guides${n > 1 ? `, page ${n}` : ''} | Legiit Blog`, description: 'Shortlists and comparisons of agencies, services and tools, with what each costs and who it suits.', canonical: `${PROD.guidesAll}${n > 1 ? `/page/${n}` : ''}`, ogType: 'website', prevUrl: n > 1 ? `${PROD.guidesAll}${n > 2 ? `/page/${n - 1}` : ''}` : '', nextUrl: n < total ? `${PROD.guidesAll}/page/${n + 1}` : '', breadcrumbs: crumbs, jsonld: [breadcrumbLd(crumbs)] },
        category: { name: 'Buyer’s guides', isGuides: true, count: guides.length.toLocaleString('en-US'), description: `${guides.length} shortlists and side-by-side comparisons of agencies, services and tools, newest first.`, isFirst: n === 1, pageNumber: n, totalPages: total, hub: { name: '' }, fundamentals: [], guides: n === 1 ? guides.filter((p) => p.image.src).slice(0, 6) : [], recent: [], posts: slice, pagination: paginationFor(n, total, previewUrl.guidesAll), related: [], cta: ctaFor('agency'), band: BAND },
      },
      previewUrl.guidesAll(n),
    )
  }
}

// ---------- Topic pages (every page of every topic) ----------
for (const c of categories) {
  const list = inTopic.get(c.slug)
  const total = Math.ceil(list.length / PER_PAGE)
  const hub = hubOf.get(c.slug)
  const topicGuides = list.filter((p) => p.isGuide && p.image.src).slice(0, 6)
  const guideSlugs = new Set(topicGuides.map((p) => p.slug))
  const nonGuides = list.filter((p) => !guideSlugs.has(p.slug) && p.image.src)
  const fundamentals = nonGuides.slice(0, 3)
  const recent = nonGuides.slice(3, 9)
  const related = hub.topics
    .filter((s) => s !== c.slug)
    .map((s) => categoryBySlug.get(s))
    .filter(Boolean)
    .map((r) => ({ name: r.name, url: categoryUrl(r.slug), count: r.count, about: topicInfo(r.slug).about || `posts on ${r.name.toLowerCase()}`, post: inTopic.get(r.slug).find((p) => p.image.src) || withImage[0] }))
  for (let n = 1; n <= total; n++) {
    const slice = list.slice((n - 1) * PER_PAGE, n * PER_PAGE)
    const crumbs = n === 1 ? [HOME, BLOG, { name: c.name }] : [HOME, BLOG, { name: c.name, url: categoryUrl(c.slug), prodUrl: PROD.category(c.slug) }, { name: `Page ${n}` }]
    render(
      'category',
      {
        ...common,
        nav: navFor(c.slug, 'topics'),
        page: {
          title: `${c.name} guides${n > 1 ? `, page ${n}` : ''} | Legiit Blog`,
          description: `${c.count} ${topicInfo(c.slug).about || `posts on ${c.name.toLowerCase()}`}, from the Legiit blog.`,
          canonical: PROD.category(c.slug, n),
          ogType: 'website',
          prevUrl: n > 1 ? PROD.category(c.slug, n - 1) : '',
          nextUrl: n < total ? PROD.category(c.slug, n + 1) : '',
          breadcrumbs: crumbs,
          jsonld: [breadcrumbLd(crumbs)],
        },
        category: {
          name: c.name,
          count: c.count.toLocaleString('en-US'),
          description: `${c.count.toLocaleString('en-US')} ${topicInfo(c.slug).about || `posts on ${c.name.toLowerCase()}`}.`,
          isFirst: n === 1,
          pageNumber: n,
          totalPages: total,
          hub: { id: hub.id, name: hub.name },
          fundamentals,
          fundamentalsBlurb: `Three guides that explain ${c.name === 'SEO' ? 'how search works today' : `the basics of ${c.name.toLowerCase()}`}.`,
          guides: n === 1 ? topicGuides : [],
          recent: n === 1 ? recent : [],
          posts: slice,
          pagination: paginationFor(n, total, (k) => previewUrl.category(c.slug, k)),
          related: n === 1 ? related : [],
          cta: ctaFor(c.slug),
          band: BAND,
        },
      },
      previewUrl.category(c.slug, n),
    )
  }
}

// ---------- Search (one sample query; the CMS runs real searches) ----------
{
  const q = 'local seo'
  const hits = posts.filter((p) => p.title.toLowerCase().includes(q) || strip(p.rawBody).toLowerCase().includes(q))
  const slice = hits.slice(0, PER_PAGE)
  const crumbs = [HOME, BLOG, { name: 'Search' }]
  render(
    'search',
    {
      ...common,
      nav: navFor(''),
      page: { title: `Search results for “${q}” | Legiit Blog`, description: `Blog posts matching “${q}”.`, canonical: PROD.search(''), ogType: 'website', robots: 'noindex, follow', breadcrumbs: crumbs, jsonld: [breadcrumbLd(crumbs)] },
      search: { query: q, total: hits.length, postCount: stats.posts, posts: slice, pagination: paginationFor(1, Math.ceil(hits.length / PER_PAGE), (k) => `${previewUrl.search}#page-${k}`), band: BAND },
    },
    previewUrl.search,
  )
}

// ---------- Archive: one page per year, every post listed by month ----------
for (const y of years) {
  const inYear = posts.filter((p) => p.publishedISO.startsWith(y))
  const months = []
  for (const p of inYear) {
    const key = p.publishedISO.slice(0, 7)
    let m = months.find((x) => x.key === key)
    if (!m) months.push((m = { key, id: `m-${key}`, text: fmt(monthName, `${key}-01`), count: 0, posts: [], children: [] }))
    m.count++
    m.posts.push(p)
  }
  const crumbs = [HOME, BLOG, { name: `Archive ${y}` }]
  render(
    'archive',
    {
      ...common,
      nav: navFor('', 'archive'),
      page: { title: `All ${y} posts | Legiit Blog`, description: `Every Legiit blog post published in ${y}, by month.`, canonical: PROD.archive(y), ogType: 'website', breadcrumbs: crumbs, jsonld: [breadcrumbLd(crumbs)] },
      archive: { year: y, count: inYear.length, years: yearList(y), months, cta: ctaFor('default'), band: BAND },
    },
    previewUrl.archive(y),
  )
}

// ---------- Author pages (every page of every author) ----------
for (const a of authorList) {
  const mine = posts.filter((p) => authorRecord(p.creator).slug === a.slug)
  const total = Math.ceil(mine.length / PER_PAGE)
  for (let n = 1; n <= total; n++) {
    const slice = mine.slice((n - 1) * PER_PAGE, n * PER_PAGE)
    const crumbs = n === 1 ? [HOME, BLOG, { name: a.name }] : [HOME, BLOG, { name: a.name, url: a.pageUrl, prodUrl: a.pageUrlProd }, { name: `Page ${n}` }]
    render(
      'author',
      {
        ...common,
        nav: navFor(''),
        page: { title: `Posts by ${a.name}${n > 1 ? `, page ${n}` : ''} | Legiit Blog`, description: `${mine.length} posts by ${a.name} on the Legiit blog.`, canonical: PROD.author(a.slug, n), ogType: 'profile', prevUrl: n > 1 ? PROD.author(a.slug, n - 1) : '', nextUrl: n < total ? PROD.author(a.slug, n + 1) : '', breadcrumbs: crumbs, jsonld: [{ '@context': 'https://schema.org', '@type': 'ProfilePage', mainEntity: { '@type': 'Person', name: a.name, ...(a.url ? { url: a.url } : {}) } }, breadcrumbLd(crumbs)] },
        author: { ...a, isFirst: n === 1, pageNumber: n, totalPages: total, count: mine.length, posts: slice, pagination: paginationFor(n, total, (k) => previewUrl.author(a.slug, k)), band: BAND },
      },
      previewUrl.author(a.slug, n),
    )
  }
}

// ---------- Every post ----------
const groupTitleFor = (p) => {
  const m = p.title.match(/^(?:the\s+)?(\d{1,2})\s+best\b/i) || p.title.match(/^top\s+(\d{1,2})\b/i)
  return m ? `Top ${m[1]} ${p.title.replace(/^(?:the\s+)?\d{1,2}\s+best\s+|^top\s+\d{1,2}\s+/i, '').split(/\s+(?:to|for|in|that|of)\s+/i)[0].toLowerCase()}` : 'The list'
}
for (let i = 0; i < posts.length; i++) {
  const p = posts[i]
  const cta = ctaFor(p.category.slug)
  const { html, toc } = processBody(p.rawBody, groupTitleFor(p))
  const inlineCta = p.words >= 600 && (html.match(/<h2\b/gi) || []).length >= 3
  const { lead, intro, body } = splitIntro(html, p.title)
  const sameTopic = inTopic.get(p.category.slug).filter((o) => o.slug !== p.slug)
  const related = sameTopic.filter((o) => !o.isGuide).slice(0, 4)
  const relatedGuides = sameTopic.filter((o) => o.isGuide && o.image.src).slice(0, 3)
  const newer = posts[i - 1]
  const older = posts[i + 1]
  const crumbs = [HOME, BLOG, { name: p.category.name, url: p.category.url, prodUrl: p.category.prodUrl }, { name: p.title }]
  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      ...(p.image.src ? { image: [p.image.src] } : {}),
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
      nav: navFor(p.category.slug, 'topics'),
      page: { title: p.seoTitle, description: p.description, canonical, ogType: 'article', ogImage: p.image.src || '', publishedISO: p.publishedISO, modifiedISO: p.updatedISO || '', breadcrumbs: crumbs, jsonld },
      post: {
        ...p,
        leadHtml: lead,
        introHtml: intro,
        bodyHtml: body,
        inlineCta,
        toc,
        tocTail: { id: 'resources', text: 'Resources' },
        cta,
        band: BAND,
        related,
        relatedGuides,
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

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ pages: manifest, posts: posts.length, categories: categories.length, totalPosts: posts.length, guides: guides.length }, null, 1))
console.log(`Wrote ${manifest.length} pages to ${OUT}/ (${posts.length} posts, ${categories.length} topics, ${authorList.length} authors, ${years.length} archive years, ${guides.length} buyer's guides)`)
