'use client'
import { useEffect } from 'react'
import FullBackground from '@/app/components/FullBackground'

export default function SuccessPage() {
  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = '/'
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="w-full max-w-[480px] relative z-10 py-10 mx-auto text-center">
        <div className="flex flex-col items-start w-full">
          <a href="/" className="inline-flex items-center gap-3 text-white bg-[#62609f] active:bg-[#3b3960] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
          </a>
        <div className="card text-center text-slate-400 w-full">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30 text-4xl font-bold mx-auto mb-6">✓</div>
          <h2 className="text-slate-900 font-bold text-2xl mb-3">Verification Complete!</h2>
          <p className="text-slate-600 mb-8">Your identity has been verified with SOBA.<br/>You are now eligible to vote on polling day.</p>
          <p className="text-slate-500 text-xs mb-6">Redirecting in 3 seconds...</p>
          </div>
        </div>
      </div>
    </main>
  )
}