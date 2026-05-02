'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

      // Save to localStorage to track logged-in voter
      localStorage.setItem('currentVoter', JSON.stringify(voter))
      router.push('/voter/dashboard')
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0D1B3E] flex items-center justify-center p-6">
      <div className="bg-[#162447] rounded-lg p-8 w-full max-w-md shadow-xl">
        <a href="/" className="text-[#A0B4CC] text-sm mb-6 block hover:text-white">← Back</a>
        <h1 className="text-2xl font-bold text-white mb-1">Voter Login</h1>
        <p className="text-[#A0B4CC] text-sm mb-6">Enter your email to access your voter dashboard</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[#A0B4CC] text-sm mb-1 block">Email Address</label>
            <input
              className="w-full bg-[#0D1B3E] text-white border border-[#2A3F6A] rounded px-4 py-2 focus:outline-none focus:border-[#E8A020]"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#E8A020] text-[#0D1B3E] font-bold py-3 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-[#A0B4CC] text-sm text-center">
            New voter? <a href="/voter" className="text-[#E8A020] hover:underline">Register here</a>
          </p>
        </div>
      </div>
    </main>
  )
}