# Command Center pricing page

A redesign of `https://legiit.com/pricing` that also absorbs `https://legiit.com/pricing/agency-plan`, so Business and Agency sit side by side on one page. It uses the landing page's brand system (white canvas, ink type, purple-to-magenta gradient buttons and headline line, Inter). Open it at `/pricing.html` in dev or preview.

Plan data was captured from Legiit's live pages and pricing API on October 27, 2026. Every price, allowance, and route renders from `src/pricing/plans.ts` and the math in `src/pricing/price.ts`, so a price change is one edit.

## Run and check

```bash
npm run check                                     # typecheck, unit tests (incl. src/pricing/*.test.ts), build
npm run preview                                   # serves dist/ at http://localhost:4173
node qa/check-pricing.mjs http://127.0.0.1:4173   # browser QA, 97 checks at 360, 390, 768, 1440 px
```

## Page sequence

| # | Section | File | Notes |
|---|---|---|---|
| 1 | Header | `components/PricingHeader.tsx` | Landing lockup, "Log In" (hidden below 640 px; the footer has it), gradient "Start Free Trial" |
| 2 | Hero | `PricingApp.tsx` | H1 "Try Command Center / Free For 7 Days"; subhead links "choose Agency" to `#agency`; Monthly / Annual switch with "Save 20%" |
| 3 | Plan cards | `components/PlanCard.tsx` | Business (gradient frame, trial pill, gradient button) and Agency (outline button). Price, billing line, button, and a second route come before the six points. Cards align row by row through CSS subgrid |
| 4 | Marketplace band | `components/MarketplaceStrip.tsx` | Free account for buyers and sellers, terms in plain words, no asterisk |
| 5 | Per-business | `components/PerBusiness.tsx` | "One plan for up to 20 businesses." with common setups priced from the monthly rates |
| 6 | Compare | `components/CompareTable.tsx` | Real table with row and column headers, then both plan buttons |
| 7 | Included in both plans | `components/IncludedSection.tsx` | Capabilities from the landing page copy |
| 8 | FAQ | shared `components/sections/Faq.tsx` | Nine answers, all from published plan data or the live trial flow |
| 9 | Closing band | `components/PricingFinal.tsx` | Gradient box, white trial button, outline Agency button |
| 10 | Footer | shared `components/sections/Footer.tsx` | Privacy, Terms, Support, Contact, Log In |

## Destinations

| Button or link | Destination |
|---|---|
| Business trial (card, compare, closing, header, fallbacks) | `https://legiit.com/command-center/start`, no parameters |
| "Subscribe to Business" (for visitors whose trial ended) | `https://legiit.com/sign-in?redirect=%2Fsubscription-purchase%3Fplan%3Dbusiness_dashboard%26billing%3D{monthly or yearly}` |
| "Choose Agency" (card, per-business, compare, closing) | Same pattern with `plan=agency_dashboard` and the selected billing period. This is the pattern Legiit's live Business button uses; the live Agency button drops both values |
| "Create A Free Account" | `https://legiit.com/register` |

Anchors: `#business`, `#agency`, `#per-business`, `#compare`. Redirect `/pricing/agency-plan` to `/pricing#agency` with a 301.

## Billing display

Default is Monthly, so the price beside the trial is the real month-to-month price. Each state says how the price is charged:

- Monthly: "$49 /month. Billed monthly. Save $117.60 a year with annual billing." and "$169 /month. Billed monthly. Save $405.60 a year with annual billing."
- Annual: "$39.20 /month. Billed annually at $470.40. Save $117.60 a year." and "$135.20 /month. Billed annually at $1,622.40. Save $405.60 a year."
- Agency also shows "$8.45 per business per month with all 20 in use" ($6.76 on annual).

Prices are exact (never "$39" or "$169.00"). The comparison table always shows both billing periods.

## Deliberately left out

Unverified, so not stated: card requirement at trial start, whether the trial converts automatically, cancellation, refunds, whether the trial applies to annual billing, add-on pricing on annual plans, the Business add-on cap, definitions of Audits, Keywords, Backlink Data, and AI credits, customer counts, ratings, testimonials, and logos. No "Popular" label, because no data supports one.

## Confirm before launch

1. The landing page says "7 days free. Then $39/month for one business." The month-to-month price is $49; $39.20 is the annual-billed rate. Change the landing copy (for example "Then $49/month, or $39.20/month billed annually") or this page and the ads will disagree.
2. Annual plans are charged once a year at $470.40 and $1,622.40 (the API lists these yearly prices; checkout cannot be viewed signed out).
3. Trial terms: is a card collected, and does the trial convert to paid on its own? If either is true, state it here and in checkout.
4. A trial user can upgrade straight to Agency (the page offers "Try Business free for 7 days, then upgrade to Agency").
5. `/subscription-purchase?plan=agency_dashboard&billing=...` opens Agency checkout after sign-in, and "Register Now" on the sign-in page keeps the redirect.
6. Agency's 50,000 AI credits equal Business's despite up to 20 businesses, and the API's `uptime_monitor_limit` is 1 on Agency versus 5 on Business. Confirm both.
7. Legiit's Terms mention a 3% processing fee on some third-party payments. Confirm whether it applies to subscriptions.

## Tests to run after launch

- Billing default: Monthly versus Annual, judged on paid conversion, revenue per visitor, refunds, and month-3 retention.
- Headline: trial-led H1 versus a plan-led H1 such as "One Business. Or Twenty."
- Measure paid outcomes by plan, billing period, and entry path, not clicks. Events: `plan_cta_click` {plan, billing, placement}, `billing_change`, `faq_toggle` (`src/lib/analytics.ts`, no-op until a handler is registered).
