'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import FullBackground from '@/app/components/FullBackground'

const OFFICER_SESSION_KEY = 'officerAuthenticated'

export default function OfficerPage() {
  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [marking, setMarking] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  const [currentEvent, setCurrentEvent] = useState(null)

  const OFFICER_PIN = '1234'

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(OFFICER_SESSION_KEY) === 'true') {
      setAuthenticated(true)
    }
  }, [])

  function handlePinLogin() {
    if (pin === OFFICER_PIN) {
      localStorage.setItem(OFFICER_SESSION_KEY, 'true')
      setAuthenticated(true)
      setPinError('')
      fetchVoters()
      fetchEventSettings()
    } else {
      setPinError('Incorrect PIN')
      setPin('')
    }
  }

  useEffect(() => {
    if (authenticated) {
      fetchVoters()
      fetchEventSettings()
      const interval = setInterval(fetchVoters, 5000)
      return () => clearInterval(interval)
    }
  }, [authenticated])

  useEffect(() => {
    // silent background sync on load
    if (authenticated) {
      syncSobaStatus(true)
    }
  }, [authenticated])

  async function fetchEventSettings() {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setCurrentEvent(data)
    } catch (err) {
      console.error('Failed to fetch event settings', err)
    }
  }

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

  async function syncSobaStatus(silent = false) {
    if (syncing) return
    setSyncing(true)
    if (!silent) setSyncMessage('')
    try {
      const res = await fetch('/api/soba-sync', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (!silent) setSyncMessage(data.error || 'Sync failed')
        return
      }
      if (!silent) {
        setSyncMessage(`Synced ${data.synced || 0} voters (checked ${data.total_checked || 0})`)
      }
      await fetchVoters()
    } catch {
      if (!silent) setSyncMessage('Network error during sync')
    } finally {
      setSyncing(false)
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

  function handleLogout() {
    localStorage.removeItem(OFFICER_SESSION_KEY)
    setAuthenticated(false)
    setPin('')
    setVoters([])
    setLoading(true)
  }

  function getNICInfo(nic) {
    if (!nic) return null
    const cleaned = nic.trim().toUpperCase()
    let birthYear, gender, dayOfYear

    if (cleaned.length === 10) {
      birthYear = 1900 + parseInt(cleaned.substring(0, 2))
      dayOfYear = parseInt(cleaned.substring(2, 5))
    } else {
      birthYear = parseInt(cleaned.substring(0, 4))
      dayOfYear = parseInt(cleaned.substring(4, 7))
    }

    if (dayOfYear > 500) {
      gender = 'Female'
    } else {
      gender = 'Male'
    }

    return { birthYear, gender }
  }

  const filtered = voters.filter(
    v => v.name.toLowerCase().includes(search.toLowerCase()) || v.nic.includes(search)
  )

  const totalVoters = voters.length
  const verifiedCount = voters.filter(v => v.sobaVerified).length
  const votedCount = voters.filter(v => v.hasVoted).length

  const activeEventLabel =
    currentEvent?.configured && currentEvent?.eventId
      ? currentEvent.eventId
      : 'None configured'

  if (!authenticated) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
        <FullBackground />
        <div className="w-full max-w-[480px] relative z-10 py-10 mx-auto">
          <div className="flex flex-col items-start w-full">
            <a
              href="/"
              className="inline-flex items-center gap-3 text-white bg-[#62609f] active:bg-[#3b3960] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
            </a>

            <div className="w-full">
              <div className="card">
                <h1 className="text-3xl font-bold mb-2 text-slate-900">Officer Access</h1>
                <p className="text-slate-600 mb-8">Enter PIN</p>

                <div className="flex flex-col items-center w-full gap-4">
                  <input
                    type="password"
                    placeholder="••••"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePinLogin()}
                    maxLength={4}
                    className="text-center text-3xl tracking-widest font-bold w-[200px]"
                  />
                  {pinError && (
                    <div className="alert alert-error text-sm py-2 w-[200px] text-center">{pinError}</div>
                  )}
                  <button type="button" onClick={handlePinLogin} className="btn btn-primary w-[200px]">
                    Login
                  </button>
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
      <div className="max-w-4xl w-full mx-auto relative z-10">
        <div className="flex justify-between items-start mb-10 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <a
                href="/"
                className="inline-flex items-center gap-3 text-white bg-[#62609f] hover:bg-[#4e4d80] font-bold px-6 py-2.5 rounded-full transition-all text-sm group shadow-lg border-2 border-white/30 relative z-[50] whitespace-nowrap"
              >
                <span className="transition-transform group-hover:-translate-x-1">←</span> Home
              </a>
              <Link
                href="/officer/settings"
                className="inline-flex items-center gap-2 text-white bg-[#62609f] hover:bg-[#4e4d80] font-bold px-6 py-2.5 rounded-full transition-all text-sm shadow-lg border-2 border-white/30 relative z-[50] whitespace-nowrap"
              >
                ⚙️ Settings
              </Link>
              <button
                type="button"
                onClick={() => syncSobaStatus(false)}
                disabled={syncing}
                className="inline-flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 font-bold px-6 py-2.5 rounded-full transition-all text-sm shadow-lg border-2 border-white/10 relative z-[50] whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {syncing ? 'Syncing…' : 'Sync SOBA Status'}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Officer Dashboard</h1>
                <span className="badge badge-neutral text-[11px] font-semibold bg-slate-200 text-slate-800">
                  Active Event: {activeEventLabel}
                </span>
              </div>
              <p className="text-slate-600 font-medium">Real-time voter management</p>
              {syncMessage && <p className="text-xs text-slate-500 mt-1">{syncMessage}</p>}
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="btn btn-danger shadow-md shrink-0">
            Logout
          </button>
        </div>

        <div className="card mb-10 border-b-4 border-[#62609f]/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x divide-slate-100">
            {[
              { label: 'Total Registered', value: totalVoters },
              { label: 'SOBA Verified', value: verifiedCount },
              { label: 'Voted', value: votedCount }
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center md:items-start md:px-8 first:pl-0 last:pr-0">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
                <p className="text-5xl font-black text-[#62609f]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 flex justify-center w-full px-4">
          <div className="relative w-full max-w-[480px] group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-white transition-colors z-20">
              🔍
            </span>
            <input
              placeholder="Search voters by name or NIC..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 pr-6 py-4 w-full bg-slate-950 border-2 border-slate-800 text-white placeholder-slate-500 rounded-2xl shadow-2xl focus:border-[#62609f] focus:ring-4 focus:ring-[#62609f]/10 transition-all font-medium text-base"
            />
          </div>
        </div>

        {loading ? (
          <div className="card text-center text-slate-600">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center text-slate-600">No voters</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(voter => {
              const nicInfo = getNICInfo(voter.nic)
              return (
                <div key={voter.id} className="card flex justify-between items-center hover:shadow-lg flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{voter.name}</p>
                      {nicInfo && (
                        <span title={nicInfo.gender}>
                          {nicInfo.gender === 'Male' ? '👨' : '👩'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      NIC: {voter.nic} • {voter.email}
                    </p>
                    {nicInfo && (
                      <p className="text-[10px] text-slate-400 font-bold">
                        BORN: {nicInfo.birthYear}
                      </p>
                    )}
                  </div>

                <div className="flex gap-3 flex-wrap">
                  <span className={`badge ${voter.sobaVerified ? 'badge-warning' : 'badge-neutral'}`}>
                    {voter.sobaVerified ? '✓ Registered' : '○ Not Registered'}
                  </span>

                  {voter.sobaVerified && (
                    <span className={`badge ${voter.faceVerifiedToday ? 'badge-success' : 'badge-neutral'}`}>
                      {voter.faceVerifiedToday ? '✓ Identity Confirmed' : '○ ID Pending'}
                    </span>
                  )}

                  {voter.hasVoted ? (
                    <span className="badge badge-primary">✓ Voted</span>
                  ) : (voter.sobaVerified && voter.faceVerifiedToday) ? (
                    <button
                      type="button"
                      onClick={() => markAsVoted(voter.id)}
                      disabled={marking === voter.id}
                      className="btn btn-primary text-sm py-2 px-4"
                    >
                      {marking === voter.id ? 'Marking...' : 'Mark Voted'}
                    </button>
                  ) : (
                    <span className="badge badge-neutral">Ineligible</span>
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
