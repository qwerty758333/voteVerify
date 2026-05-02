'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FullBackground from '@/app/components/FullBackground'

export default function VoterLoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/voters')
      const voters = await res.json()
      const voter = voters.find(v => v.email === email)

      if (!voter) {
        setError('Email not found. Please register first.')
        setLoading(false)
        return
      }

      localStorage.setItem('currentVoter', JSON.stringify(voter))
      router.push('/voter/dashboard')
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
          
          <div className="card w-full">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Voter Login</h1>
          <p className="text-slate-600 mb-8">Enter your email to access your account</p>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
            />

            {error && <div className="alert alert-error">{error}</div>}

            <div className="flex justify-center mt-4">
              <button onClick={handleLogin} disabled={loading} className="btn btn-primary w-full sm:w-auto min-w-[200px]">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <p className="text-center text-slate-600 text-sm">
              Don't have an account? <a href="/voter" className="text-[#4e4d80] font-semibold hover:underline">Register</a>
            </p>
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}