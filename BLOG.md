# Legiit blog redesign

New templates for https://legiit.com/blog, its topic pages and every post, in the Legiit Brand Guideline 2026
(Inter, purple #8A12DC as the one accent, navy #101828 bands, charcoal #1D1D1F type). The templates are
server-rendered Handlebars, so the CMS keeps rendering the HTML and search engines see every link and heading
without JavaScript. A small script adds extras on top (typing in the topic filter, table-of-contents
highlighting, reading progress, copy link).

The layout follows three Apple pages, with the Legiit brand applied:

- **Blog home** follows developer.apple.com/design: a hero with the search box, two start tiles, the "Tools
  from Legiit" row, "Compare before you hire" (the newest buyer's guides), "Latest posts", the stats band,
  the five topic groups, the archive years and the navy call-to-action band.
- **Topic page** follows the Human Interface Guidelines hub: the topic tree in a left sidebar, then "Start
  with the fundamentals", "Compare before you hire", "New and updated", the full post list with pagination,
  and the other topics in the same group.
- **Post** follows a guidelines page: sidebar on the left, a 692px reading column, "On this page" and the
  topic's offer in a right rail. Title, one-line summary, a 14px byline, the featured image, the intro, the
  body, share row, author line, older and newer posts, resources, change log, comments.

Every card shows a real 16:9 image: the post's featured image. Pages 2 and up of every listing are a plain
list of titles and dates, like Apple's archive pages. Phones and tablets fold the sidebar into a "Browse
topics" disclosure and show a breadcrumb above the title.

The preview is built from the real blog feed: 1,376 posts, 20 topics, 7 authors, 5 archive years, 134
buyer's guides. The full build is 1,791 pages.

## Run and check

```
npm install
npm run build:blog-preview   # renders blog-preview/ from https://legiit.com/blogs.xml, then builds dist-blog/
npm run preview:blog         # serves dist-blog/ at http://127.0.0.1:4174
node qa/check-blog.mjs       # 763 checks: headings, breadcrumbs, JSON-LD, canonicals, target sizes, links
```

The feed is downloaded once to `blog-preview/.cache/blogs.xml`. Pass `--feed <file>` to use a saved copy.
The build takes a few seconds; the Vite build of all 1,791 pages about a minute.

## What the CMS needs

| Path | What it is |
| --- | --- |
| `blog/templates/layouts/base.hbs` | The document: head tags, JSON-LD, Inter from Google Fonts, the icon sprite, header, footer |
| `blog/templates/{index,category,post,search,archive,author}.hbs` | One template per page type. `category.hbs` also renders the buyer's guides listing |
| `blog/templates/partials/*.hbs` | `header` (global bar and section bar), `footer` (navy directory), `breadcrumbs` (phones and tablets), `sidebar` (filter and topic tree), `browse` (the sidebar as a phone disclosure), `art-defs` (the icon sprite), `post-image` (a featured image), `post-card` (image, title, topic and date), `post-story` (card with excerpt), `post-row` (list row), `toc`, `pagination`, `cta-inline`, `cta-rail`, `cta-band` |
| `src/blog/blog.css`, `src/blog/main.ts` | Styles and the small script. Vite builds them into one CSS and one JS file in `dist-blog/assets/`; the CMS links those two files instead of the dev `<script>` tag in `base.hbs` |
| `blog/sample/ctas.json` | The call to action for each topic. This is real configuration, not sample content |
| `blog/sample/images.json` | The featured image (URL, width, height) of every post, taken from each live post's `og:image`. The CMS has these in its own database |
| `scripts/build-blog-preview.mjs` | The reference implementation of every rule below (`processBody`, pagination, JSON-LD, the hub tree) |

The CMS can run these Handlebars files directly or port the markup to its own template language. The markup
and class names are what matter. Tailwind compiles the classes it finds in `blog/templates/**/*.hbs`, so
rebuild the CSS after changing classes.

## Brand tokens used

| Token | Value | Where |
| --- | --- | --- |
| Type | Inter only | Everything |
| Purple | #8A12DC | Links, buttons, the active tab underline, focus rings, the current sidebar icon |
| Pink | #EB47AC | Accents only (never text) |
| Gradient | Purple to pink | Only the article banner images, never UI |
| Navy | #101828 | Stats band, call-to-action band, footer |
| Charcoal | #1D1D1F | Text |
| Secondary | #6E6E73 | Meta text (14px) |
| Placeholder | #86868B | Placeholders only |
| Off-white | #F5F5F7 | Alternate sections, tiles, rail card |
| Borders | #D2D2D7 | Rules, cards, inputs |
| Sizes | H1 48px bold (1.08 on posts), H2 40px bold, H3 24px semibold, intro 21px, card titles 24px, body and links 17px/1.47, meta 14px | |
| Layout | 980px max, 692px article, 80px between sections, 24px card gaps, 18px card radius, 12px image radius, 44px search box | |

Headings are sentence case. Post titles keep the casing the CMS stores. Icons are Lucide-style outlines
from the sprite in `art-defs.hbs`; product tiles are 80px purple squares with a 40px white icon.

## URLs

| Page | URL | Notes |
| --- | --- | --- |
| Blog home | `/blog`, then `/blog/page/2`, `/blog/page/3` ... | 12 posts per page. Replaces infinite scroll: every page is a real server-rendered URL |
| Topic | `/blog/category/{slug}`, `/blog/category/{slug}/page/2` ... | |
| Buyer's guides | `/blog/buyers-guides`, `/blog/buyers-guides/page/2` ... | Every post with commercial intent, newest first |
| Post | `/blog/{slug}` | Unchanged, so no post needs a redirect |
| Archive | `/blog/archive/{year}` | Every post from that year, grouped by month. "Archive" links open the newest year |
| Author | `/blog/author/{slug}`, `/blog/author/{slug}/page/2` ... | |
| Search | `/blogs?search=...` | Unchanged. Gets `noindex, follow` and canonical `https://legiit.com/blogs` |

Every page has a self-referencing canonical, including page 2 onward. Paginated pages also get
`<link rel="prev">` and `<link rel="next">`.

**301 redirects** for the topic slugs that change:

| Old | New |
| --- | --- |
| `/blog/category/-Agency` | `/blog/category/agency` |
| `/blog/category/ecommerce-` | `/blog/category/ecommerce` |
| `/blog/category/website-` | `/blog/category/website` |
| `/blog/category/rondup` | `/blog/category/roundup` |
| `/blog/categories` | `/blog#topics` (the topic list now lives on the blog home) |

New slugs are the topic name lowercased, with anything that is not a letter or digit turned into one hyphen.

## Data each template expects

```
page      { title, description, canonical, robots?, prevUrl?, nextUrl?, ogType, ogImage?,
            publishedISO?, modifiedISO?, breadcrumbs: [{ name, url? }], jsonld: [ ... ] }
site      { name, blogName, homeUrl, logo, trialUrl, pricingUrl, marketplaceUrl, coursesUrl, supportUrl,
            signInUrl, registerUrl, privacyUrl, termsUrl, seoCategoryUrl, socialCategoryUrl, devCategoryUrl,
            searchParam: "search" }
url       { index, archive, search, topics, latest, guides, guidesAll }   plain strings (topics, latest and
                                                                          guides are anchors on the blog home)
stats     { posts, topics, authors, firstYear, lastYear, years }          real counts, e.g. posts "1,376"
nav       { section: overview | latest | guides | topics | archive | "",   which section-bar tab is current
            primaryTopics: 4 x { name, url }, footerTopics: 7 x { name, url }, moreTopics: 6 x { name, url },
            footerBlog: [{ name, url }], authors: [{ name, url }],
            hubs: [{ id, name, icon, open, topics: [{ name, slug, url, count, icon, active }] }] }
post      { title, url, image: { src, width, height }, category: { name, url }, excerpt, isGuide, shortTitle,
            author: { name, pageUrl, avatar?, initial, role }, publishedISO, publishedText, publishedShort,
            readingMinutes }                                              the record every card, row and story uses
pagination{ current, total, items: [{ n, url, current } | { gap: true }], prevUrl, nextUrl }
cta       { eyebrow, title, body, ctaLabel, url, secondaryLabel?, secondaryUrl?, short, railLabel }
            short is the body's first sentence (at most 90 characters) and railLabel a two-word button
            label; both are for the rail card
band      { title, body, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl }

index     { isFirst, pageNumber, totalPages, intro, heroPosts: 3 x post, topTopic: { name, url, blurb, post },
            guides: 6 x post, posts: [post], hubs: [{ name, url, count, topicNames, post }],
            years: [{ year, count, url }], pagination, band }
            (heroPosts, guides and hubs only on page 1; page 1 shows 3 stories, later pages 12 rows)
category  { name, isGuides?, count, description, isFirst, pageNumber, totalPages, hub: { id, name },
            fundamentals: 3 x post, fundamentalsBlurb, guides: 6 x post, recent: 6 x post, posts: [post],
            pagination, related: [{ name, url, count, about, post }], cta, band }
post      { ...post record, summary?, leadHtml?, introHtml, bodyHtml, inlineCta,
            toc: [{ id, text, children: [{ id, text }] }], tocTail: { id, text },
            updatedISO?, updatedText?, cta, band, related: 4 x post, relatedGuides: 3 x post,
            prev?: { title, url }, next?: { title, url }, share: { x, linkedin, facebook }, commentsNote }
search    { query, total, postCount, posts: [post], pagination, band }
archive   { year, count, years: [{ year, count, url, active }], cta, band,
            months: [{ id, text, count, posts: [post] }] }
author    { name, initial, avatar?, role?, bio?, url?, isFirst, pageNumber, totalPages, count, posts: [post],
            pagination, band }
```

Reading time is words divided by 238, at least 1 minute. `post.summary` is an optional one-line dek written
by the editor; without it the template shows `leadHtml`, the first paragraph when it is plain text of 8 to 70
words. Excerpts (stories, the meta description fallback) are the first paragraph of 60 or more characters,
cut after its second sentence and at 170 characters. `shortTitle` is the title up to its first colon or
dash, at most 60 characters, and heads the "On this page" list.

**Every post needs a featured image** with its width and height. The build takes each live post's
`og:image` and, for the one post without one, the first image in the body. A card without an image is a
grey box, so the CMS should require an image when a post is published.

## Library structure

All of this lives in `scripts/build-blog-preview.mjs`, so the CMS can copy the tables as configuration.

- **Goal hubs** (`HUBS`): Rank higher on Google, Win more clients, Grow on social, Run your business and
  Legiit news, each with an icon. Each topic sits in one hub; a topic the list does not name joins Run your
  business, so a new CMS category still appears. Hubs drive the sidebar tree, the topic cards on the blog
  home, the "More in ..." cards on topic pages and the footer.
- **Topic icons and blurbs** (`TOPIC`): one line icon per topic, plus the lead sentence of its topic page.
  Every sidebar item has an icon: the current topic is bold with a purple icon, its open hub bold with a
  black icon.
- **Buyer's guides**: posts whose title has commercial intent (Best, Top, Alternatives, vs, Compared,
  Comparison, Review), except advice titles such as "best practices" or "tips" and Legiit's own news. They
  lead the blog home under Compare before you hire, open each topic page, and have their own listing.

## Post body rules

Apply these when a post is rendered (or once, when it is saved). They fix what the editor produces today.

1. Parse and re-serialize the body with an HTML5 parser (the build uses `parse5`) before anything else.
   Some bodies in the feed stop in the middle of a tag, and old ones carry unclosed or stray tags; this
   gives well-formed HTML that every tool downstream accepts.
2. Escape any `<` that does not start a tag (for example `<20%`), or the page is invalid HTML.
3. Remove `<!--more-->` markers. Remove line breaks at the start or end of a block, or between blocks: they
   only add blank space (967 of 1,376 posts have them). Then remove empty paragraphs and divs, including
   ones that hold only empty inline tags such as `<div><em><span>&nbsp;</span></em></div>` (59 posts), and a
   block whose only text is `?` (an emoji the old editor lost).
4. Turn any H1 in the body into an H2. The post title is the page's only H1 (189 posts have a second one today).
5. Strip `font-family`, `font-size`, `line-height` and `font` from inline styles so old posts use the brand type.
6. Give every H2 and H3 a unique id made from its text, and build the table of contents from them
   (H3s nest under the H2 before them).
7. **Numbered providers:** when three or more H2s start with a number ("1. SuperstarSEO", "2) Legiit"), they
   become H3s under one H2 named after the title ("Top 15 content marketing agencies", or "The list"), with
   the numbers removed. The table of contents then shows one entry with the providers nested under it.
8. Images: drop inline styles, add `loading="lazy"` and `decoding="async"`.
9. Links to legiit.com open in the same tab (remove `target` and `rel`). External links that open a new tab get `rel="noopener"`.
10. Remove inline styles from the editor's `rte-call-action` buttons; `blog.css` styles them as flat purple buttons.
11. Wrap every table in `<div class="table-scroll">`. Tables of three or more columns also get the class
    `table-scroll--stack`, and every cell a `data-label` with its column's header text (from a `<thead>`, a
    first row of `<th>`, or a first row whose cells are all bold, which is marked `data-head`). On phones those
    tables become one card per row, so no table scrolls sideways. Tables are ruled, not boxed, with a
    sentence-case header row.
12. Split the opening of the body (see `splitIntro`). The first paragraph becomes the 21px summary under the
    H1 when it is plain text of 8 to 70 words in at most two sentences. Everything else before the first H2
    is the intro.
13. In posts of 600+ words with at least three H2s (counted after rule 7), the template places the topic's
    call to action right after the intro, before the first H2, as one off-white box in the article's own
    type (`cta-inline`).

## Head tags and structured data

- One H1 per page, no skipped heading levels, dates in `<time datetime="...">`.
- Title, meta description, canonical, Open Graph (`og:type` is `article` on posts, `website` elsewhere),
  `article:published_time` and `article:modified_time` on posts, Twitter card.
- JSON-LD on every page: a `BreadcrumbList` that matches the visible breadcrumb (the list above the title on
  phones and tablets; the footer breadcrumb shows the same trail with the logo standing for Legiit). The
  last breadcrumb is the current page as plain text (today it is a `javascript:void(0)` link). `<` inside
  JSON-LD is written as `<`.
- Posts add `BlogPosting`: headline, description, image, datePublished, dateModified, author (Person with a
  profile URL), publisher (Organization), mainEntityOfPage, articleSection, wordCount, inLanguage.
- The blog home adds `Blog`; author pages add `ProfilePage`.

## Calls to action

The blog's job is to move readers from a guide to a purchase, so every page has a next step that matches its topic:

- **Header:** Start free trial (Command Center trial checkout).
- **After the intro of long posts:** the topic's offer from `ctas.json` as one box, before the first H2
  (rule 13). Topic pages carry the same box after their post list.
- **Right rail (desktop):** "On this page" with the same offer as a compact card under it (`title`, `short`,
  `railLabel`).
- **End of post:** the same offer as a box with its button, after the share row.
- **Bottom of every page:** a navy band with Browse the marketplace and Start a free trial.
- **Editor buttons** already in 173 posts are kept and restyled.

`ctas.json` maps each topic slug to its CTA, with `default` for topics not listed: SEO posts point to the
marketplace SEO category, Agency posts to Command Center pricing, Freelancing posts to seller sign-up, and so
on. Labels are sentence case. Every CTA link has a `data-cta` name (`header-trial`, `post-inline-primary`,
`post-end-primary`, `category-primary`, `rail-primary`, `band-primary`, `band-secondary`) so clicks can be
tracked by placement.

## Sitemap

`https://legiit.com/blogs.xml` is listed in the sitemap index, but it is not a sitemap: it is a 29 MB feed
with the full HTML of every post and no `<urlset>`, `<loc>` or `<lastmod>`. Add a real XML sitemap for the
blog (posts, topic pages, the buyer's guides listing, archive years, author pages) with `<loc>` and
`<lastmod>` for each URL, and list it in `sitemap.xml`. Keep the feed if something else reads it. Leave
search URLs out.

## Editorial backlog (the templates cannot fix these)

- Alt text: 1,214 posts have images and only 168 have any alt text.
- 484 of 1,376 titles are over 60 characters. The SEO title can be set separately from the H1.
- Author bios and photos: only one author has a photo in the data, and none has a bio. The author page shows
  a bio and photo when the CMS supplies them.
- A topic named "Page" exists (`/blog/category/page`, 8 posts). It looks accidental; merge it into a real
  topic and redirect.
- One post (`best-high-income-skills`) is cut off inside an image tag in the feed; the parser drops the
  broken tag, but the post should be fixed in the editor.

## Preview only

- The repository build (`dist-blog/`) holds every page. The published preview holds a sample of about 300
  pages, because the preview host allows 511 files; links to pages outside the sample open
  `not-in-preview.html`. The CMS serves every page, so it needs no such page.
- The host blocks images from other sites, so the published copy carries packed copies of the images.
  The templates use the real image URLs.
- "Comments are loaded by the CMS here" marks where the existing comment system goes.
- The search page shows one sample query; the CMS runs real searches.

## Open questions

- Can the CMS serve the new paginated, buyer's guides, archive and author URLs server-side? Pagination has
  to be real links for search engines to find older posts.
- The CMS currently adds its own section ids to headings. If anything links to those ids, keep the old id on
  the heading as well as the new one.
- Who writes and approves the per-topic CTA copy in `ctas.json`?
