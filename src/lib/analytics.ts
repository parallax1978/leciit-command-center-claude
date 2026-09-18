import { PAGE_VARIANT, type PageVariant } from '../config/cta'

/**
 * Typed no-op event hooks. Nothing here sends a request, installs a pixel,
 * or reads personal data. Payloads carry only the variant, a placement, and
 * the event-specific value (FAQ state or video milestone).
 *
 * Video events come only from real media element events: `play`,
 * `timeupdate` (25/50/75, once each per viewing session), and `ended`.
 * They are never inferred from a click or a timer. A provider embed exposes
 * none of these, so nothing is emitted for it (see README).
 */
export type VideoMilestone = 25 | 50 | 75

export interface AnalyticsEventMap {
  cta_click: { placement: 'header' | 'hero' | 'offer' }
  faq_toggle: { placement: string; expanded: boolean }
  video_play: { placement: 'hero' }
  video_progress: { placement: 'hero'; milestone: VideoMilestone }
  video_complete: { placement: 'hero' }
}

export type AnalyticsEventName = keyof AnalyticsEventMap

export type AnalyticsEvent<K extends AnalyticsEventName = AnalyticsEventName> = { name: K; variant: PageVariant } & AnalyticsEventMap[K]

export type AnalyticsHandler = (event: AnalyticsEvent) => void

const noop: AnalyticsHandler = () => {}
let handler: AnalyticsHandler = noop

/** Register a handler for a future integration. Call with no argument to restore the no-op. */
export function setAnalyticsHandler(next?: AnalyticsHandler): void {
  handler = next ?? noop
}

export function track<K extends AnalyticsEventName>(name: K, props: AnalyticsEventMap[K]): void {
  const event = { name, variant: PAGE_VARIANT, ...props } as AnalyticsEvent<K>
  if (import.meta.env.DEV) console.debug('[cc-events]', event)
  try {
    handler(event)
  } catch {
    // A faulty handler must never break the page.
  }
}
