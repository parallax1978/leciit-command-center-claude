# Legiit blog redesign

New templates for https://legiit.com/blog, its topic pages and every post, in the same brand system as the
Command Center landing and pricing pages. The templates are server-rendered Handlebars, so the CMS keeps
rendering the HTML and search engines see every link and heading without JavaScript. A small script adds
extras on top (table-of-contents highlighting, reading progress, copy link).

The preview is built from the real blog feed (1,376 posts, 20 topics, 7 authors).

## Run and check

```
npm install
npm run build:blog-preview   # renders blog-preview/ from https://legiit.com/blogs.xml, then builds dist-blog/
npm run preview:blog         # serves dist-blog/ at http://127.0.0.1:4174
node qa/check-blog.mjs       # 693 checks: headings, breadcrumbs, JSON-LD, canonicals, 44px targets, links
```

The feed is downloaded once to `blog-preview/.cache/blogs.xml`. Pass `--feed <file>` to use a saved copy.

## What the CMS needs

| Path | What it is |
| --- | --- |
| `blog/templates/layouts/base.hbs` | The document: head tags, JSON-LD, header, footer |
| `blog/templates/{index,category,post,search,archive,author}.hbs` | One template per page type |
| `blog/templates/partials/*.hbs` | Header, footer, breadcrumbs, topic chips, cards, pagination, table of contents, CTA box, CTA band, author box |
| `src/blog/blog.css`, `src/blog/main.ts` | Styles and the small script. Vite builds them into one CSS and one JS file in `dist-blog/assets/`; the CMS links those two files instead of the dev `<script>` tag in `base.hbs` |
| `blog/sample/ctas.json` | The call to action for each topic. This is real configuration, not sample content |
| `scripts/build-blog-preview.mjs` | The reference implementation of every rule below (`processBody`, pagination, JSON-LD) |

The CMS can run these Handlebars files directly or port the markup to its own template language. The markup
and class names are what matter. Tailwind compiles the classes it finds in `blog/templates/**/*.hbs`, so
rebuild the CSS after changing classes.

## URLs

| Page | URL | Notes |
| --- | --- | --- |
| Blog home | `/blog`, then `/blog/page/2`, `/blog/page/3` ... | 12 posts per page. Replaces infinite scroll: every page is a real server-rendered URL |
| Topic | `/blog/category/{slug}`, `/blog/category/{slug}/page/2` ... | |
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
site      { homeUrl, logo, trialUrl, pricingUrl, marketplaceUrl, coursesUrl, supportUrl,
            signInUrl, privacyUrl, termsUrl, searchParam: "search" }
url       { index, archive, search, topics }                  plain strings
nav       { primaryTopics: 3 x { name, url }, footerTopics: 6 x { name, url },
            topics: [{ name, url, count, active }], allActive }
card      { title, url, excerpt, image?: { src, width, height }, category: { name, url },
            author: { name, pageUrl }, publishedISO, publishedText, readingMinutes }
pagination{ current, total, items: [{ n, url, current } | { gap: true }], prevUrl, nextUrl }
cta       { eyebrow, title, body, ctaLabel, url, secondaryLabel?, secondaryUrl? }   from ctas.json
band      { title, body, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl }

index     { h1Line1, h1Line2, intro, postCount, featured?: card, posts: [card], gridTitle,
            pagination, topics: [{ name, url, count }], band }
category  { name, count, description, posts: [card], pagination, cta, band }
post      { title, summary?, bodyHtml, toc: [{ id, text, children: [{ id, text }] }], image?,
            category, author: { name, initial, avatar?, role?, bio?, url?, pageUrl },
            publishedISO, publishedText, updatedISO?, updatedText?, readingMinutes,
            cta, band, related: 3 x card, prev?: { title, url }, next?: { title, url },
            share: { x, linkedin, facebook } }
search    { query, total, postCount, posts: [card], pagination, band }
archive   { year, count, years: [{ year, count, url, active }],
            months: [{ id, name, count, posts: [{ title, url, publishedISO, publishedShort, category }] }] }
author    { name, initial, avatar?, role?, bio?, url?, count, posts: [card], pagination, band }
```

Reading time is words divided by 238, at least 1 minute. `post.summary` is an optional one-line dek written
by the editor; leave it empty rather than repeating the first paragraph.

## Post body rules

Apply these when a post is rendered (or once, when it is saved). They fix what the editor produces today.

1. Escape any `<` that does not start a tag (for example `<20%`), or the page is invalid HTML.
2. Remove `<!--more-->` markers. Remove line breaks at the start or end of a block, or between blocks: they
   only add blank space (967 of 1,376 posts have them). Then remove empty paragraphs and divs.
3. Turn any H1 in the body into an H2. The post title is the page's only H1 (189 posts have a second one today).
4. Strip `font-family`, `font-size`, `line-height` and `font` from inline styles so old posts use the brand type.
5. Give every H2 and H3 a unique id made from its text, and build the table of contents from them
   (H3s nest under the H2 before them).
6. Images: drop inline styles, add `loading="lazy"` and `decoding="async"`.
7. Links to legiit.com open in the same tab (remove `target` and `rel`). External links that open a new tab get `rel="noopener"`.
8. Remove inline styles from the editor's `rte-call-action` buttons; `blog.css` styles them as brand buttons.
9. Wrap every table in `<div class="table-scroll">` so wide tables scroll sideways on phones.
10. In posts of 600+ words with at least three H2s, insert the topic's CTA box before the third H2.

## Head tags and structured data

- One H1 per page, no skipped heading levels, dates in `<time datetime="...">`.
- Title, meta description, canonical, Open Graph (`og:type` is `article` on posts, `website` elsewhere),
  `article:published_time` and `article:modified_time` on posts, Twitter card.
- JSON-LD on every page: a `BreadcrumbList` that matches the visible breadcrumb. The last breadcrumb is the
  current page as plain text (today it is a `javascript:void(0)` link).
- Posts add `BlogPosting`: headline, description, image, datePublished, dateModified, author (Person with a
  profile URL), publisher (Organization), mainEntityOfPage, articleSection, wordCount, inLanguage.
- The blog home adds `Blog`; author pages add `ProfilePage`.

## Calls to action

The blog's job is to move readers from a guide to a purchase, so every page has a next step that matches its topic:

- **Header:** Start Free Trial (Command Center trial checkout).
- **Inside long posts:** the topic's CTA box from `ctas.json`, before the third H2 (rule 10).
- **End of post:** the same CTA box, then share links, the author box and older/newer posts.
- **Desktop sidebar:** the table of contents with a small CTA under it that stays in view.
- **Bottom of every page:** a band with Browse The Marketplace and Start My 7-Day Free Trial.
- **Editor buttons** already in 173 posts are kept and restyled.

`ctas.json` maps each topic slug to its CTA, with `default` for topics not listed: SEO posts point to the
marketplace SEO category, Agency posts to Command Center pricing, Freelancing posts to seller sign-up, and so
on. Every CTA link has a `data-cta` name (for example `header-trial`, `post-inline-primary`,
`band-secondary`) so clicks can be tracked by placement.

## Sitemap

`https://legiit.com/blogs.xml` is listed in the sitemap index, but it is not a sitemap: it is a 29 MB feed
with the full HTML of every post and no `<urlset>`, `<loc>` or `<lastmod>`. Add a real XML sitemap for the
blog (posts, topic pages, archive years, author pages) with `<loc>` and `<lastmod>` for each URL, and list
it in `sitemap.xml`. Keep the feed if something else reads it. Leave search URLs out.

## Editorial backlog (the templates cannot fix these)

- Alt text: 1,214 posts have images and only 168 have any alt text.
- 484 of 1,376 titles are over 60 characters. The SEO title can be set separately from the H1.
- Author bios and photos: only one author has a photo in the data, and none has a bio. The author box shows
  a bio and photo when the CMS supplies them.
- A topic named "Page" exists (`/blog/category/page`). It looks accidental; merge it into a real topic and redirect.

## Preview only

- The published preview holds a sample of 406 pages, because the host has a file limit. Links to pages outside
  the sample open `not-in-preview.html`. The CMS serves every page, so it needs no such page.
- The host blocks images from other sites, so the published copy carries packed copies of the images.
  The templates use the real image URLs.
- "Comments are loaded by the CMS here" marks where the existing comment system goes.

## Open questions

- Can the CMS serve the new paginated, archive and author URLs server-side? Pagination has to be real links
  for search engines to find older posts.
- The CMS currently adds its own section ids to headings. If anything links to those ids, keep the old id on
  the heading as well as the new one.
- Who writes and approves the per-topic CTA copy in `ctas.json`?
