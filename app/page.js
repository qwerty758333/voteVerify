'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="flex-1 w-full bg-[var(--background)] flex flex-col items-center">
      
      {/* Hero Header with Voting Station Image */}
      <div 
        className="w-full h-[45vh] bg-cover bg-center relative"
        style={{ backgroundImage: "url('/voting.png')" }}
      >
        {/* Soft overlay gradient to beautifully blend the header into the themed page below */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-[var(--background)]"></div>
      </div>

      {/* Main Content Card - Cleanly overlaps the header for a premium SaaS look */}
      <div className="w-full max-w-4xl px-4 sm:px-6 relative z-10 -mt-24 pb-16">
        {/* Removed borders to let it seamlessly float */}
        <div className="bg-white p-8 sm:p-14 rounded-[2rem] shadow-2xl">
          
          <div className={`text-center mb-16 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm tracking-wide shadow-sm uppercase">
              The New Standard of Trust
            </div>
            
            {/* Extremely dark solid text to guarantee it shows up precisely on every browser */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 text-[#141320]" style={{ letterSpacing: '-0.04em' }}>
              Welcome to <span className="text-[#62609f]">VoteVerify</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 font-medium tracking-tight px-4 leading-loose max-w-2xl mx-auto">
              Experience the next-generation of <strong className="text-slate-800 font-bold">secure voter authentication</strong>. Built for transparency, absolute security, and a seamless polling day.
            </p>
          </div>

          <div className={`flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            <a href="/voter/login" className="btn btn-primary min-w-[200px] shadow-[#62609f]/20 hover:shadow-[#62609f]/30">
              Voter Login
            </a>
            <a href="/voter" className="btn btn-secondary min-w-[200px]">
              Register Account
            </a>
            <a href="/officer" className="btn btn-secondary min-w-[200px]">
              Officer Access
            </a>
          </div>
          
        </div>
      </div>
    </main>
  )
}