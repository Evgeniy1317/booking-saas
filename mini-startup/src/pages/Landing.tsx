import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Pricing from '@/components/landing/Pricing'
import CTA from '@/components/landing/CTA'
import CustomWebsite from '@/components/landing/CustomWebsite'
import Footer from '@/components/landing/Footer'
import Header from '@/components/landing/Header'
import Particles from '@/components/landing/Particles'
import loadingAnimation from '@/animation-loading/loading.json'

export default function Landing() {
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    let finished = false
    const finishLoading = () => {
      if (finished) return
      finished = true
      window.setTimeout(() => setShowLoading(false), 150)
    }
    if (document.readyState === 'complete') {
      finishLoading()
    } else {
      window.addEventListener('load', finishLoading)
    }
    const fallback = window.setTimeout(finishLoading, 300)
    return () => {
      window.removeEventListener('load', finishLoading)
      window.clearTimeout(fallback)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-accent/20 relative">
      {showLoading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0b0b0b]">
          <div className="relative flex items-center justify-center">
            <Lottie
              animationData={loadingAnimation}
              loop
              className="w-64 h-64 sm:w-72 sm:h-72"
            />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0b0b0b]" />
          </div>
        </div>
      )}
      {/* Particles - фон для всего лэндинга */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ width: '100vw', height: '100vh' }}>
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <CustomWebsite />
      <Footer />
    </div>
  )
}

