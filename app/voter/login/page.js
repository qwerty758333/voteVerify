'use client'

import { useState, useEffect } from 'react'
import FullBackground from '@/app/components/FullBackground'
import SiteFooter from '@/app/components/SiteFooter'
import { buildSobaVerificationUrl } from '@/lib/sobaVerifyLink'

export default function VoterPortal() {
  const [stage, setStage] = useState('login')
  const [email, setEmail] = useState('')
  const [voter, setVoter] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [voting, setVoting] = useState(false)
  const [returningFromSoba, setReturningFromSoba] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('stage') === 'voting') {
      handleReturnFromSoba()
    }
  }, [])

  useEffect(() => {
    if (stage === 'voting') {
      loadCandidates()
    }
  }, [stage])

  async function handleReturnFromSoba() {
    setReturningFromSoba(true)
    setError('')

    try {
      const stored = localStorage.getItem('currentVoter')
      if (!stored) {
        setError('Session expired. Please log in again.')
        setStage('login')
        return
      }

      const parsed = JSON.parse(stored)
      const res = await fetch('/api/voters/face-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId: parsed.id })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Could not confirm face verification.')
        setStage('login')
        return
      }

      localStorage.setItem('currentVoter', JSON.stringify(data.voter))
      window.location.href = '/voter/voting'
    } catch (err) {
      console.error('Return from SOBA error:', err)
      setError('Something went wrong. Please log in again.')
      setStage('login')
    } finally {
      setReturningFromSoba(false)
    }
  }

  async function handleLogin() {
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/voters')
      const voters = await res.json()
      const found = voters.find(
        v => v.email.toLowerCase().trim() === email.toLowerCase().trim()
      )

      if (!found) {
        setError(
          'Not registered for this event. Please register first at /voter'
        )
        setLoading(false)
        return
      }

      if (found.hasVoted) {
        setError('You have already voted for this event.')
        setLoading(false)
        return
      }

      if (found.faceVerifiedToday) {
        localStorage.setItem('currentVoter', JSON.stringify(found))
        window.location.href = '/voter/voting'
        return
      }

      localStorage.setItem('currentVoter', JSON.stringify(found))
      setVoter(found)
      setStage('face-verify')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleFaceVerify() {
    console.log('handleFaceVerify clicked')

    let activeVoter = voter
    if (!activeVoter?.id) {
      const stored = localStorage.getItem('currentVoter')
      if (stored) {
        try {
          activeVoter = JSON.parse(stored)
          setVoter(activeVoter)
          console.log('Restored voter from localStorage')
        } catch {
          activeVoter = null
        }
      }
    }

    if (!activeVoter?.id) {
      console.error('No voter available — cannot redirect to SOBA')
      setError('Session expired. Please log in again.')
      setStage('login')
      return
    }

    setError('')

    localStorage.setItem('verifyingVoterId', activeVoter.id)
    localStorage.setItem('verifyingVoterEmail', activeVoter.email)
    localStorage.setItem('currentVoter', JSON.stringify(activeVoter))

    console.log('Saved voter to localStorage')
    console.log('Voter ID:', activeVoter.id)
    console.log('Voter Email:', activeVoter.email)

    fetch('/api/events')
      .then(r => r.json())
      .then(events => {
        const sobaUrl =
          events.verificationUrl?.trim() || buildSobaVerificationUrl()

        if (!sobaUrl || sobaUrl === 'undefined') {
          throw new Error('No verification URL configured')
        }

        console.log('Using SOBA URL:', sobaUrl)
        window.location.href = sobaUrl
      })
      .catch(err => {
        console.error('Failed to get SOBA URL', err)
        setError('Failed to load verification portal. Try again.')
      })
  }

  async function loadCandidates() {
    try {
      const res = await fetch('/api/candidates')
      const data = await res.json()
      setCandidates(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load candidates')
    }
  }

  async function handleVote() {
    if (!selectedCandidate) {
      setError('Please select a candidate')
      return
    }

    setVoting(true)
    setError('')

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterId: voter.id,
          choice: selectedCandidate
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to cast vote')
        return
      }

      const updated = { ...voter, hasVoted: true }
      localStorage.setItem('currentVoter', JSON.stringify(updated))
      setVoter(updated)
      setStage('success')
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setVoting(false)
    }
  }

  if (returningFromSoba) {
    return (
      <>
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
        <FullBackground />
        <div className="card text-center relative z-10">
          <p className="text-slate-600">Confirming verification…</p>
        </div>
      </main>
      <SiteFooter />
      </>
    )
  }

  return (
    <>
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="w-full max-w-[480px] relative z-10 py-10 mx-auto">
        <div className="flex flex-col items-start w-full">
          <a
            href="/"
            className="inline-flex items-center gap-3 text-white bg-[#62609f] active:bg-[#3b3960] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>{' '}
            Back to Home
          </a>

          <div className="card w-full">
            {stage === 'login' && (
              <>
                <h1 className="text-3xl font-bold mb-2 text-slate-900">
                  Login to Vote
                </h1>
                <p className="text-slate-600 mb-8">
                  Enter your email to proceed on polling day
                </p>

                <div className="voter-form-controls space-y-4">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="input-btn-match"
                  />

                  {error && (
                    <div className="alert alert-error">{error}</div>
                  )}

                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className="btn btn-primary w-full"
                  >
                    {loading ? 'Checking...' : 'Login'}
                  </button>

                  <p className="text-center text-slate-600 text-sm">
                    Not registered?{' '}
                    <a
                      href="/voter"
                      className="text-[#4e4d80] font-semibold hover:underline"
                    >
                      Register here
                    </a>
                  </p>
                </div>
              </>
            )}

            {stage === 'face-verify' && (
              <div className="text-center">
                <div className="text-5xl mb-4">👤</div>
                <h1 className="text-3xl font-bold mb-2 text-slate-900">
                  Verify Your Identity
                </h1>
                <p className="text-slate-600 mb-2">
                  Welcome, <strong>{voter?.name}</strong>
                </p>
                <p className="text-slate-600 mb-8">
                  Scan your face to confirm your identity before voting
                </p>

                {error && (
                  <div className="alert alert-error mb-4">{error}</div>
                )}

                <button
                  type="button"
                  onClick={handleFaceVerify}
                  className="btn btn-primary w-full mb-4"
                >
                  Verify Face to Vote
                </button>

                <p className="text-xs text-slate-500">
                  You will be redirected to SOBA&apos;s secure portal
                </p>
              </div>
            )}

            {stage === 'voting' && (
              <>
                <h1 className="text-3xl font-bold mb-2 text-slate-900">
                  Cast Your Vote
                </h1>
                <p className="text-slate-600 mb-8">
                  Select your choice and confirm
                </p>

                <div className="space-y-3 mb-6">
                  {candidates.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCandidate(c.name)}
                      className={`w-full p-4 rounded-xl border-2 text-left font-semibold transition ${
                        selectedCandidate === c.name
                          ? 'border-[#62609f] bg-indigo-50 text-[#3730a3]'
                          : 'border-slate-200 hover:border-[#62609f]/50 text-slate-900'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="alert alert-error mb-4">{error}</div>
                )}

                <button
                  type="button"
                  onClick={handleVote}
                  disabled={!selectedCandidate || voting}
                  className="btn btn-primary w-full"
                >
                  {voting ? 'Casting...' : 'Cast Vote'}
                </button>
              </>
            )}

            {stage === 'success' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                  ✓
                </div>
                <h1 className="text-3xl font-bold mb-2 text-slate-900">
                  Vote Cast!
                </h1>
                <p className="text-slate-600 mb-8">
                  Thank you for voting. Your vote has been recorded securely.
                </p>
                <a href="/" className="btn btn-secondary w-full inline-block text-center">
                  Return Home
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
    <SiteFooter />
    </>
  )
}
