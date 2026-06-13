'use client'
import { useEffect, useState } from 'react'
import SiteFooter from '@/app/components/SiteFooter'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <main className="landing-main min-h-screen flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-black/30" />

        <div
          className={`landing-fade-in relative z-10 w-full flex items-center justify-center ${
            mounted ? 'landing-fade-in--visible' : ''
          }`}
        >
          <div className="landing-container">
            <div className="landing-card">
              <h1 className="landing-title">VOTEVERIFY</h1>

              <p className="landing-subtitle">
                Secure voter authentication using advanced biometric technology.
                Privacy-preserving voting powered by SOBA Network.
              </p>

              <div className="landing-actions">
                <a href="/voter/login" className="btn btn-primary landing-nav-btn">
                  Voter Login
                </a>
                <a href="/voter" className="btn btn-primary landing-nav-btn">
                  Register
                </a>
                <a href="/officer/login" className="btn btn-primary landing-nav-btn">
                  Officer
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
