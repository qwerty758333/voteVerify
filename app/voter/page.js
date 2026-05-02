'use client'
import { useState, useEffect } from 'react'
import SobaButton from '@/app/components/SobaButton'

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
        localStorage.setItem('voterEmail', email)
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
    <main className="min-h-screen bg-[#0D1B3E] flex items-center justify-center p-6">
      <div className="bg-[#162447] rounded-lg p-8 w-full max-w-md shadow-xl">
        
        {/* Header */}
        <a href="/" className="text-[#A0B4CC] text-sm mb-6 block hover:text-white">← Back</a>
        <h1 className="text-2xl font-bold text-white mb-1">Voter Registration</h1>
        <p className="text-[#A0B4CC] text-sm mb-6">Register and verify your identity with SOBA</p>

        {!submitted ? (
          // Step 1 — Fill in details
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[#A0B4CC] text-sm mb-1 block">Full Name</label>
              <input
                className="w-full bg-[#0D1B3E] text-white border border-[#2A3F6A] rounded px-4 py-2 focus:outline-none focus:border-[#E8A020]"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[#A0B4CC] text-sm mb-1 block">NIC Number</label>
              <input
                className="w-full bg-[#0D1B3E] text-white border border-[#2A3F6A] rounded px-4 py-2 focus:outline-none focus:border-[#E8A020]"
                placeholder="e.g. 199512345678"
                value={nic}
                onChange={e => setNic(e.target.value)}
              />
            </div>
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
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-[#E8A020] text-[#0D1B3E] font-bold py-3 rounded hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        ) : (
          // Step 2 — SOBA verification
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 bg-[#E8A020] rounded-full flex items-center justify-center text-[#0D1B3E] text-2xl font-bold">✓</div>
            <div>
              <h2 className="text-white font-bold text-lg mb-1">Registration Successful!</h2>
              <p className="text-[#A0B4CC] text-sm">Now verify your identity with face recognition.</p>
            </div>

            {/* SOBA Button Container */}
            <div id="poh-button-container" className="w-full" />
            <SobaButton />

            <p className="text-[#A0B4CC] text-xs">Your face will be scanned securely via SOBA's encrypted network</p>
          </div>
        )}
      </div>
    </main>
  )
}