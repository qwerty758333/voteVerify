'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FullBackground from '@/app/components/FullBackground'

const OFFICER_SESSION_KEY = 'officerAuthenticated'

export default function SettingsPage() {
  const [eventId, setEventId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [publicConfig, setPublicConfig] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(OFFICER_SESSION_KEY) !== 'true') {
      router.replace('/officer')
    }
  }, [router])

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setPublicConfig(data)
      if (data.eventId) setEventId(data.eventId)
      if (data.eventName) setEventName(data.eventName)
    } catch (err) {
      console.error('Failed to fetch settings', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    const id = eventId.trim()
    const key = apiKey.trim()
    const name = eventName.trim()

    if (!id) {
      setError('SOBA Event ID is required')
      setSaving(false)
      return
    }

    if (!key && !publicConfig?.configured) {
      setError('SOBA API Key is required')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: id,
          apiKey: key || undefined,
          eventName: name
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed to save settings')
        return
      }
      setMessage('✓ Settings saved successfully')
      setApiKey('')
      await fetchSettings()
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="w-full max-w-[540px] relative z-10 py-10 mx-auto">
        <div className="flex flex-col items-start w-full">
          <Link
            href="/officer"
            className="inline-flex items-center gap-3 text-white bg-[#62609f] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm group shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Dashboard
          </Link>

          <div className="card w-full">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">SOBA event settings</h1>
            <p className="text-slate-600 mb-8">Configure credentials used for voter verification emails. Keys stay on the server.</p>

            {loading ? (
              <p className="text-center py-10 text-slate-500">Loading current settings…</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {publicConfig && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-2">
                    <p className="font-semibold text-slate-800">Current configuration</p>
                    <p className="text-slate-600">
                      <span className="text-slate-500">Org ID:</span>{' '}
                      {publicConfig.org_id || '750006'}
                    </p>
                    <p className="text-slate-600">
                      <span className="text-slate-500">Event ID:</span>{' '}
                      {publicConfig.eventId || '—'}
                    </p>
                    <p className="text-slate-600">
                      <span className="text-slate-500">Event name:</span>{' '}
                      {publicConfig.eventName || '—'}
                    </p>
                    <p className="text-slate-600">
                      <span className="text-slate-500">API key:</span>{' '}
                      {publicConfig.apiKeyMasked || (publicConfig.configured ? '••••' : 'Not set')}
                    </p>
                    {publicConfig.updatedAt && (
                      <p className="text-xs text-slate-400">Last updated: {new Date(publicConfig.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="eventName" className="block text-sm font-medium text-slate-700 mb-1">
                    Event name <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="eventName"
                    type="text"
                    placeholder="e.g. General Election 2026"
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                    className="w-full"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="eventId" className="block text-sm font-medium text-slate-700 mb-1">
                    SOBA Event ID
                  </label>
                  <input
                    id="eventId"
                    type="text"
                    placeholder="e.g. 2790001"
                    value={eventId}
                    onChange={e => setEventId(e.target.value)}
                    className="w-full"
                    required
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-1">
                    SOBA API Key
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    placeholder={publicConfig?.configured ? 'Leave blank to keep current key' : 'Paste your API key'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="w-full"
                    autoComplete="off"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Never shared with the browser after save; only used in API routes.</p>
                </div>

                {message && <div className="alert alert-success text-sm py-3">{message}</div>}
                {error && <div className="alert alert-error text-sm py-3">{error}</div>}

                <div className="flex justify-center pt-2">
                  <button type="submit" disabled={saving} className="btn btn-primary w-full shadow-lg">
                    {saving ? 'Saving…' : 'Save settings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
