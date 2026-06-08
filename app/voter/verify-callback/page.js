'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FullBackground from '@/app/components/FullBackground'

export default function VerifyCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    async function handleCallback() {
      try {
        console.log('=== VERIFY CALLBACK STARTED ===')

        const voterId = localStorage.getItem('verifyingVoterId')
        const voterEmail = localStorage.getItem('verifyingVoterEmail')

        console.log('Retrieved Voter ID:', voterId)
        console.log('Retrieved Voter Email:', voterEmail)

        if (!voterId || !voterEmail) {
          setStatus('Error: Voter data lost')
          console.error('Voter ID or Email missing')

          setTimeout(() => {
            router.push('/voter/login')
          }, 2000)
          return
        }

        setStatus('Updating verification status...')
        console.log('Calling /api/verify-face...')

        const res = await fetch('/api/verify-face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voterId,
            email: voterEmail
          })
        })

        console.log('API Status:', res.status)

        const data = await res.json()
        console.log('API Response:', data)

        if (!res.ok) {
          setStatus('Verification failed')
          console.error('API Error:', data)

          setTimeout(() => {
            router.push('/voter/login')
          }, 2000)
          return
        }

        console.log('Fetching updated voter data...')

        const votersRes = await fetch('/api/voters')
        const voters = await votersRes.json()

        const updatedVoter =
          voters.find(v => v.id === voterId) || data.voter

        if (updatedVoter) {
          localStorage.setItem('currentVoter', JSON.stringify(updatedVoter))
          console.log('Updated currentVoter in storage')
        }

        localStorage.removeItem('verifyingVoterId')
        localStorage.removeItem('verifyingVoterEmail')
        localStorage.removeItem('pendingVoterId')

        console.log('Redirecting to voting page...')
        setStatus('Redirecting to voting...')

        setTimeout(() => {
          window.location.href = '/voter/voting'
        }, 1000)
      } catch (err) {
        console.error('Callback Error:', err)
        setStatus('Error: ' + err.message)

        setTimeout(() => {
          router.push('/voter/login')
        }, 2000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="card text-center relative z-10 max-w-md w-full">
        <div className="text-5xl mb-4 text-green-600">✓</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Face Verified</h1>
        <p className="text-slate-600">{status}</p>
      </div>
    </main>
  )
}
