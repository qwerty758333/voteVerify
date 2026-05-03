'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FullBackground from '@/app/components/FullBackground'
import { buildSobaRegistrationUrl, buildSobaVerificationUrl } from '@/lib/sobaVerifyLink'

export default function VoterDashboardPage() {
  const [voter, setVoter] = useState(null)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('currentVoter')
    if (!stored) {
      router.push('/voter/login')
      return
    }
    const parsed = JSON.parse(stored)
    setVoter(parsed)
    // Auto-check SOBA status when returning after verification
    if (parsed && parsed.email && parsed.sobaVerified !== true) {
      checkStatus(parsed.email)
    }
  }, [router])

  function handleLogout() {
    localStorage.removeItem('currentVoter')
    router.push('/voter/login')
  }

  function refreshVoterFromStorage() {
    const stored = localStorage.getItem('currentVoter')
    if (stored) setVoter(JSON.parse(stored))
  }

  useEffect(() => {
    const onFocus = () => refreshVoterFromStorage()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  async function checkStatus(email) {
    const em = String(email || '').trim()
    if (!em) return

    setStatusLoading(true)
    setStatusMessage('')
    setVerifyError('')

    try {
      const res = await fetch(`/api/soba-status?email=${encodeURIComponent(em)}`)
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setVerifyError(data.error || 'Status check failed.')
        return
      }

      if (data.verified === true) {
        const updatedVoter = { ...voter, sobaVerified: true, verifiedAt: data.updatedAt || new Date().toISOString() }
        localStorage.setItem('currentVoter', JSON.stringify(updatedVoter))
        setVoter(updatedVoter)
        setStatusMessage('✓ Verification confirmed! You are now eligible to vote.')
      } else {
        setStatusMessage('Not verified yet. Complete face scan first.')
      }
    } catch {
      setVerifyError('Network error while checking status.')
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleVerifyIdentity() {
    if (!voter) return
    const em = String(voter.email || '').trim()
    const voterName = String(voter.name || '').trim()
    if (!em || !voterName) {
      setVerifyError('Missing email or name. Please contact support.')
      return
    }

    setVerifyLoading(true)
    setVerifyError('')

    try {
      const res = await fetch('/api/soba-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, name: voterName })
      })
      const data = await res.json().catch(() => ({ success: false, error: 'Invalid response from server' }))

      if (data.success !== true) {
        setVerifyError(data.error || 'Could not register with SOBA. Please try again.')
        return
      }

      const url = buildSobaRegistrationUrl(em)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setVerifyError('Network error. Check your connection and try again.')
    } finally {
      setVerifyLoading(false)
    }
  }

  if (!voter) return <p className="text-slate-400 text-center pt-10">Loading...</p>

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="max-w-[720px] w-full mx-auto relative z-10 py-10 pb-32">
        <div className="flex flex-col items-start w-full">
          <a href="/" className="inline-flex items-center gap-3 text-white bg-[#62609f] active:bg-[#3b3960] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
          </a>

          <div className="w-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Voter Dashboard</h1>
                <p className="text-slate-600 text-sm mt-1">Welcome, {voter.name}</p>
              </div>
              <button type="button" onClick={handleLogout} className="btn btn-danger text-sm py-2 px-4">
                Logout
              </button>
            </div>

            <div className="card mb-6">
              <h2 className="text-xl font-bold mb-6 text-slate-900">Your Information</h2>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-slate-600 text-sm mb-1">Name</p>
                  <p className="text-slate-900 font-semibold text-lg">{voter.name}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm mb-1">NIC</p>
                  <p className="text-slate-900 font-semibold text-lg">{voter.nic}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm mb-1">Email</p>
                  <p className="text-slate-900 font-semibold">{voter.email}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm mb-1">Registration Date</p>
                  <p className="text-slate-900 font-semibold">
                    {new Date(voter.registeredAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-8 mt-4">
                <h3 className="text-xl font-bold mb-4 text-slate-900">Verification Status</h3>
                <div className="flex items-center gap-4">
                  <span className={`badge ${voter.sobaVerified ? 'badge-success' : 'badge-neutral'}`}>
                    {voter.sobaVerified ? '✓ Registered' : '○ Not Registered'}
                  </span>
                  {voter.sobaVerified && (
                    <span className={`badge ${voter.faceVerifiedToday ? 'badge-success' : 'badge-warning'}`}>
                      {voter.faceVerifiedToday ? '✓ Identity Confirmed Today' : '⚠ Face verification required'}
                    </span>
                  )}
                </div>

                {!voter.sobaVerified && (
                  <div className="mt-6 p-5 rounded-xl border border-amber-200 bg-amber-50">
                    <p className="text-amber-950 font-semibold mb-2">Complete Registration</p>
                    <p className="text-sm text-amber-900/90 mb-4">
                      We&apos;ll register you with SOBA, then open the secure portal so you can complete your face scan (
                      <strong>{voter.email}</strong>).
                    </p>

                    {statusLoading && (
                      <p className="text-xs text-amber-900/80 mb-3">Checking SOBA verification status…</p>
                    )}
                    {statusMessage && (
                      <div className="alert alert-success text-sm mb-4">{statusMessage}</div>
                    )}
                    {verifyError && <div className="alert alert-error text-sm mb-4">{verifyError}</div>}

                    <div className="w-full max-w-md">
                      <button
                        type="button"
                        onClick={handleVerifyIdentity}
                        disabled={verifyLoading}
                        className="w-full bg-[#E8A020] text-[#0D1B3E] font-bold py-3 px-4 rounded-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 min-h-[3rem]"
                      >
                        {verifyLoading && (
                          <span
                            className="inline-block h-4 w-4 border-2 border-[#0D1B3E] border-t-transparent rounded-full animate-spin"
                            aria-hidden
                          />
                        )}
                        {verifyLoading ? 'Registering with SOBA…' : 'Verify Identity'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => checkStatus(voter.email)}
                      disabled={statusLoading}
                      className="btn btn-secondary w-full max-w-md mt-3"
                    >
                      {statusLoading ? 'Checking…' : 'Check Verification Status'}
                    </button>
                  </div>
                )}

                {voter.sobaVerified && !voter.faceVerifiedToday && (
                  <div className="mt-6 p-5 rounded-xl border border-blue-200 bg-blue-50">
                    <p className="text-blue-950 font-semibold mb-2">Verify face to vote today</p>
                    <p className="text-sm text-blue-900/90 mb-4">
                      You must verify your face today to be eligible to vote at the station.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const email = voter.email;
                        const url = buildSobaVerificationUrl();
                        localStorage.setItem('pendingLoginEmail', email);
                        window.location.href = url;
                      }}
                      className="w-full bg-[#62609f] text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      Verify Face to Vote Today →
                    </button>
                  </div>
                )}

                {voter.sobaVerified && voter.faceVerifiedToday && (
                  <div className="mt-6 alert alert-success">
                    ✓ Ready to vote
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
