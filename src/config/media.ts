/**
 * All media on the page, bundled locally so the build is self-contained and
 * captions load same-origin. Every image is an actual Command Center screen.
 * None has been retouched. Alt text describes what is visible.
 */
import overviewMp4 from '../assets/product/command-center-overview.mp4'
import overviewWebm from '../assets/product/command-center-overview.webm'
import overviewVtt from '../assets/product/command-center-overview.vtt?url'
import overviewPoster from '../assets/product/command-center-overview-poster.jpg'
import visibility from '../assets/product/visibility.jpg'
import aiVisibility from '../assets/product/ai-visibility.jpg'
import priorities from '../assets/product/priorities.jpg'
import specialistHelp from '../assets/product/specialist-help.jpg'
import services from '../assets/product/services.jpg'
import performance from '../assets/product/performance.jpg'
import briefBuilder from '../assets/product/brief-builder.jpg'
import logo from '../assets/legiit-logo-128.png'

/** Official logo, resized from the 2253 x 1024 original to 128px tall for the header and footer. Same ratio. */
export const LOGO = {
  src: logo,
  alt: 'Legiit',
  width: 282,
  height: 128,
  fallbackText: 'Legiit',
} as const

export interface CaptionTrack {
  src: string
  srcLang: string
  label: string
  default?: boolean
}

export interface VideoSource {
  src: string
  type: 'video/mp4' | 'video/webm'
}

/**
 * Configuration point for the product overview video and its captions.
 * The supplied MP4 (H.264) is the primary source. The WebM (VP9) is a
 * transcode of that same file, offered second for browsers without an H.264
 * decoder. Same frames, same 42 seconds, no other change.
 */
export const PRODUCT_OVERVIEW = {
  sources: [
    { src: overviewMp4, type: 'video/mp4' },
    { src: overviewWebm, type: 'video/webm' },
  ] as VideoSource[],
  poster: overviewPoster,
  width: 1280,
  height: 720,
  durationSeconds: 42,
  silent: true,
  captions: [{ src: overviewVtt, srcLang: 'en', label: 'English', default: true }] as CaptionTrack[],
  title: 'Command Center product overview',
  /** Visible caption under the player. */
  caption: 'Product overview: 42 seconds, silent, with English captions. Assembled from actual Command Center screens.',
  posterAlt:
    'Poster for the Command Center product overview. Slide 1 of 6 reads "Know where your business stands. SEO, local search, competitors and performance in one workspace" beside the Online Visibility screen.',
} as const

export type ScreenId = 'visibility' | 'ai-visibility' | 'priorities' | 'specialist-help' | 'services' | 'performance' | 'brief-builder'

export interface ProductScreen {
  id: ScreenId
  src: string
  width: number
  height: number
  /** Short name used in dialog titles. */
  name: string
  alt: string
  /**
   * Optional CSS framing for wide captures where the relevant part sits at
   * one side. The full, uncropped image is always shown in the enlarge dialog.
   */
  frame?: { widthFraction: number; position: 'left' | 'center' }
}

export const SCREENS: Record<ScreenId, ProductScreen> = {
  visibility: {
    id: 'visibility',
    src: visibility,
    width: 872,
    height: 797,
    name: 'Online Visibility',
    alt: 'Online Visibility screen open on the Backlinks tab. Tabs read Overview, Rank Tracker, Local Maps, Analytics, Search Console, Backlinks. The Backlink Explorer shows Domain Rating 43, 3.5K live backlinks, 1.1K referring domains, and 71% dofollow, a banner offering to browse backlink services, and a table of referring pages with DR, anchor, and type columns.',
  },
  'ai-visibility': {
    id: 'ai-visibility',
    src: aiVisibility,
    width: 1000,
    height: 818,
    name: 'AI Visibility',
    alt: 'AI Visibility screen. A four-step progress row reads See where you stand, Find what to target, Get placed and publish, Track over time. A panel titled "Do you show up in AI answers?" offers a Check my AI visibility button, and a Find what to target section lists three tools: Find What to Target, Answer Buyer Questions, and See How AI Answers.',
  },
  priorities: {
    id: 'priorities',
    src: priorities,
    width: 615,
    height: 387,
    name: 'Do This Next',
    alt: 'Do This Next card labelled Your next move. The recommendation "Connect your Google Business Profile" is marked High Impact, 5 min. The reason reads "Link your Google Business Profile so we can track your reviews, ratings, and local search presence automatically", with a note that a connected profile unlocks local SEO tools, review monitoring, and map ranking features. Buttons read Go to Business Details, Do it with Lara, and Mark Done, with Skip for now and 6 more tasks links.',
  },
  'specialist-help': {
    id: 'specialist-help',
    src: specialistHelp,
    width: 824,
    height: 220,
    name: 'Backlink data and specialist help',
    alt: 'Backlink summary showing Domain Rating 43, 3.5K live backlinks, 1.1K referring domains, and 71% dofollow, with the note "Showing 200 backlinks of 3.5K total" and a banner reading "Want more backlinks tracked here? Hire a Legiit link-building expert" with a Browse Backlink Services button.',
  },
  services: {
    id: 'services',
    src: services,
    width: 1043,
    height: 283,
    name: 'Recommended services',
    alt: 'Recommended For You panel subtitled "Opportunities Lara spotted in your data", with a Browse All link. One service card is shown: a title about having no analytics, a short description of an SEO professional setting up tracking, and a Set Up My Analytics button.',
    frame: { widthFraction: 0.42, position: 'left' },
  },
  performance: {
    id: 'performance',
    src: performance,
    width: 1043,
    height: 211,
    name: 'Your numbers',
    alt: 'Your numbers panel with eight tiles. Website Visitors shows N/A with a Connect analytics link, Website Health and Avg Keyword Rank show dashes, Open Tasks shows 4, Domain Rating 43, Site Rank 1.2M, Live Backlinks 3.5K, Referring Domains 1.1K.',
  },
  'brief-builder': {
    id: 'brief-builder',
    src: briefBuilder,
    width: 910,
    height: 595,
    name: 'Brief Builder',
    alt: 'Brief Builder tool. Step 1, Choose the keyword, offers a keyword field, suggested keywords from gap analysis, advanced options, and an Analyze and generate content targets button. A side rail lists Choose keyword, Analyze top pages, Create content targets, and Generate content.',
  },
}
