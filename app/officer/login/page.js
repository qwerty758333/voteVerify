'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FullBackground from '@/app/components/FullBackground'
import SiteFooter from '@/app/components/SiteFooter'

const OFFICER_PIN = '1234'

export default function OfficerLogin() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleLogin() {
    setLoading(true)
    setError('')

    if (pin === OFFICER_PIN) {
      localStorage.setItem('officerAuthenticated', 'true')
      router.push('/officer')
    } else {
      setError('Incorrect PIN. Try again.')
      setPin('')
    }

    setLoading(false)
  }

  return (
    <>
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="w-full max-w-[480px] relative z-10 py-10 mx-auto">
        <div className="flex flex-col items-start w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-white bg-[#62609f] active:bg-[#3b3960] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap"
          >
            <span>←</span> Back to Home
          </Link>

          <div className="card w-full">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">
              Officer Portal
            </h1>
            <p className="text-slate-600 mb-8">Election administration sign-in</p>

            <div className="voter-form-controls space-y-4">
              <div className="w-full max-w-[var(--voter-field-max-w)]">
                <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                  Security PIN
                </label>
                <input
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  maxLength={4}
                  className="input-btn-match text-center text-xl tracking-[0.35em] font-bold"
                />
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>

              <p className="text-center text-slate-600 text-xs">
                Demo PIN: <span className="font-mono font-bold text-slate-800">1234</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <SiteFooter />
    </>
  )
}
