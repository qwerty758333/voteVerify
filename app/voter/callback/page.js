'use client'
import { useState, useEffect } from 'react'
import FullBackground from '@/app/components/FullBackground'

export default function VoterPage() {
  const [nic, setNic] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister() {
    if (!nic || !email || !name) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/voters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nic, email, name })
      })

      if (!res.ok) throw new Error('Registration failed')

      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Listen for SOBA callback
    const handleSobaCallback = (event) => {
      if (event.data && event.data.type === 'SOBA_VERIFIED') {
        // Voter was verified, update their status
        fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }).then(() => {
          setSubmitted(false)
          setError('')
          alert('Verification complete! You can now vote on polling day.')
          // Reset form
          setNic('')
          setEmail('')
          setName('')
        })
      }
    }

    window.addEventListener('message', handleSobaCallback)
    return () => window.removeEventListener('message', handleSobaCallback)
  }, [email])

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="w-full max-w-[480px] relative z-10 py-10 mx-auto">
        <div className="flex flex-col items-start w-full">
          <a href="/" className="inline-flex items-center gap-3 text-white bg-[#62609f] active:bg-[#3b3960] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
          </a>
          
          <div className="card w-full border-0">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">Voter Registration</h1>
        <p className="text-slate-600 mb-8">Register and verify your identity with SOBA</p>

        {!submitted ? (
          // Step 1 — Fill in details
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-slate-600 font-medium text-sm mb-1.5 block">Full Name</label>
              <input
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium text-sm mb-1.5 block">NIC Number</label>
              <input
                placeholder="e.g. 199512345678"
                value={nic}
                onChange={e => setNic(e.target.value)}
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium text-sm mb-1.5 block">Email Address</label>
              <input
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="flex justify-center mt-2">
              <button
                onClick={handleRegister}
                disabled={loading}
                className="btn btn-primary w-full sm:w-auto min-w-[200px]"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </div>
        ) : (
          // Step 2 — SOBA verification
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-500/30 text-4xl font-bold mb-2">✓</div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Registration Successful!</h2>
              <p className="text-slate-600">Now verify your identity with face recognition.</p>
            </div>

            {/* SOBA Button Container */}
            <div id="poh-button-container" className="w-full flex justify-center my-2" />

            <p className="text-slate-500 text-xs mt-2">Your face will be scanned securely via SOBA's encrypted network</p>
          </div>
        )}
          </div>
        </div>
      </div>
    </main>
  )
}