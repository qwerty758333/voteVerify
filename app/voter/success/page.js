'use client'
import { useEffect } from 'react'

export default function SuccessPage() {
  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = '/'
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-[#0D1B3E] flex items-center justify-center p-6">
      <div className="bg-[#162447] rounded-lg p-8 w-full max-w-md text-center shadow-xl">
        <div className="w-16 h-16 bg-[#E8A020] rounded-full flex items-center justify-center text-[#0D1B3E] text-3xl font-bold mx-auto mb-6">✓</div>
        <h2 className="text-white font-bold text-lg mb-2">Verification Complete!</h2>
        <p className="text-[#A0B4CC] text-sm mb-6">Your identity has been verified with SOBA. You are now eligible to vote on polling day.</p>
        <p className="text-[#A0B4CC] text-xs">Redirecting in 3 seconds...</p>
        <a href="/" className="block mt-6 w-full bg-[#E8A020] text-[#0D1B3E] font-bold py-3 rounded hover:opacity-90">
          Back to Home
        </a>
      </div>
    </main>
  )
}