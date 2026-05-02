'use client'
import { useState, useEffect } from 'react'
import FullBackground from '@/app/components/FullBackground'

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
      const res = await fetch(`/api/voters/${id}/vote`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed')
      await fetchVoters()
    } catch (err) {
      alert('Something went wrong')
    } finally {
      setMarking(null)
    }
  }

  const filtered = voters.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) || v.nic.includes(search)
  )

  const totalVoters = voters.length
  const verifiedCount = voters.filter(v => v.sobaVerified).length
  const votedCount = voters.filter(v => v.hasVoted).length

  if (!authenticated) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
        <FullBackground />
        <div className="w-full max-w-[480px] relative z-10 py-10 mx-auto">
          <div className="flex flex-col items-start w-full">
            <a href="/" className="inline-flex items-center gap-3 text-white bg-[#62609f] active:bg-[#3b3960] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap">
              <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
            </a>
            
            <div className="w-full">

          <div className="card">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Officer Access</h1>
            <p className="text-slate-600 mb-8">Enter PIN</p>

            <input
              type="password"
              placeholder="••••"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handlePinLogin()}
              maxLength="4"
              className="text-center text-3xl tracking-widest mb-4 font-bold"
            />

            {pinError && <div className="alert alert-error">{pinError}</div>}

            <div className="flex justify-center mt-4 mb-4">
              <button onClick={handlePinLogin} className="btn btn-primary w-full sm:w-auto min-w-[200px]">Login</button>
            </div>

            <p className="text-xs text-slate-400 text-center">Demo PIN: 1234</p>
          </div>
          </div>
        </div>
      </div>
    </main>
    )
  }

  return (
    <main className="flex-1 w-full flex flex-col items-center justify-start py-12 px-6 relative">
      <FullBackground />
      <div className="max-w-6xl w-full mx-auto relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <a href="/" className="inline-flex items-center gap-3 text-white bg-[#62609f] hover:bg-[#4e4d80] font-bold mb-10 px-8 py-3.5 rounded-full transition-all text-base group shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap">
              <span className="transition-transform group-hover:-translate-x-1">←</span> Dashboard Home
            </a>
            <h1 className="text-4xl font-bold text-slate-900">Officer Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage voter verification</p>
          </div>
          <button
            onClick={() => { setAuthenticated(false); setPin('') }}
            className="btn btn-danger"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Registered', value: totalVoters },
            { label: 'SOBA Verified', value: verifiedCount },
            { label: 'Voted', value: votedCount }
          ].map(({ label, value }) => (
            <div key={label} className="card">
              <p className="text-slate-400 text-sm mb-2">{label}</p>
              <p className="text-4xl font-bold text-[#8180b3]">{value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            placeholder="🔍 Search by name or NIC..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Voters */}
        {loading ? (
          <div className="card text-center text-slate-600">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center text-slate-600">No voters</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(voter => (
              <div key={voter.id} className="card flex justify-between items-center hover:shadow-lg">
                <div>
                  <p className="font-semibold text-slate-900">{voter.name}</p>
                  <p className="text-sm text-slate-600">NIC: {voter.nic} • {voter.email}</p>
                </div>

                <div className="flex gap-3">
                  <span className={`badge ${voter.sobaVerified ? 'badge-success' : 'badge-neutral'}`}>
                    {voter.sobaVerified ? '✓ Verified' : '○ Not Verified'}
                  </span>

                  {voter.hasVoted ? (
                    <span className="badge badge-primary">✓ Voted</span>
                  ) : voter.sobaVerified ? (
                    <button
                      onClick={() => markAsVoted(voter.id)}
                      disabled={marking === voter.id}
                      className="btn btn-primary text-sm py-2 px-4"
                    >
                      {marking === voter.id ? 'Marking...' : 'Mark Voted'}
                    </button>
                  ) : (
                    <span className="badge badge-warning">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-slate-500 text-xs mt-8">Auto-refreshing every 5s</p>
      </div>
    </main>
  )
}