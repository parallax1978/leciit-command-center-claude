# Legiit Command Center sales page, Version C (AI visibility)

A focused, responsive sales-page mockup for business owners arriving from cold Meta ads. Built in Claude Code, so it is **Version C**: the page sells insight into what AI assistants say about a business, then points to Command Center as the place to act on it.

Headline: **See what AI says about your business.**
Support: *Check your visibility in ChatGPT, Gemini, Claude, and Grok. Use what you learn to choose your next marketing task in Command Center.*

This design is a test hypothesis. Public ad destinations that use a similar shape (focused promise, early product demonstration) do not prove profitable performance.

## Page structure

Minimal header (logo + one CTA), four body sections, small footer:

| # | Section | Component | Notes |
|---|---------|-----------|-------|
| 1 | Hero and one product demonstration | `src/components/sections/Hero.tsx`, `src/components/video/*` | Centered headline, subhead (23 words), primary CTA, "7-day free trial. Then $39/month.", one wide media region |
| 2 | How it works, three steps | `src/components/sections/HowItWorks.tsx` | Add your business, investigate your AI visibility, prepare your next action |
| 3 | One offer | `src/components/sections/Offer.tsx` | $39/month after the 7-day trial, one business, 50,000 monthly AI credits, extra-business price, separate freelance costs, CTA |
| 4 | Five FAQs | `src/components/sections/Faq.tsx`, `src/config/faq.ts` | One disclosure per question; allowances live in the subscription answer |

Conversion buttons: exactly three (header, hero, offer), all rendered by `src/components/cta/PrimaryCta.tsx` with the label "Start my free trial".

Interactivity is limited to: the real video when supplied, the optional full-size screenshot preview, FAQ disclosures, and CTA links. There is no feature grid, capability strip, gallery, tabbed workflow, editable example, copy tool, calculator, website input, storyboard, testimonial section, setup block, closing hero, or sticky mobile CTA.

Page text, including closed FAQ answers and excluding text baked into the screenshot: **410 words** (measured by `qa/check-page.mjs`; limit 550).

## Setup

Requirements: Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serves dist/ at http://localhost:4173
npm test           # vitest: CTA URL builder + media source precedence
npm run check      # typecheck + tests + build
```

Browser QA (developer tool, not shipped): with `npm run preview` running,

```bash
node qa/check-page.mjs http://127.0.0.1:4173
```

It uses `playwright-core` with a locally installed Chromium (set `CHROMIUM_PATH` if auto-detection fails) and writes screenshots to `qa/screenshots/` (git-ignored). It checks 360, 390, 768 and 1440 px for horizontal overflow, section count, media position, word count, CTA hrefs, 44 px targets, FAQ controls, dialog focus behaviour, asset fallbacks, campaign-parameter filtering and reduced motion.

Stack: React 18, TypeScript (strict), Tailwind CSS 3, Vite 5. No backend, scan, AI API, database, payment flow, analytics SDK, pixel, or email form.

## Configuration

All editable content lives in `src/config/`:

| File | What it controls |
|------|------------------|
| `cta.ts` | `CTA_BASE_URL` (`https://dashboard.legiit.com/`), `PAGE_VARIANT` (`'C'`), `PRIMARY_CTA_LABEL` |
| `offer.ts` | Every price, inclusion, allowance label and note. The page reads only from here. |
| `demoVideo.ts` | `DEMO_VIDEO = { src: '', embedUrl: '', poster: '', captions: '' }` and `resolveDemoSource` |
| `assets.ts` | Logo and product screenshot imports, natural sizes, alt text, caption |
| `faq.ts` | The five questions and answers |
| `customerEvidence.ts` | `CUSTOMER_EVIDENCE`, `null` until approved material exists |

### Offer (verified September 18, 2026)

- $39/month after a 7-day free trial
- One business, full dashboard access, and support
- 50,000 monthly AI credits
- Published allowances: 3 audits, 5 keywords, 25 Backlink Data (label kept exact; not delivered backlinks; no reset period is stated because only the AI credits have a verified monthly allowance)
- $10/month for each additional business
- 2% back in Legiit Bucks on purchases
- Freelance services purchased separately

Deliberately absent because unconfirmed: card requirement, cancellation rules, refunds, annual pricing, trial restrictions. Do not add "no credit card required", "cancel anytime", guarantees, or setup-speed promises.

## Assets

| Asset | Source | Bundled at |
|-------|--------|-----------|
| Logo (light background) | `https://dashboard.legiit.com/frontend/images/project_image/logos/Legiit_Logo_LightBG.png` | `src/assets/legiit-logo.png` (2253 x 1024, rendered at natural ratio) |
| AI Visibility screenshot | `https://legiit-command-center-growth.chrismwalker.chatgpt.site/product/ai-visibility.jpg` | `src/assets/ai-visibility.jpg` (1000 x 818) |

The screenshot is an actual interface capture and is presented only as interface evidence, captioned "Inside Command Center: AI Visibility". It is never a customer-results claim, and nothing is layered over it. If the logo fails to load, the header and footer render the word "Legiit". If the screenshot fails, the media region shows a text description, keeps the caption, and hides the full-size preview control.

Note for production: the supplied capture's own text names a specific website. Confirm that capture is approved for public use, or supply a capture from an approved demonstration account.

## The media region

One region, in the hero on every screen size, above How it works and pricing. `DEMO_VIDEO` decides what renders:

| Precedence | Condition | Rendered by | Behaviour |
|-----------|-----------|-------------|-----------|
| 1 | `src` non-empty | `NativeVideo.tsx` | Native `<video controls playsInline preload="metadata">`, click-to-play, no autoplay. `poster` used when set, otherwise the product screenshot. `captions` rendered as a `<track kind="captions" srclang="en" default>` when set. Nothing is fabricated when it is empty. |
| 2 | `embedUrl` non-empty | `EmbedVideo.tsx` | Poster with a "Play the product demo" control. The `<iframe loading="lazy">` is created only after that click, so nothing loads or plays on its own. If a single click should start playback, include the provider's own autoplay parameter in `embedUrl`; the page does not modify the URL. |
| 3 | both empty (current) | `ScreenshotState.tsx` | The screenshot at a readable size, the caption, and the visible label "Demo video placeholder, Product screenshot shown." No play icon, duration, controls, loading state, or "Watch demo" button. Optional "View full-size screenshot" opens only that image in an accessible dialog. |

Dialog behaviour (`src/components/ui/Dialog.tsx`): native `<dialog>` with `showModal()`, focus moved to the visible Close control on open, Tab looped inside, Escape closes, focus returns to the opening control, page scroll lock released, and children unmount on close so any media inside stops.

**Playback verification is pending.** No recording exists, so the native and embed paths were verified by type-check, unit tests of the precedence rule, and code review only. When the recording arrives, verify: controls, caption track, no autoplay, responsive sizing at all four widths, and that the play/progress/complete events fire from real playback.

### Recording brief (production input)

Target length 90 to 120 seconds, recorded in the real product with an approved demonstration business. Do not expose private account, billing, or customer data.

1. Open with the AI visibility question: what do ChatGPT, Gemini, Claude, and Grok say about this business? Run the checkup and show one real finding.
2. Show Do This Next and the relevant recommended action in plain language. If reaching it means navigating between tools, show that navigation. Do not imply an automatic connection between tools that has not been verified.
3. Choose Do it with Lara or open the content tools and show useful work being prepared (a brief or a draft). Include the owner reviewing it. No automatic publishing or website changes.
4. Show the relevant freelance-service category the owner could explore, state that services are purchased separately, and close on the 7-day free trial and $39/month. No freelancer is selected, assigned, purchased, or shown completing the task.

Deliver as MP4 (H.264) plus a WebVTT caption file and a poster frame, then fill `DEMO_VIDEO`.

## Missing production inputs

1. The finished product recording (`src`, `poster`, `captions`) or an approved `embedUrl`.
2. Approved customer evidence, if any: one brief quote or substantiated result with written publication permission and named attribution. Set `CUSTOMER_EVIDENCE` in `src/config/customerEvidence.ts`; it renders under the media region. Until then nothing renders, by design.
3. Confirmation of new-user billing terms before paid launch: card requirement at trial start, cancellation, refunds, annual pricing.
4. Confirmation that `https://dashboard.legiit.com/` presents the sign-in handoff and preserves the query string through account access and setup (see Measurement).
5. Approval of the supplied screenshot for public use (see Assets).

## CTA attribution

`src/lib/ctaUrl.ts` builds every CTA href with `URL` and `URLSearchParams` from the fixed base `https://dashboard.legiit.com/`.

- Forwarded only: inbound `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` whose value matches `^[a-zA-Z0-9._~-]{1,128}$`. Malformed values are dropped, not sanitized.
- Every other incoming parameter is discarded, including names, emails, phone numbers, business URLs, account identifiers, tokens, and click identifiers such as `fbclid`.
- `cc_variant=C` is always set by the page. An incoming `cc_variant` is ignored.
- Hostname and path never come from visitor input.

| Page URL query | CTA href |
|----------------|----------|
| (none) | `https://dashboard.legiit.com/?cc_variant=C` |
| `?utm_source=meta&utm_campaign=cc-ai-2026.q3` | `https://dashboard.legiit.com/?utm_source=meta&utm_campaign=cc-ai-2026.q3&cc_variant=C` |
| `?utm_content=bad%20value&email=x%40y.com&fbclid=abc&cc_variant=A` | `https://dashboard.legiit.com/?cc_variant=C` |

`URLSearchParams` serialises `~` as `%7E`; the dashboard receives the same value after decoding. Tests: `src/lib/ctaUrl.test.ts` (no UTMs, valid UTMs, unsupported parameters, malformed values, destination and variant override attempts). UTMs must carry campaign labels, never personal data.

## Events (no-op hooks)

`src/lib/analytics.ts` exports typed hooks with a no-op default handler. Nothing is sent anywhere. A future integration registers a handler with `setAnalyticsHandler(fn)`; in development the events are logged to the console.

| Event | Payload | Fired from |
|-------|---------|-----------|
| `cta_click` | `variant`, `placement` (`header`, `hero`, `offer`) | The three CTA links |
| `faq_toggle` | `variant`, `placement` (`faq:<id>`), `expanded` | Each FAQ disclosure |
| `video_play` | `variant`, `placement` (`hero`) | Real `play` event, once per mount |
| `video_progress` | `variant`, `placement`, `milestone` (25, 50, 75) | Real `timeupdate` events, each milestone once per mount |
| `video_complete` | `variant`, `placement` | Real `ended` event |

Playback is never inferred from a click or a timer. A provider embed exposes no trustworthy playback events, so nothing is emitted for it; integrating a provider's player API would be a separate task.

## Measurement handoff (dashboard team)

Button clicks and video plays are diagnostic. The comparison between pages A, B and C must follow accounts, setup, activation and paying customers by variant.

1. **At dashboard entry** validate the same allow-list (`utm_*` matching the slug rule, `cc_variant` in `A|B|C`), then create an opaque first-party attribution record (random ID, stored server-side) and preserve it through sign-in, registration and business setup. Keep customer identifiers out of public URLs.
2. **Authoritative downstream events**, each linked to the attribution record on the server, with deduplicated event IDs:

| Event | Authoritative trigger | Purpose |
|-------|----------------------|---------|
| `register` | Account service confirms a completed registration, once per account | New accounts attributable to the page |
| `business_add` | Dashboard confirms a saved business profile, once per business | Completion of business setup |
| `first_task` | Server confirms the first agreed useful output or task is saved (for example a saved brief or a saved AI-visibility analysis), not a page view, tool open or click | Activation |
| `paid` | Billing confirms the first successful subscription charge, with real value and currency, excluding trial starts and checkout clicks | Paying customers |

3. Set the attribution window and first-touch/last-touch rule explicitly, and use one activation definition across A, B and C.

## Verification performed

- `npm run typecheck`, `npm test` (13 tests) and `npm run build` pass.
- `qa/check-page.mjs` at 360, 390, 768 and 1440 px: no horizontal overflow, four body sections, media region above How it works, 410 words, three CTAs with identical hrefs, all visible targets at least 44 px, logo and screenshot loaded, FAQ open/close by mouse and keyboard, dialog focus in/loop/Escape/restore, scroll lock released, campaign parameters filtered as specified, skip link first in tab order, image fallbacks render.
- Reduced motion: the only transitions are colour and the FAQ icon rotation, both disabled under `prefers-reduced-motion`.
- Pending: real playback verification (no recording supplied).

## Accessibility notes

Semantic landmarks and heading order (h1, then h2 per section, h3 for steps, FAQ questions and the inclusions list), skip link, visible focus rings, native buttons with `aria-expanded`/`aria-controls` for FAQs, native `<dialog>` for the preview, 44 px minimum targets, `alt` text describing the screenshot, colour contrast of body text above 7:1 on white.
