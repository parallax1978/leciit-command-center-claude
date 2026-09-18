import { Header } from './components/sections/Header'
import { Hero } from './components/sections/Hero'
import { Intro } from './components/sections/Intro'
import { ProductSection } from './components/sections/ProductSection'
import { CustomerStory } from './components/sections/CustomerStory'
import { Offer } from './components/sections/Offer'
import { Faq } from './components/sections/Faq'
import { FinalCta } from './components/sections/FinalCta'
import { Footer } from './components/sections/Footer'
import { PRODUCT_SECTIONS } from './config/copy'

export default function App() {
  return (
    <div id="top" className="min-h-dvh bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-canvas focus:px-4 focus:py-3 focus:text-ink focus:shadow-frame btn-focus"
      >
        Skip To Content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Intro />
        {PRODUCT_SECTIONS.map((section) => (
          <ProductSection key={section.id} section={section} />
        ))}
        <CustomerStory />
        <Offer />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
