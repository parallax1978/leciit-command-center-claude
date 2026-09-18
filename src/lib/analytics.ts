/**
 * Optional analytics hooks. Inactive unless a handler is registered; the
 * default is a no-op and nothing is sent anywhere. No tracker is installed.
 *
 * Video events fire only from real media events (play, timeupdate, ended).
 * A CTA click is a click, not a signup or an activated trial. Downstream
 * attribution inside the dashboard is a separate integration (see README).
 */
export type Milestone = 25 | 50 | 75

export interface EventMap {
  cta_click: { placement: 'header' | 'hero' | 'offer' | 'final' }
  video_play: Record<string, never>
  video_progress: { milestone: Milestone }
  video_complete: Record<string, never>
  walkthrough_open: { placement: 'hero' | 'video-fallback' }
  walkthrough_step: { chapterId: string; index: number }
  image_enlarge: { screenId: string }
  faq_toggle: { id: string; expanded: boolean }
  allowances_toggle: { expanded: boolean }
}

export type EventName = keyof EventMap
export type AnalyticsEvent<K extends EventName = EventName> = { name: K } & EventMap[K]
export type AnalyticsHandler = (event: AnalyticsEvent) => void

const noop: AnalyticsHandler = () => {}
let handler: AnalyticsHandler = noop

export function setAnalyticsHandler(next?: AnalyticsHandler): void {
  handler = next ?? noop
}

export function track<K extends EventName>(name: K, props: EventMap[K]): void {
  const event = { name, ...props } as AnalyticsEvent<K>
  if (import.meta.env.DEV) console.debug('[cc-events]', event)
  try {
    handler(event)
  } catch {
    // A faulty handler must never break the page.
  }
}
