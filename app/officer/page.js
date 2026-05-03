'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FullBackground from '@/app/components/FullBackground'

export default function OfficerDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  
  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [marking, setMarking] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [currentEvent, setCurrentEvent] = useState(null)

  const router = useRouter()

  function handleLogout() {
    setAuthenticated(false)
    setPin('')
    localStorage.removeItem('officerAuth')
  }

  function handlePinLogin() {
    if (pin === '1234') {
      setAuthenticated(true)
      localStorage.setItem('officerAuth', 'true')
      setPinError('')
    } else {
      setPinError('Invalid PIN')
    }
  }

  useEffect(() => {
    if (localStorage.getItem('officerAuth') === 'true') {
      setAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchVoters()
      fetchEventSettings()
      const interval = setInterval(fetchVoters, 5000)
      return () => clearInterval(interval)
    }
  }, [authenticated])

  useEffect(() => {
    if (authenticated) {
      syncAndRefresh(true)
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

  async function syncAndRefresh(silent = false) {
    if (syncing) return
    setSyncing(true)
    if (!silent) setSyncMessage('Syncing...')

    try {
      // 1. Get credentials from backend
      const eventsRes = await fetch('/api/events')
      const events = await eventsRes.json()
      
      console.log('Events config:', {
        eventId: events.eventId,
        hasApiKey: !!events.apiKey
      })

      const apiKey = events.apiKey || ''
      const eventId = events.eventId || ''

      if (!apiKey || !eventId) {
        if (!silent) setSyncMessage('Event not configured. Go to Settings first.')
        setSyncing(false)
        return
      }

      // 2. Get all voters
      const votersRes = await fetch('/api/voters')
      const voters = await votersRes.json()
      
      // 3. Filter unverified
      const unverified = voters.filter(v => !v.sobaVerified)

      let synced = 0

      // 4. Check each voter from BROWSER (not backend)
      for (const voter of unverified) {
        try {
          console.log('Sending to SOBA:', {
            org_id: '750006',
            event_id: String(eventId),
            email: voter.email,
            api_key: apiKey?.substring(0, 8) + '...'
          })

          const response = await fetch(
            'https://poc.soba.network/api/add-attendee',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
              },
              body: JSON.stringify({
                org_id: '750006',
                event_id: String(eventId),
                email: voter.email,
                api_key: apiKey
              })
            }
          )

          const data = await response.json()
          console.log('Full SOBA response:', JSON.stringify(data))

          // If verified, tell OUR backend to update
          if (data?.data?.face_id_registered === true) {
            await fetch('/api/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: voter.email })
            })
            synced++
          }

          // Small delay between requests
          await new Promise(r => setTimeout(r, 300))
        } catch (err) {
          console.error('Error checking voter:', voter.email, err)
        }
      }

      // 5. Refresh voter list
      await fetchVoters()

      if (!silent) {
        setSyncMessage(synced > 0 ? `✓ ${synced} voter(s) verified` : '✓ Status up to date')
        setTimeout(() => setSyncMessage(''), 3000)
      }
    } catch (err) {
      console.error('Sync error:', err)
      if (!silent) setSyncMessage('✗ Sync failed')
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

  function validateNIC(nic) {
    if (!nic) return false
    const cleaned = nic.trim().toUpperCase()
    const oldFormat = /^[0-9]{9}[VX]$/
    const newFormat = /^[0-9]{12}$/
    return oldFormat.test(cleaned) || newFormat.test(cleaned)
  }

  function getNICInfo(nic) {
    const cleaned = nic.trim().toUpperCase()
    let birthYear
    let gender
    if (cleaned.length === 10) {
      birthYear = '19' + cleaned.substring(0, 2)
      const dayValue = parseInt(cleaned.substring(2, 5))
      gender = dayValue > 500 ? 'Female' : 'Male'
    } else if (cleaned.length === 12) {
      birthYear = cleaned.substring(0, 4)
      const dayValue = parseInt(cleaned.substring(4, 7))
      gender = dayValue > 500 ? 'Female' : 'Male'
    }
    const age = birthYear ? new Date().getFullYear() - parseInt(birthYear) : 0
    return { birthYear, gender, age }
  }

  const filtered = voters.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.nic.toLowerCase().includes(search.toLowerCase())
  )

  const verifiedCount = voters.filter(v => v.sobaVerified).length
  const votedCount = voters.filter(v => v.voted).length
  const totalVoters = voters.length
  const activeEventLabel = currentEvent?.eventName || 'General Election 2026'

  if (!authenticated) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 relative">
        <FullBackground />
        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center">
            <Link href="/" className="btn btn-secondary mb-8 shadow-xl border-2 border-white/20">
              ← Back to Home
            </Link>
            
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
                onClick={() => syncAndRefresh(false)}
                disabled={syncing}
                className="inline-flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 font-bold px-6 py-2.5 rounded-full transition-all text-sm shadow-lg border-2 border-white/10 relative z-[50] whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {syncing ? 'Syncing...' : '🔄 Sync SOBA Status'}
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
          <div className="card text-center text-slate-600">No voters found</div>
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
                        DOB: {nicInfo.birthYear} • {nicInfo.gender} • {nicInfo.age}Y
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right flex flex-col items-end">
                      <span className={`badge ${voter.sobaVerified ? 'badge-success' : 'badge-warning'} mb-1`}>
                        {voter.sobaVerified ? '✓ SOBA Verified' : '✕ Not Verified'}
                      </span>
                      {voter.voted ? (
                        <span className="badge badge-success">✓ Voted</span>
                      ) : (
                        <span className="badge badge-neutral">Pending</span>
                      )}
                    </div>

                    {voter.sobaVerified && !voter.voted ? (
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
              )
            })}
          </div>
        )}

        <p className="text-center text-slate-500 text-xs mt-8">Auto-refreshing every 5s</p>
      </div>
    </main>
  )
}
