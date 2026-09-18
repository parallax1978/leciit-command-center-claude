# Legiit Command Center landing page

A complete, responsive landing page for cold paid traffic from business owners who do not yet know Legiit. It positions Command Center as a broad AI powered business command center (plan, create, delegate, grow), demonstrates the actual product, and starts a 7-day free trial at `https://legiit.com/command-center/start`.

Built with React 18, TypeScript (strict), Tailwind CSS 3, and Vite 5. No backend, scan, AI API, database, payment flow, tracker, or signup form.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serves dist/ at http://localhost:4173
npm test           # vitest: content and configuration invariants
npm run check      # typecheck + tests + build
```

Browser QA (developer tool): with `npm run preview` running, `node qa/check-page.mjs http://127.0.0.1:4173`. It drives a local Chromium through `playwright-core` (set `CHROMIUM_PATH` if auto-detection fails) and writes screenshots to `qa/screenshots/` (git-ignored). See "Verification" below for what it checks.

## Page sequence

| # | Section | Component | Notes |
|---|---------|-----------|-------|
| 1 | Simple header | `sections/Header.tsx` | Official logo, "Command Center" name, "Start Free Trial" button |
| 2 | Centered hero | `sections/Hero.tsx` | Eyebrow, two-line H1 (line 2 on the brand gradient), the 13-word subhead, one centered "Start My 7-Day Free Trial" button at the 25% larger hero size, then the offer line |
| 3 | Playable product demo | `media/ProductOverviewVideo.tsx` | Directly below the offer line: the actual 42-second overview with native controls, poster, and English captions, plus the quiet "Explore Command Center" walkthrough link under it |
| 4 | Company credibility line | inside `Hero.tsx` | "From Legiit. Connecting businesses and freelancers since 2018." |
| 5 | Short introduction | `sections/Intro.tsx` | "Built around your business" / "One place to move your business forward." |
| 6 | Four product sections | `sections/ProductSection.tsx` (copy in `config/copy.ts`) | Put AI to work, Grow your visibility, Create what you need, Get expert help. Alternating text-and-image rows on desktop; text then image on mobile |
| 7 | Offer box | `sections/Offer.tsx` | Brand gradient (115deg), white text, benefits left, pricing and white CTA right, "See Plan Allowances And Benefits" disclosure |
| 8 | FAQs | `sections/Faq.tsx`, `config/faq.ts` | "A few things to know" / "Before you start." with seven accordion items |
| 9 | Closing CTA and footer | `sections/FinalCta.tsx`, `sections/Footer.tsx` | Closing trial button and offer line; footer with logo, "Command Center by Legiit", Privacy and Terms |

A customer-story component (`sections/CustomerStory.tsx`) sits between the product sections and the offer and renders nothing until `config/story.ts` holds an approved story.

Four trial buttons (header, hero, offer, closing), all rendered by `components/cta/PrimaryCta.tsx`, all linking to exactly `https://legiit.com/command-center/start` with no query parameters. The header button reads "Start Free Trial"; the other three read "Start My 7-Day Free Trial". Only the hero button carries the 25% size increase.

### Hero button size

Standard `lg` buttons are 16px/600 text, 54px minimum height, 15px by 24px padding, 19px icon. The hero size is that scaled by 25%: 20px/700 text with 1.4 line height, 67.5px minimum height, 18.75px by 30px padding, 25px text-to-icon gap, 23.75px icon, 1.25px border, 8.75px radius, solid `#6A13CF` on white, max-width 100%. At 900px and below the text is 18.75px. Below 420px the arrow icon is hidden and below 380px the horizontal padding drops to 20px so the label stays on one line without overflowing. Each CSS property is set by exactly one class per size so nothing overrides these values.

### Brand gradient use

Line 2 of the H1: `linear-gradient(95deg, #6A13CF 12%, #C71E92 98%)` as clipped text. Offer box background: `linear-gradient(115deg, #6A13CF 0%, #C71E92 100%)` with white headings, price, body, and checkmarks, secondary text at `rgba(255,255,255,0.95)`, dividers at 0.26 opacity, trial badge outline at 0.45 opacity, and a white button with `#6A13CF` text. All other buttons are solid `#6A13CF`.

## Reference mapping

The references informed structure only. None of their copy, proof, figures, or images is used, and none is described as a proven winner.

| Reference | Emulated in this layout | Left out |
|-----------|-------------------------|----------|
| Semrush One landing page | Broad platform positioning in the hero; one dominant product visual; four spacious open image/text sections after the hero; proof positioned after the product explanation (the customer-story slot sits between the product sections and the offer); the trial offer repeated in hero, offer, and final section | Its branding, copy, customer figures, trial form, proprietary images |
| GoHighLevel paid-ad page (and its observed variant) | Focused header with one CTA; split hero with the platform message beside a large product demonstration; the trial action and offer terms visible in the hero | Extensive inventories, tiers, borrowed proof, autonomous-AI promises, a 14-day trial |
| Vendasta mid-market page | The narrative order of the four product sections: diagnosis (online position), priorities (Do This Next), tools, Lara and services (execution), and reporting (ongoing management) | Agency and reseller positioning; claims that AI fulfils work on its own |
| Thryv | Business-owner language: each section opens with why an owner would care before naming modules; capability lists stay compact | Its software capabilities, statistics, done-for-you promises, appointment-booking funnel |

## Four-section coverage

| Section | Label | Visual |
|---------|-------|--------|
| Put AI to work on your business. | 01 · Put AI to work | `priorities.jpg`: a real Do This Next recommendation with the Do it with Lara option. No executed Lara task is shown or implied. |
| Get found on Google and in AI answers. | 02 · Grow your visibility | `ai-visibility.jpg`: the actual research, answer, and content tools. No ranking chart. |
| Create the content and visuals your business needs. | 03 · Create what you need | `brief-builder.jpg`, captioned as step 1 before a keyword is chosen, not as finished output. |
| Bring in expert help when you need it. | 04 · Get expert help | `specialist-help.jpg` (route from backlink data to Browse Backlink Services) and `services.jpg` (a recommended service, CSS-framed to the card). Note: "Freelance services are purchased separately." |

The walkthrough adds `visibility.jpg`, `performance.jpg` (N/A values preserved and explained), and a text-only Tasks And Orders chapter because no capture of those screens was supplied.

## Assets

All assets are bundled under `src/assets/` and imported through Vite, so the build is self-contained and the caption track loads same-origin. Nothing has been retouched.

| Asset | Source URL | Where it is used |
|-------|-----------|------------------|
| Official logo | `https://dashboard.legiit.com/frontend/images/project_image/logos/Legiit_Logo_LightBG.png` | Header, footer. The 2253 x 1024 original is kept in `src/assets/`; the page imports a 282 x 128 resize of it (same ratio, 10 KB instead of 50 KB) because it never renders taller than 28 px. Text fallback if it fails. |
| Product overview MP4 (42 s, silent, H.264) | `.../product/command-center-overview.mp4` | Hero video, primary source, native controls, no autoplay |
| Product overview WebM (derived) | Transcoded locally from the supplied MP4 with ffmpeg (VP9, same frames and duration, no edits) | Second `<source>` for browsers without an H.264 decoder |
| English captions (VTT) | `.../product/command-center-overview.vtt` | Attached as the default English caption track |
| Poster | `.../product/command-center-overview-poster.jpg` | Video poster and the fallback image if playback cannot load |
| `visibility.jpg` (872 x 797) | `.../product/visibility.jpg` | Walkthrough chapter 3 |
| `ai-visibility.jpg` (1000 x 818) | `.../product/ai-visibility.jpg` | Section 2, walkthrough chapter 4 |
| `priorities.jpg` (615 x 387) | `.../product/priorities.jpg` | Section 1, walkthrough chapter 2 |
| `specialist-help.jpg` (824 x 220) | `.../product/specialist-help.jpg` | Section 4, walkthrough chapter 6 |
| `services.jpg` (1043 x 283) | `.../product/services.jpg` | Section 4, CSS-framed to the left 42% where the service card sits; the enlarge dialog shows the full image |
| `performance.jpg` (1043 x 211) | `.../product/performance.jpg` | Walkthrough chapter 1 (N/A values preserved) |
| `brief-builder.jpg` (910 x 595) | `.../product/brief-builder.jpg` | Section 3, walkthrough chapter 5 |

`.../product/` is `https://legiit-command-center-growth.chrismwalker.chatgpt.site/product/`.

Every image reserves width and height, below-the-fold images lazy-load, and each product screen has descriptive alt text plus an "Enlarge" control that opens the uncropped capture in an accessible dialog. Screenshots are interface evidence, never customer-results claims. Note that the captures show a specific website's data (as supplied); confirm they are approved for public use before paid launch.

## Product overview and captions

Configured in `src/config/media.ts` under `PRODUCT_OVERVIEW`: `sources` (MP4 first, WebM second, each `{ src, type }`), `poster`, `width`, `height`, `captions` (an array of `{ src, srcLang, label, default }`), the visible caption, and the poster alt text. To replace the recording, swap the files in `src/assets/product/` or point these fields at new imports. If a new MP4 arrives, regenerate the WebM from it (for example `ffmpeg -i overview.mp4 -c:v libvpx-vp9 -b:v 0 -crf 41 -an overview.webm`) or remove the second source. Vite is configured not to inline the `.vtt` file so captions are always served as a same-origin file.

Behaviour (`components/media/ProductOverviewVideo.tsx`): native `<video controls playsInline preload="metadata">` with the poster, no autoplay, the VTT attached as a default English captions track, and events only from real `play`, `timeupdate`, and `ended`. The player sits directly under the hero offer line and is started from its own controls; there is no separate video link beside the trial button. If the media fails to load, the poster stays visible with a plain message and the walkthrough becomes the fallback.

The walkthrough (`components/media/Walkthrough.tsx`, chapters in `config/copy.ts`) is labelled "Explore Command Center" and has Open, Previous, and Next controls plus a chapter list. Seven chapters: Business Overview, Do This Next, Online Visibility, AI Visibility, Content And Visuals, Expert Help, Tasks And Orders. The last chapter has no supplied capture and says so in text. There is no fake timeline and no "Watch" label.

Dialogs (`components/ui/Dialog.tsx`) use the native `<dialog>`: focus moves to the Close control, Tab is contained, Escape closes, focus returns to the opener, page scroll is locked while open, and content unmounts on close.

## Editable content

| File | Contents |
|------|----------|
| `src/config/site.ts` | `CTA_URL`, the two button labels, product name, company line |
| `src/config/offer.ts` | Offer box copy, trial badge, price, account note, additional businesses, separate services, allowances text, hero offer line |
| `src/config/copy.ts` | Hero, intro, the four product sections, closing section, footer, walkthrough chapters |
| `src/config/faq.ts` | FAQ eyebrow, heading, and the seven questions and answers |
| `src/config/media.ts` | Video, captions, poster, screens (with alt text and optional CSS framing) |
| `src/config/story.ts` | The optional customer story (currently `null`) |
| `src/lib/analytics.ts` | Optional no-op event hooks |

## Offer facts used

- 7 days free, then $39/month for one business
- Full business dashboard and support; Business AI, SEO/GEO/AEO, and content tools; 50,000 AI credits each month; tasks, orders, reports and connected analytics
- Additional businesses: $10/month each
- Freelance services purchased separately
- Allowances and benefits, in the disclosure only: 3 audits · 5 keywords · 25 Backlink Data · 50,000 monthly AI credits · 2% back in Legiit Bucks on purchases. Labels are kept as published; only the AI credits state a monthly period.

Not stated anywhere because unverified or prohibited: card requirement, cancellation terms, refunds, annual pricing, unlimited usage, automatic publishing or outreach, guaranteed rankings or AI citations, testimonials, customer logos, performance numbers.

## Inputs still needed before paid launch

1. **Customer story.** `src/config/story.ts` expects `businessName`, `personName`, `role`, `problem`, `used`, `result` (exactly as approved), and `permissionReference`. The section renders between the product sections and the offer once configured. No fabricated or platform-level testimonial may be used in its place.
2. **Trial and billing terms for new users.** Card requirement at trial start, cancellation, refunds, and any annual option. The page currently omits all of them.
3. **Approval of the supplied captures** for public use, given that they show a specific website's data.
4. **Legal links.** The footer links to `https://legiit.com/privacy` and `https://legiit.com/terms`, both checked and returning 200 on September 18, 2026. Confirm they are the intended pages.
5. **Start page handoff.** `https://legiit.com/command-center/start` returned 200 when checked. Confirm it leads to account creation or sign-in, business setup, and the trial terms, as the copy states.

## Measurement

`src/lib/analytics.ts` exposes typed hooks with a no-op default: `cta_click` (placement), `video_play`, `video_progress` (25, 50, 75, each once), `video_complete`, `walkthrough_open`, `walkthrough_step`, `image_enlarge`, `faq_toggle`, `allowances_toggle`. Register a handler with `setAnalyticsHandler` to activate them. No tracker is installed and no credentials exist.

A CTA click is not a signup or an activated trial. Attributing registrations, business setup, activation, and paid subscriptions to this page requires a separate integration on the Legiit side; this mockup does not measure paid customer acquisition. The page carries no campaign or experiment identifiers, so none are forwarded.

## Verification

Run on the production build with `npm run check` (typecheck, 11 content tests, build) and `node qa/check-page.mjs` (156 checks, all passing) at 360, 390, 768, and 1440 px:

- No horizontal overflow at any width; nine body sections in the required order (hero, intro, four product sections, offer, FAQ, closing); four trial buttons, all `https://legiit.com/command-center/start`; the only other outbound links are Privacy and Terms.
- Hero button: 20px/700 text at 1440 and 18.75px at 900 and below, 1.4 line height, 67.5px minimum height, 18.75px by 30px padding, 25px gap, 1.25px declared border, 8.75px radius, solid `#6A13CF` on white, centered, never overflowing, icon 23.75px where shown. Header, pricing, and closing buttons keep standard sizes; the pricing button is white with `#6A13CF` text.
- H1 line 1 dark, line 2 gradient text, exactly two lines at desktop widths and natural wrapping on phones; subhead is 13 words; exactly one hero action; offer box on the 115deg gradient; every button label in Initial Caps; title and meta description set.
- Every image reserves width and height, decodes after scrolling (lazy loading works), and the logo, screenshot, and video fallbacks render when their files are blocked.
- Video: controls on, no autoplay, poster set, metadata loads at 42.0 s, MP4 requested first and served as `video/mp4` (206), WebM served as `video/webm`, VTT served same-origin as `text/vtt`, one English caption track in `showing` mode with 6 cues; playback starts from the player's own control and runs to `ended` at 1280 x 720 with the play, progress, and complete hooks firing from real media events.
- Walkthrough: 7 chapters, focus moves in, Previous disables on chapter 1, Next disables on chapter 7, the last chapter is text-only, the chapter image renders with no horizontal overflow, Escape closes and focus returns to "Explore Command Center".
- Enlarge dialog: one image, Tab stays inside, Close restores focus and releases the scroll lock. "See Plan Allowances And Benefits" and the FAQ open and close by mouse and keyboard. Skip link is first in tab order and 48 px tall when focused. All visible targets are at least 44 px.
- Reduced motion: smooth scrolling and the two icon transitions are disabled under `prefers-reduced-motion`.

Environment note: the headless Chromium used for QA ships without an H.264 decoder, so playback there ran through the WebM fallback source, which is a VP9 transcode of the same supplied MP4 (same frames, same 42 seconds). The MP4 path was verified at the transport level and by inspecting the file (H.264 High, 1280 x 720, 24 fps, 42.00 s, no audio). Confirm MP4 playback once in Chrome, Safari, Firefox, or Edge before launch. `node qa/probe-media.mjs` prints codec support and media responses for any browser you point it at.

## Accessibility notes

Semantic landmarks, one h1, h2 per section, h3 for lists and questions; skip link; visible focus rings; native buttons with `aria-expanded` and `aria-controls` for the FAQ and allowances; native `<dialog>` for the walkthrough and enlarge views; 44px minimum targets; descriptive alt text; body text contrast above 7:1 on white; transitions limited to colour and icon rotation, disabled under `prefers-reduced-motion`, and smooth scrolling disabled there too.
