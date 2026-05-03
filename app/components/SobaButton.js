import { useState, useEffect } from 'react'

export default function SobaButton({ email }) {
  const [eventId, setEventId] = useState('')

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/events')
        const data = await res.json()
        if (data.eventId) setEventId(data.eventId)
      } catch (err) {
        console.error('Failed to fetch SOBA settings', err)
      }
    }
    fetchSettings()
  }, [])

  function handleVerify() {
    if (!email) {
      alert('Email not found. Please register again.')
      return
    }

    // Use dynamic eventId from settings or fallback to env
    const currentEventId = eventId || process.env.NEXT_PUBLIC_SOBA_EVENT_ID || '2460005'
    
    // Save email for callback
    localStorage.setItem('voterEmail', email)
    
    // Build SOBA verification URL using dynamic Event ID
    const sobaUrl = `https://poh.crowdsnap.ai/verify?event_id=${currentEventId}&email=${encodeURIComponent(email)}`
    
    // Open in new window
    window.open(sobaUrl, 'sobaVerify', 'width=800,height=600')
  }

  return (
    <button
      onClick={handleVerify}
      className="w-full bg-[#E8A020] text-[#0D1B3E] font-bold py-3 rounded hover:opacity-90"
    >
      Verify with SOBA →
    </button>
  )
}