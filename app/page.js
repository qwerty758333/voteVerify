'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <main
        className="min-h-screen flex items-center justify-center p-6 relative"
        style={{
          backgroundImage: 'url(/voting.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/30" />

        <div
          className="relative z-10 w-full flex items-center justify-center"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease'
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '500px',
              margin: '0 auto'
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                padding: '40px',
                textAlign: 'center',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
            >
              <h1
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#000',
                  margin: '0 0 24px 0',
                  letterSpacing: '2px',
                  width: '100%',
                  textAlign: 'center'
                }}
              >
                VOTEVERIFY
              </h1>

              <p
                style={{
                  fontSize: '18px',
                  color: '#333',
                  margin: '0 auto 48px',
                  lineHeight: '1.6',
                  width: '100%',
                  maxWidth: '360px',
                  textAlign: 'center'
                }}
              >
                Secure voter authentication using advanced biometric technology.
                Privacy-preserving voting powered by SOBA Network.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '8px',
                  width: '100%'
                }}
              >
                <a
                  href="/voter/login"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '168px',
                    minWidth: '168px',
                    maxWidth: '168px',
                    height: '44px',
                    padding: '0 12px',
                    boxSizing: 'border-box',
                    fontSize: '14px',
                    margin: 0
                  }}
                >
                  Voter Login
                </a>
                <a
                  href="/voter"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '168px',
                    minWidth: '168px',
                    maxWidth: '168px',
                    height: '44px',
                    padding: '0 12px',
                    boxSizing: 'border-box',
                    fontSize: '14px',
                    margin: 0
                  }}
                >
                  Register
                </a>
                <a
                  href="/officer/login"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '168px',
                    minWidth: '168px',
                    maxWidth: '168px',
                    height: '44px',
                    padding: '0 12px',
                    boxSizing: 'border-box',
                    fontSize: '14px',
                    margin: 0
                  }}
                >
                  Officer
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#111827',
          color: 'white',
          padding: '32px',
          textAlign: 'center',
          zIndex: 50
        }}
      >
        <p style={{ color: '#9CA3AF' }}>
          VoteVerify © 2025 • Secure Voter Authentication Powered by SOBA Network
        </p>
      </footer>
    </>
  )
}
