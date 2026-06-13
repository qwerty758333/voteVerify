'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FullBackground from '@/app/components/FullBackground'
import SiteFooter from '@/app/components/SiteFooter'

export default function VotingPage() {
  const router = useRouter()
  const [voter, setVoter] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [voting, setVoting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const voterStr = localStorage.getItem('currentVoter')

    if (!voterStr) {
      router.replace('/voter/login')
      return
    }

    const v = JSON.parse(voterStr)

    if (!v.faceVerifiedToday) {
      console.log('Face not verified today')
      router.push('/voter/login')
      return
    }

    if (v.hasVoted) {
      router.replace('/voter/login')
      return
    }

    setVoter(v)
    loadCandidates()
  }, [router])

  async function loadCandidates() {
    try {
      const res = await fetch('/api/candidates')
      const data = await res.json()
      setCandidates(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  async function handleVote() {
    if (!selectedCandidate || !voter) {
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

      setSuccess(true)
      setTimeout(() => {
        localStorage.removeItem('currentVoter')
        localStorage.removeItem('pendingVoterId')
        router.replace('/')
      }, 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <>
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
        <FullBackground />
        <div className="card text-center relative z-10">
          <p className="text-slate-600">Loading ballot…</p>
        </div>
      </main>
      <SiteFooter />
      </>
    )
  }

  if (success) {
    return (
      <>
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
        <FullBackground />
        <div className="card text-center relative z-10 max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 border border-green-200">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Vote cast</h1>
          <p className="text-slate-600 mb-2">
            Thank you for voting. Your ballot has been recorded securely.
          </p>
          <p className="text-slate-500 text-sm">Redirecting home…</p>
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
        <div className="card w-full">
          <h1 className="text-3xl font-bold mb-2 text-slate-900 text-center">
            Cast Your Vote
          </h1>
          <p className="text-slate-600 mb-8 text-center">
            Welcome, <strong>{voter?.name}</strong>. Select your choice below.
          </p>

          <div className="space-y-5 mb-6">
            {candidates.length === 0 ? (
              <p className="text-center text-slate-500 py-6">
                No candidates available for this event.
              </p>
            ) : (
              candidates.map(c => (
                <button
                  key={c.id ?? c.name}
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
              ))
            )}
          </div>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          <button
            type="button"
            onClick={handleVote}
            disabled={!selectedCandidate || voting || candidates.length === 0}
            className="btn btn-primary w-full"
          >
            {voting ? 'Casting…' : 'Cast Vote'}
          </button>

          <p className="text-center mt-6">
            <Link href="/voter/login" className="text-sm text-[#4e4d80] font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </main>
    <SiteFooter />
    </>
  )
}
