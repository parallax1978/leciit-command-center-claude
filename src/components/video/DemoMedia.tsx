import { DEMO_VIDEO, resolveDemoSource } from '../../config/demoVideo'
import { PRODUCT_SCREENSHOT } from '../../config/assets'
import { NativeVideo } from './NativeVideo'
import { EmbedVideo } from './EmbedVideo'
import { ScreenshotState } from './ScreenshotState'

/**
 * The page's single media region. Which state renders is decided by
 * DEMO_VIDEO alone: local src, then provider embed, then the honest
 * screenshot placeholder.
 */
export function DemoMedia() {
  const source = resolveDemoSource(DEMO_VIDEO)
  const poster = DEMO_VIDEO.poster.trim() || PRODUCT_SCREENSHOT.src

  if (source === 'native') return <NativeVideo src={DEMO_VIDEO.src} poster={poster} captions={DEMO_VIDEO.captions} />
  if (source === 'embed') return <EmbedVideo embedUrl={DEMO_VIDEO.embedUrl} poster={poster} />
  return <ScreenshotState />
}
