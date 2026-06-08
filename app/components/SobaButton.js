'use client'
import { useState } from 'react'
import {
  buildSobaRegistrationUrl,
  applyEmailToRegistrationUrl
} from '@/lib/sobaVerifyLink'

export default function SobaButton({
  email,
  onAfterOpen,
  label = 'Complete Face Verification →',
  className = ''
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    const em = String(email || '').trim()
    if (!em || loading) return

    setLoading(true)
    try {
      const res = await fetch('/api/events')
      const events = await res.json()
      const base = events.registrationUrl?.trim()
      const url = base
        ? applyEmailToRegistrationUrl(base, em)
        : buildSobaRegistrationUrl(em)
      window.open(url, '_blank', 'noopener,noreferrer')
      onAfterOpen?.()
    } catch {
      window.open(buildSobaRegistrationUrl(em), '_blank', 'noopener,noreferrer')
      onAfterOpen?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!String(email || '').trim() || loading}
      className={`w-full bg-[#E8A020] text-[#0D1B3E] font-bold py-3 px-4 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 min-h-[3rem] ${className}`}
    >
      {loading ? 'Opening…' : label}
    </button>
  )
}
