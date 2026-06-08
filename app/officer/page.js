'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FullBackground from '@/app/components/FullBackground'

export default function OfficerDashboard() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [currentEvent, setCurrentEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('voters')
  const [candidates, setCandidates] = useState([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState(null)

  useEffect(() => {
    const isAuth = localStorage.getItem('officerAuthenticated')

    if (isAuth !== 'true') {
      router.push('/officer/login')
      return
    }

    setAuthenticated(true)
    setAuthLoading(false)
  }, [router])

  useEffect(() => {
    if (!authenticated) return
    fetchVoters()
    fetchEventSettings()
    const interval = setInterval(fetchVoters, 5000)
    return () => clearInterval(interval)
  }, [authenticated])

  useEffect(() => {
    if (!authenticated) return
    syncAndRefresh(true)
  }, [authenticated])

  useEffect(() => {
    if (!authenticated || activeTab !== 'results') return
    fetchCandidates()
    const interval = setInterval(() => {
      fetchCandidates()
      fetchVoters()
    }, 10000)
    return () => clearInterval(interval)
  }, [authenticated, activeTab])

  function handleLogout() {
    localStorage.removeItem('officerAuthenticated')
    router.push('/officer/login')
  }

  async function fetchEventSettings() {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setCurrentEvent(data)
    } catch (err) {
      console.error('Failed to fetch event settings', err)
    }
  }

  async function fetchCandidates() {
    setResultsLoading(true)
    try {
      const res = await fetch('/api/candidates', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load results')
      setCandidates(Array.isArray(data) ? data : [])
      setLastRefreshTime(new Date())
    } catch (err) {
      console.error('Failed to fetch candidates', err)
    } finally {
      setResultsLoading(false)
    }
  }

  async function refreshResults() {
    await Promise.all([fetchVoters(), fetchCandidates()])
    setLastRefreshTime(new Date())
  }

  async function fetchVoters() {
    try {
      const res = await fetch('/api/voters', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await res.json()
      setVoters([...data])
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
      const res = await fetch('/api/soba-sync', { method: 'POST' })
      const data = await res.json()

      await fetchVoters()

      if (!silent) {
        if (res.ok) {
          setSyncMessage(
            data.synced > 0
              ? `${data.synced} voter(s) verified`
              : 'Status up to date'
          )
        } else {
          setSyncMessage('Sync failed - check settings')
        }
        setTimeout(() => setSyncMessage(''), 3000)
      }
    } catch (err) {
      console.error('Sync error:', err)
      if (!silent) setSyncMessage('Sync failed - try again')
    } finally {
      setSyncing(false)
    }
  }

  const filtered = voters.filter(
    v =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.nic.toLowerCase().includes(search.toLowerCase())
  )

  const votedCount = voters.filter(v => v.hasVoted === true).length
  const turnoutPercent =
    voters.length > 0 ? Math.round((votedCount / voters.length) * 100) : 0
  const totalVotes =
    candidates.reduce((sum, c) => sum + (c.votes || 0), 0) || votedCount
  const eventId = currentEvent?.eventId || '2790001'
  const eventName = currentEvent?.eventName || 'voteVerify'

  if (authLoading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
        <FullBackground />
        <div className="card text-center relative z-10">
          <p className="text-slate-600">Loading dashboard…</p>
        </div>
      </main>
    )
  }

  if (!authenticated) {
    return null
  }

  const tabClass = tab =>
    `px-6 py-3 font-semibold border-b-4 transition ${
      activeTab === tab
        ? 'border-[#62609f] text-[#4e4d80]'
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`

  return (
    <main className="min-h-screen w-full relative">
      <FullBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="card mb-6 !p-6 sm:!p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Election Dashboard
              </h1>
              <p className="text-slate-600 mt-1 text-sm">
                Event ID: {eventId} • {eventName}
              </p>
              {syncMessage && (
                <p className="text-xs text-[#4e4d80] mt-2 font-medium">{syncMessage}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => syncAndRefresh(false)}
                disabled={syncing}
                className="btn btn-secondary !py-2 !px-5 !text-sm"
              >
                {syncing ? 'Syncing...' : 'Sync SOBA'}
              </button>
              <Link
                href="/officer/settings"
                className="btn btn-secondary !py-2 !px-5 !text-sm"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-danger !py-2 !px-5 !text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="card !p-6 sm:!p-8">
          <div className="flex gap-2 border-b border-slate-200 mb-6">
            <button type="button" onClick={() => setActiveTab('voters')} className={tabClass('voters')}>
              Voter List
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('results')
                refreshResults()
              }}
              className={tabClass('results')}
            >
              Results
            </button>
          </div>

          {activeTab === 'voters' && (
            <div>
              <input
                placeholder="Search by name or NIC..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full mb-6"
              />

              {loading ? (
                <p className="text-center py-10 text-slate-500">Loading voters…</p>
              ) : filtered.length === 0 ? (
                <p className="text-center py-10 text-slate-500">No voters found</p>
              ) : (
                <div className="space-y-3">
                  {filtered.map(voter => (
                    <div
                      key={voter.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900">{voter.name}</div>
                        <div className="text-sm text-slate-600 mt-1 truncate">
                          NIC: {voter.nic} • {voter.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={
                            voter.sobaVerified ? 'badge badge-success' : 'badge badge-warning'
                          }
                        >
                          {voter.sobaVerified ? 'Verified' : 'Pending'}
                        </span>
                        <span
                          className={
                            voter.hasVoted ? 'badge badge-primary' : 'badge badge-neutral'
                          }
                        >
                          {voter.hasVoted ? 'Voted' : 'Not Voted'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-center text-slate-400 text-xs mt-6">
                Auto-refreshing every 5s
              </p>
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Live Results</h2>
                  {lastRefreshTime && (
                    <p className="text-xs text-slate-500 mt-1">
                      Last refreshed: {lastRefreshTime.toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={refreshResults}
                  disabled={resultsLoading}
                  className="btn btn-primary !py-2 !px-5 !text-sm"
                >
                  {resultsLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {resultsLoading && candidates.length === 0 ? (
                <p className="text-center py-10 text-slate-500">Loading results…</p>
              ) : candidates.length === 0 ? (
                <p className="text-center py-10 text-slate-500">
                  No candidates found. Ensure data/votes.json is configured.
                </p>
              ) : (
                <div className="space-y-4">
                  {candidates.map(c => {
                    const percentage =
                      totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0
                    return (
                      <div
                        key={c.id ?? c.name}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex justify-between mb-3 items-center flex-wrap gap-2">
                          <span className="font-semibold text-slate-900">{c.name}</span>
                          <span className="text-[#62609f] font-bold">
                            {c.votes || 0} votes ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full transition-all rounded-full"
                            style={{
                              width: `${percentage}%`,
                              background:
                                'linear-gradient(135deg, #62609f 0%, #4e4d80 100%)'
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-slate-600 text-sm">Total Votes</p>
                    <p className="text-3xl font-bold text-[#62609f] mt-2">{totalVotes}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-slate-600 text-sm">Turnout</p>
                    <p className="text-3xl font-bold text-green-700 mt-2">{turnoutPercent}%</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-slate-400 text-xs mt-6">
                Auto-refreshing results every 10s
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
