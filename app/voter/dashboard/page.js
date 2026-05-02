'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SobaButton from '@/app/components/SobaButton'

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

  if (!voter) return <p className="text-white text-center pt-10">Loading...</p>

  return (
    <main className="min-h-screen bg-[#0D1B3E] p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <a href="/" className="text-[#A0B4CC] text-sm mb-4 block hover:text-white">← Back</a>
            <h1 className="text-2xl font-bold text-white">Voter Dashboard</h1>
            <p className="text-[#A0B4CC] text-sm">Welcome, {voter.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Status Card */}
        <div className="bg-[#162447] rounded-lg p-6 mb-6 border border-[#2A3F6A]">
          <h2 className="text-white font-bold mb-4">Your Information</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-[#A0B4CC] text-sm">Name</p>
              <p className="text-white font-semibold">{voter.name}</p>
            </div>
            <div>
              <p className="text-[#A0B4CC] text-sm">NIC</p>
              <p className="text-white font-semibold">{voter.nic}</p>
            </div>
            <div>
              <p className="text-[#A0B4CC] text-sm">Email</p>
              <p className="text-white font-semibold text-sm">{voter.email}</p>
            </div>
            <div>
              <p className="text-[#A0B4CC] text-sm">Registration Date</p>
              <p className="text-white font-semibold text-sm">
                {new Date(voter.registeredAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="border-t border-[#2A3F6A] pt-6">
            <h3 className="text-white font-bold mb-3">Verification Status</h3>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                voter.sobaVerified
                  ? 'bg-[#E8A020] text-[#0D1B3E]'
                  : 'bg-[#2A3F6A] text-[#A0B4CC]'
              }`}>
                {voter.sobaVerified ? '✓ SOBA Verified' : '○ Not Verified'}
              </span>
            </div>
            
            {!voter.sobaVerified && (
              <div className="mt-6 p-4 bg-[#0D1B3E] rounded border border-[#E8A020]">
                <p className="text-[#A0B4CC] text-sm mb-4">
                  Complete your face verification to be eligible for polling day.
                </p>
                <SobaButton email={voter.email} />
              </div>
            )}

            {voter.sobaVerified && (
              <div className="mt-4 p-4 bg-green-900 rounded border border-green-600">
                <p className="text-green-200 text-sm">
                  ✓ You are verified and eligible to vote on polling day. Your QR code will be provided at the polling station.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}