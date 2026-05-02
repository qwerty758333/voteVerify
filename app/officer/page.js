'use client'
import { useState, useEffect } from 'react'

export default function OfficerPage() {
  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [marking, setMarking] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  const OFFICER_PIN = '1234'

  function handlePinLogin() {
    if (pin === OFFICER_PIN) {
      setAuthenticated(true)
      setPinError('')
      fetchVoters()
    } else {
      setPinError('Incorrect PIN')
      setPin('')
    }
  }

  useEffect(() => {
    if (authenticated) {
      fetchVoters()
      const interval = setInterval(fetchVoters, 5000)
      return () => clearInterval(interval)
    }
  }, [authenticated])

  async function fetchVoters() {
    try {
      const res = await fetch('/api/voters')
      const data = await res.json()
      setVoters(data)
    } catch (err) {
      console.error('Failed to fetch voters', err)
    } finally {
      setLoading(false)
    }
  }

  async function markAsVoted(id) {
    setMarking(id)
    try {
      const res = await fetch(`/api/voters/${id}/vote`, {
        method: 'PATCH'
      })
      if (!res.ok) throw new Error('Failed to mark voter')
      await fetchVoters()
    } catch (err) {
      alert('Something went wrong.')
    } finally {
      setMarking(null)
    }
  }

  const filtered = voters.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.nic.includes(search)
  )

  const totalVoters = voters.length
  const verifiedCount = voters.filter(v => v.sobaVerified).length
  const votedCount = voters.filter(v => v.hasVoted).length

  // PIN Login Screen
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#0D1B3E] flex items-center justify-center p-6">
        <div className="bg-[#162447] rounded-lg p-8 w-full max-w-md shadow-xl">
          <a href="/" className="text-[#A0B4CC] text-sm mb-6 block hover:text-white">← Back</a>
          <h1 className="text-2xl font-bold text-white mb-1">Officer Login</h1>
          <p className="text-[#A0B4CC] text-sm mb-6">Enter PIN to access the dashboard</p>

          <div className="flex flex-col gap-4">
            <input
              className="w-full bg-[#0D1B3E] text-white border border-[#2A3F6A] rounded px-4 py-3 focus:outline-none focus:border-[#E8A020] text-center text-2xl tracking-widest"
              placeholder="••••"
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handlePinLogin()}
            />
            {pinError && <p className="text-red-400 text-sm text-center">{pinError}</p>}
            <button
              onClick={handlePinLogin}
              className="w-full bg-[#E8A020] text-[#0D1B3E] font-bold py-3 rounded hover:opacity-90"
            >
              Login
            </button>
            <p className="text-[#A0B4CC] text-xs text-center">Demo PIN: 1234</p>
          </div>
        </div>
      </main>
    )
  }

  // Officer Dashboard
  return (
    <main className="min-h-screen bg-[#0D1B3E] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/" className="text-[#A0B4CC] text-sm mb-4 block hover:text-white">← Back</a>
            <h1 className="text-2xl font-bold text-white">Officer Dashboard</h1>
            <p className="text-[#A0B4CC] text-sm">Real-time voter verification status</p>
          </div>
          <button
            onClick={() => {
              setAuthenticated(false)
              setPin('')
            }}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <span className="text-xs text-[#A0B4CC] bg-[#162447] px-3 py-1 rounded-full mb-6 inline-block">
          Auto-refreshes every 5s
        </span>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Registered', value: totalVoters, color: 'text-white' },
            { label: 'SOBA Verified', value: verifiedCount, color: 'text-[#E8A020]' },
            { label: 'Voted', value: votedCount, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#162447] rounded-lg p-4 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-[#A0B4CC] text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          className="w-full bg-[#162447] text-white border border-[#2A3F6A] rounded px-4 py-2 mb-4 focus:outline-none focus:border-[#E8A020]"
          placeholder="Search by name or NIC..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Voter List */}
        {loading ? (
          <p className="text-[#A0B4CC] text-center py-10">Loading voters...</p>
        ) : filtered.length === 0 ? (
          <p className="text-[#A0B4CC] text-center py-10">No voters found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(voter => (
              <div
                key={voter.id}
                className="bg-[#162447] rounded-lg px-5 py-4 flex items-center justify-between border border-[#2A3F6A]"
              >
                {/* Voter Info */}
                <div>
                  <p className="text-white font-semibold">{voter.name}</p>
                  <p className="text-[#A0B4CC] text-sm">NIC: {voter.nic}</p>
                  <p className="text-[#A0B4CC] text-sm">{voter.email}</p>
                </div>

                {/* Status + Action */}
                <div className="flex items-center gap-4">
                  {/* SOBA Verified Badge */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    voter.sobaVerified
                      ? 'bg-[#E8A020] text-[#0D1B3E]'
                      : 'bg-[#2A3F6A] text-[#A0B4CC]'
                  }`}>
                    {voter.sobaVerified ? 'SOBA Verified' : 'Not Verified'}
                  </span>

                  {/* Vote Status / Button */}
                  {voter.hasVoted ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-700 text-green-200">
                      Voted ✓
                    </span>
                  ) : voter.sobaVerified ? (
                    <button
                      onClick={() => markAsVoted(voter.id)}
                      disabled={marking === voter.id}
                      className="text-xs font-bold px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-500 disabled:opacity-50"
                    >
                      {marking === voter.id ? 'Marking...' : 'Mark as Voted'}
                    </button>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-[#2A3F6A] text-[#A0B4CC]">
                      Awaiting Verification
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}