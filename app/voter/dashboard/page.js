'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SobaButton from '@/app/components/SobaButton'
import FullBackground from '@/app/components/FullBackground'

export default function VoterDashboardPage() {
  const [voter, setVoter] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('currentVoter')
    if (!stored) {
      router.push('/voter/login')
      return
    }
    setVoter(JSON.parse(stored))
  }, [])

  function handleLogout() {
    localStorage.removeItem('currentVoter')
    router.push('/voter/login')
  }

  if (!voter) return <p className="text-slate-400 text-center pt-10">Loading...</p>

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="max-w-[720px] w-full mx-auto relative z-10 py-10 pb-32">
        <div className="flex flex-col items-start w-full">
          <a href="/" className="inline-flex items-center gap-3 text-white bg-[#62609f] active:bg-[#3b3960] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
          </a>
          
          <div className="w-full">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Voter Dashboard</h1>
            <p className="text-slate-600 text-sm mt-1">Welcome, {voter.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger text-sm py-2 px-4"
          >
            Logout
          </button>
        </div>

        {/* Status Card */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-6 text-slate-900">Your Information</h2>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-slate-600 text-sm mb-1">Name</p>
              <p className="text-slate-900 font-semibold text-lg">{voter.name}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm mb-1">NIC</p>
              <p className="text-slate-900 font-semibold text-lg">{voter.nic}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm mb-1">Email</p>
              <p className="text-slate-900 font-semibold">{voter.email}</p>
            </div>
            <div>
              <p className="text-slate-600 text-sm mb-1">Registration Date</p>
              <p className="text-slate-900 font-semibold">
                {new Date(voter.registeredAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="border-t border-slate-200 pt-8 mt-4">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Verification Status</h3>
            <div className="flex items-center gap-4">
              <span className={`badge ${
                voter.sobaVerified
                  ? 'badge-success'
                  : 'badge-neutral'
              }`}>
                {voter.sobaVerified ? '✓ SOBA Verified' : '○ Not Verified'}
              </span>
            </div>
            
            {!voter.sobaVerified && (
              <div className="mt-6 p-5 rounded-xl border border-red-200 bg-red-50">
                <p className="text-red-600 font-semibold mb-4 flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Action Required: Complete your face verification to be eligible for polling day.
                </p>
                <div className="w-full max-w-xs">
                  <SobaButton email={voter.email} />
                </div>
              </div>
            )}

            {voter.sobaVerified && (
              <div className="mt-6 alert alert-success">
                ✓ You are verified and eligible to vote on polling day. Your QR code will be provided at the polling station.
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </main>
  )
}