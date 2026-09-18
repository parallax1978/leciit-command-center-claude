import { Header } from './components/sections/Header'
import { Hero } from './components/sections/Hero'
import { HowItWorks } from './components/sections/HowItWorks'
import { Offer } from './components/sections/Offer'
import { Faq } from './components/sections/Faq'
import { Footer } from './components/sections/Footer'

export default function App() {
  return (
    <div id="top" className="min-h-dvh bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-canvas focus:px-4 focus:py-3 focus:text-ink focus:shadow-frame btn-focus"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Offer />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
