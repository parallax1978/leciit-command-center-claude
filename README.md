# Legiit Command Center landing page

A complete, responsive landing page for cold paid traffic from business owners who do not yet know Legiit. It explains what Command Center does, demonstrates the actual product, and starts a 7-day free trial at `https://dashboard.legiit.com/`.

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

| # | Section | Component | Media |
|---|---------|-----------|-------|
| 1 | Focused header | `sections/Header.tsx` | Official logo, "Command Center" label, trial CTA |
| 1 | Split hero | `sections/Hero.tsx` | Exact headline and support copy, primary CTA, "Then $39/month for one business.", quiet "Watch product overview" action, the actual product overview video |
| 2 | Company credibility line | inside `Hero.tsx` | "From Legiit. Connecting businesses and freelancers since 2018." (Legiit history, not a Command Center claim) |
| 3 | Understand your online position | `sections/ProductSection.tsx` (data in `config/copy.ts`) | `visibility.jpg` |
| 3 | Know what deserves attention | same | `priorities.jpg` |
| 3 | Get the marketing work done | same | `specialist-help.jpg`, `services.jpg` (CSS-framed to the relevant card) |
| 3 | Keep work and progress connected | same | `performance.jpg` |
| 4 | Customer story | `sections/CustomerStory.tsx` | Renders nothing until `config/story.ts` holds an approved story |
| 5 | Offer | `sections/Offer.tsx` | 7-day free trial, then $39/month for one business, allowances disclosure |
| 6 | FAQ and final trial action | `sections/Faq.tsx`, `sections/FinalCta.tsx`, `sections/Footer.tsx` | Six questions, closing CTA, minimal footer |

Four commercial CTAs (header, hero, offer, final), all rendered by `components/cta/PrimaryCta.tsx`, all linking to exactly `https://dashboard.legiit.com/`. The header shows the shorter "Start free trial" label below 640px because the full label does not fit beside the logo and product label.

## Reference mapping

The references informed structure only. None of their copy, proof, figures, or images is used, and none is described as a proven winner.

| Reference | Emulated in this layout | Left out |
|-----------|-------------------------|----------|
| Semrush One landing page | Broad platform positioning in the hero; one dominant product visual; four spacious open image/text sections after the hero; proof positioned after the product explanation (the customer-story slot sits between the product sections and the offer); the trial offer repeated in hero, offer, and final section | Its branding, copy, customer figures, trial form, proprietary images |
| GoHighLevel paid-ad page (and its observed variant) | Focused header with one CTA; split hero with the platform message beside a large product demonstration; the trial action and offer terms visible in the hero | Extensive inventories, tiers, borrowed proof, autonomous-AI promises, a 14-day trial |
| Vendasta mid-market page | The narrative order of the four product sections: diagnosis (online position), priorities (Do This Next), tools, Lara and services (execution), and reporting (ongoing management) | Agency and reseller positioning; claims that AI fulfils work on its own |
| Thryv | Business-owner language: each section opens with why an owner would care before naming modules; capability lists stay compact | Its software capabilities, statistics, done-for-you promises, appointment-booking funnel |

## Four-section capability coverage

| Section | Verified scope covered |
|---------|------------------------|
| Understand your online position | Website and SEO health with technical and on-page checks, keywords and backlinks, search and AI visibility, local presence and reviews, competitor research, connected performance data. Business context (details, offers, audiences, brand voice, competitors, focus keywords) is named in the note under the lead. |
| Know what deserves attention | Business overview and Legiit Score, Do This Next, reasons and impact, strategy playbooks, prioritized tasks. The note connects the finding in the screenshot (an unconnected Google Business Profile) to its recommended action. |
| Get the marketing work done | Three routes: the tools (research, marketing, SEO and visibility, content briefs, editor, social content), Lara assistance with owner review, and hiring a relevant Legiit freelancer, purchased separately. |
| Keep work and progress connected | Tasks, orders, reports, connected analytics. The screenshot's N/A values are preserved and explained. |

Content research and writing appear only as one item within execution and as one walkthrough chapter (Brief Builder). They are never the hero or the central proposition.

## Assets

All assets are bundled under `src/assets/` and imported through Vite, so the build is self-contained and the caption track loads same-origin. Nothing has been retouched.

| Asset | Source URL | Where it is used |
|-------|-----------|------------------|
| Official logo | `https://dashboard.legiit.com/frontend/images/project_image/logos/Legiit_Logo_LightBG.png` | Header, footer. The 2253 x 1024 original is kept in `src/assets/`; the page imports a 282 x 128 resize of it (same ratio, 10 KB instead of 50 KB) because it never renders taller than 28 px. Text fallback if it fails. |
| Product overview MP4 (42 s, silent, H.264) | `.../product/command-center-overview.mp4` | Hero video, primary source, native controls, no autoplay |
| Product overview WebM (derived) | Transcoded locally from the supplied MP4 with ffmpeg (VP9, same frames and duration, no edits) | Second `<source>` for browsers without an H.264 decoder |
| English captions (VTT) | `.../product/command-center-overview.vtt` | Attached as the default English caption track |
| Poster | `.../product/command-center-overview-poster.jpg` | Video poster and the fallback image if playback cannot load |
| `visibility.jpg` (872 x 797) | `.../product/visibility.jpg` | Section 1, walkthrough chapter 2 |
| `ai-visibility.jpg` (1000 x 818) | `.../product/ai-visibility.jpg` | Walkthrough chapter 3 |
| `priorities.jpg` (615 x 387) | `.../product/priorities.jpg` | Section 2, walkthrough chapter 4 |
| `specialist-help.jpg` (824 x 220) | `.../product/specialist-help.jpg` | Section 3, walkthrough chapter 6 |
| `services.jpg` (1043 x 283) | `.../product/services.jpg` | Section 3, CSS-framed to the left 42% where the service card sits; the enlarge dialog shows the full image |
| `performance.jpg` (1043 x 211) | `.../product/performance.jpg` | Section 4, walkthrough chapter 1 (N/A values preserved) |
| `brief-builder.jpg` (910 x 595) | `.../product/brief-builder.jpg` | Walkthrough chapter 5 only, as one tool |

`.../product/` is `https://legiit-command-center-growth.chrismwalker.chatgpt.site/product/`.

Every image reserves width and height, below-the-fold images lazy-load, and each product screen has descriptive alt text plus an "Enlarge" control that opens the uncropped capture in an accessible dialog. Screenshots are interface evidence, never customer-results claims. Note that the captures show a specific website's data (as supplied); confirm they are approved for public use before paid launch.

## Product overview and captions

Configured in `src/config/media.ts` under `PRODUCT_OVERVIEW`: `sources` (MP4 first, WebM second, each `{ src, type }`), `poster`, `width`, `height`, `captions` (an array of `{ src, srcLang, label, default }`), the visible caption, and the poster alt text. To replace the recording, swap the files in `src/assets/product/` or point these fields at new imports. If a new MP4 arrives, regenerate the WebM from it (for example `ffmpeg -i overview.mp4 -c:v libvpx-vp9 -b:v 0 -crf 41 -an overview.webm`) or remove the second source. Vite is configured not to inline the `.vtt` file so captions are always served as a same-origin file.

Behaviour (`components/media/ProductOverviewVideo.tsx`): native `<video controls playsInline preload="metadata">` with the poster, no autoplay, the VTT attached as a default English captions track, and events only from real `play`, `timeupdate`, and `ended`. "Watch product overview" in the hero scrolls to the player, focuses it, and starts playback from that click. If the media fails to load, the poster stays visible with a plain message and the walkthrough becomes the fallback.

The walkthrough (`components/media/Walkthrough.tsx`, chapters in `config/copy.ts`) is labelled "Explore Command Center" and has Open, Previous, and Next controls plus a chapter list. Seven chapters: business overview, online visibility, AI visibility, a useful priority, tools and Lara, access to specialists, ongoing work. The last chapter has no supplied capture and says so in text. There is no fake timeline and no "Watch" label.

Dialogs (`components/ui/Dialog.tsx`) use the native `<dialog>`: focus moves to the Close control, Tab is contained, Escape closes, focus returns to the opener, page scroll is locked while open, and content unmounts on close.

## Editable content

| File | Contents |
|------|----------|
| `src/config/site.ts` | `CTA_URL`, CTA labels, product name, company line |
| `src/config/offer.ts` | Trial and price wording, what the subscription covers, separate services, additional businesses, allowance labels |
| `src/config/copy.ts` | Hero, the four product sections, offer headings, final CTA, footer, walkthrough chapters |
| `src/config/faq.ts` | The six questions and answers |
| `src/config/media.ts` | Video, captions, poster, screens (with alt text and optional CSS framing) |
| `src/config/story.ts` | The optional customer story (currently `null`) |
| `src/lib/analytics.ts` | Optional no-op event hooks |

## Offer facts used

- 7-day free trial, then $39/month for one business
- Freelancer services are purchased separately
- Additional businesses are $10/month each
- Allowances, in the disclosure only: 3 audits, 5 keywords, 25 Backlink Data, 50,000 AI credits per month. Labels are kept as published; only the AI credits have a confirmed monthly reset, so no other period is stated.

Not stated anywhere because unverified: card requirement, cancellation terms, refunds, annual pricing, onboarding or support times, integrations.

## Inputs still needed before paid launch

1. **Customer story.** `src/config/story.ts` expects `businessName`, `personName`, `role`, `problem`, `used`, `result` (exactly as approved), and `permissionReference`. The section renders between the product sections and the offer once configured. No fabricated or platform-level testimonial may be used in its place.
2. **Trial and billing terms for new users.** Card requirement at trial start, cancellation, refunds, and any annual option. The page currently omits all of them.
3. **Approval of the supplied captures** for public use, given that they show a specific website's data.
4. **Legal links.** The footer has none until their destinations are verified.
5. **Dashboard handoff check.** Confirm `https://dashboard.legiit.com/` presents account access before business setup for signed-out visitors, as the copy states.

## Measurement

`src/lib/analytics.ts` exposes typed hooks with a no-op default: `cta_click` (placement), `video_play`, `video_progress` (25, 50, 75, each once), `video_complete`, `walkthrough_open`, `walkthrough_step`, `image_enlarge`, `faq_toggle`, `allowances_toggle`. Register a handler with `setAnalyticsHandler` to activate them. No tracker is installed and no credentials exist.

A CTA click is not a signup or an activated trial. Attributing registrations, business setup, activation, and paid subscriptions to this page requires a separate integration inside the Legiit dashboard; this mockup does not measure paid customer acquisition.

## Verification

Run on the production build with `npm run check` and `node qa/check-page.mjs` (113 checks, all passing) at 360, 390, 768, and 1440 px:

- No horizontal overflow at any width; eight body sections in the required order; four CTAs, all `https://dashboard.legiit.com/`; no other external links.
- Every image reserves width and height, decodes after scrolling (lazy loading works), and the logo, screenshot, and video fallbacks render when their files are blocked.
- Video: controls on, no autoplay, poster set, metadata loads at 42.0 s, the MP4 is requested first and served as `video/mp4` (206), the VTT is served same-origin as `text/vtt`, one English caption track is attached in `showing` mode with 6 cues. "Watch product overview" scrolls the player into view and starts playback from the click; playback runs to `ended` at 1280 x 720 and the play, progress, and complete hooks fire from real media events.
- Walkthrough: 7 chapters, focus moves in, Previous disables on chapter 1, Next disables on chapter 7, the last chapter is text-only, Escape closes and focus returns to "Explore Command Center".
- Enlarge dialog: one image, Tab stays inside, Close restores focus and releases the scroll lock. Allowances disclosure and FAQ open and close by mouse and keyboard. Skip link is first in tab order and 48 px tall when focused. All visible targets are at least 44 px.
- Reduced motion: smooth scrolling and the two icon transitions are disabled under `prefers-reduced-motion`.

Environment note: the headless Chromium used for QA ships without an H.264 decoder (`canPlayType('video/mp4; codecs="avc1.42E01E"')` returns an empty string), so playback there ran through the WebM fallback source, which is a VP9 transcode of the same supplied MP4 (same frames, same 42 seconds). The MP4 path was verified at the transport level (requested first, served correctly) and by inspecting the file (H.264 High, 1280 x 720, 24 fps, 42.00 s, no audio). Confirm MP4 playback once in Chrome, Safari, Firefox, or Edge before launch. `node qa/probe-media.mjs` prints the codec support and media responses for any browser you point it at.

## Accessibility notes

Semantic landmarks, one h1, h2 per section, h3 for lists and questions; skip link; visible focus rings; native buttons with `aria-expanded` and `aria-controls` for the FAQ and allowances; native `<dialog>` for the walkthrough and enlarge views; 44px minimum targets; descriptive alt text; body text contrast above 7:1 on white; transitions limited to colour and icon rotation, disabled under `prefers-reduced-motion`, and smooth scrolling disabled there too.
