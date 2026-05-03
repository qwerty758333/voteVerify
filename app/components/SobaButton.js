'use client'
import { buildSobaRegistrationUrl } from '@/lib/sobaVerifyLink'

export default function SobaButton({ email, onAfterOpen, label = 'Complete Face Verification →', className = '' }) {
  function handleClick() {
    const em = String(email || '').trim()
    if (!em) return

    const url = buildSobaRegistrationUrl(em)
    window.open(url, '_blank', 'noopener,noreferrer')
    onAfterOpen?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!String(email || '').trim()}
      className={`w-full bg-[#E8A020] text-[#0D1B3E] font-bold py-3 px-4 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 min-h-[3rem] ${className}`}
    >
      {label}
    </button>
  )
}
