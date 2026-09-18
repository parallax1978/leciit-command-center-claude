/**
 * The only place demo media is configured.
 *
 * No finished product recording has been supplied, so every field is empty.
 * Source precedence, resolved by `resolveDemoSource`:
 *   1. `src`      -> native <video> with controls, `poster`, and the `captions` track
 *   2. `embedUrl` -> lazy, click-to-play provider iframe
 *   3. neither    -> the actual product screenshot, labeled "Demo video placeholder"
 */
export interface DemoVideoConfig {
  /** Direct media URL (MP4 or WebM). Takes precedence over embedUrl. */
  src: string
  /** Provider embed URL. Used only when src is empty. */
  embedUrl: string
  /** Poster image for the native player. Falls back to the product screenshot when empty. */
  poster: string
  /** WebVTT caption file for the native player. Leave empty rather than fabricating one. */
  captions: string
}

export const DEMO_VIDEO: DemoVideoConfig = { src: '', embedUrl: '', poster: '', captions: '' }

export type DemoSource = 'native' | 'embed' | 'screenshot'

/** Deterministic source selection. Whitespace-only values count as empty. */
export function resolveDemoSource(config: Pick<DemoVideoConfig, 'src' | 'embedUrl'>): DemoSource {
  if (config.src.trim().length > 0) return 'native'
  if (config.embedUrl.trim().length > 0) return 'embed'
  return 'screenshot'
}
