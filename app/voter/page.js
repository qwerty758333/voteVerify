'use client'
import { useState } from 'react'
import SobaButton from '@/app/components/SobaButton'
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

      if (!res.ok) {
        setError('NIC already registered')
        setLoading(false)
        return
      }

      localStorage.setItem('voterEmail', email)
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="w-full max-w-[480px] relative z-10 py-10 mx-auto">
        <div className="flex flex-col items-start w-full">
          <a href="/" className="inline-flex items-center gap-3 text-white bg-[#62609f] active:bg-[#3b3960] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
          </a>
          
          <div className="w-full">

        {!submitted ? (
          <div className="card">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Register to Vote</h1>
            <p className="text-slate-600 mb-8">Create your voter account</p>

            <div className="space-y-4">
              <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
              <input placeholder="NIC Number" value={nic} onChange={e => setNic(e.target.value)} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

              {error && <div className="alert alert-error">{error}</div>}

              <div className="flex justify-center mt-4">
                <button onClick={handleRegister} disabled={loading} className="btn btn-primary w-full sm:w-auto min-w-[200px]">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>

              <p className="text-center text-slate-600 text-sm">
                Already registered? <a href="/voter/login" className="text-[#4e4d80] font-semibold hover:underline">Sign in</a>
              </p>
            </div>
          </div>
        ) : (
          <div className="card text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <span className="text-3xl text-emerald-600">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Account Created</h2>
            <p className="text-slate-600 mb-6">Now verify your identity with SOBA</p>

            <div id="poh-button-container" className="mb-4" />
            <SobaButton email={email} />

            <p className="text-xs text-slate-500 mt-4">Your data stays with SOBA</p>
          </div>
        )}
          </div>
        </div>
      </div>
    </main>
  )
}