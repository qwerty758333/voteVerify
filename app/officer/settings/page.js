'use client'
import { useState, useEffect } from 'react'
import FullBackground from '@/app/components/FullBackground'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [eventId, setEventId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      if (data.eventId) setEventId(data.eventId)
      if (data.apiKey) setApiKey(data.apiKey)
    } catch (err) {
      console.error('Failed to fetch settings', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, apiKey })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Settings saved successfully!')
      } else {
        setError(data.error || 'Failed to save settings')
      }
    } catch (err) {
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
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-3 text-white bg-[#62609f] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Dashboard
          </button>
          
          <div className="card w-full">
            <h1 className="text-3xl font-bold mb-2 text-slate-900 text-center">SOBA Configuration</h1>
            <p className="text-slate-600 mb-8 text-center">Update event details for verification</p>

            {loading ? (
              <p className="text-center py-10 text-slate-500">Loading current settings...</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SOBA Event ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 2790001"
                    value={eventId}
                    onChange={e => setEventId(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">The unique ID for your hackathon/election event.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SOBA API Key</label>
                  <input
                    type="password"
                    placeholder="Enter your SOBA API Key"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">Keep this key secure. It is required for verification.</p>
                </div>

                {message && <div className="alert alert-success text-sm py-3">{message}</div>}
                {error && <div className="alert alert-error text-sm py-3">{error}</div>}

                <div className="flex justify-center pt-2">
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="btn btn-primary w-full shadow-lg shadow-blue-200"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
