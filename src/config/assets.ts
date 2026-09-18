/**
 * Bundled brand and product assets.
 *
 * The product capture is an actual Command Center interface screenshot
 * supplied for this project. It is interface evidence, never a customer
 * result. Source URLs are recorded in the README. Importing through Vite
 * gives hashed, base-aware URLs so the build works under any deploy path.
 */
import logoUrl from '../assets/legiit-logo.png'
import screenshotUrl from '../assets/ai-visibility.jpg'

export const LOGO = {
  src: logoUrl,
  alt: 'Legiit',
  /** Natural size of the supplied light-background logo. */
  width: 2253,
  height: 1024,
  fallbackText: 'Legiit',
} as const

export const PRODUCT_SCREENSHOT = {
  src: screenshotUrl,
  width: 1000,
  height: 818,
  caption: 'Inside Command Center: AI Visibility',
  alt: 'Command Center AI Visibility screen. A progress row lists four steps: See where you stand, Find what to target, Get placed and publish, Track over time. A panel titled "Do you show up in AI answers?" explains that one click checks whether ChatGPT, Gemini, Claude, and Grok mention the business, with a Check my AI visibility button. Below, a Find what to target section lists three tools: Find What to Target, Answer Buyer Questions, and See How AI Answers.',
} as const
