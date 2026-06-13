'use client'
console.log('CALLBACK PAGE LOADED - checking functionality')

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FullBackground from '@/app/components/FullBackground'

export default function VerifyCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    async function handleCallback() {
      try {
        console.log('=== CALLBACK STARTED ===')
        console.log('Current URL:', window.location.href)
        console.log('All URL params:', window.location.search)
        
        // Get stored voter ID
        const voterId = 
          localStorage.getItem('verifyingVoterId')
        const voterEmail = 
          localStorage.getItem('verifyingVoterEmail')
        
        console.log('voterId from storage:', voterId)
        console.log('voterEmail from storage:', voterEmail)
        
        if (!voterId || !voterEmail) {
          console.error('NO VOTER DATA IN STORAGE!')
          console.log('Redirecting to login...')
          router.push('/voter/login')
          return
        }
  
        setStatus('Calling verify API...')
        console.log('About to call /api/verify-face')
        
        const res = await fetch('/api/verify-face', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            voterId: voterId,
            email: voterEmail
          })
        })
  
        console.log('API Response Status:', res.status)
        const data = await res.json()
        console.log('API Response Data:', data)
  
        if (!res.ok) {
          console.error('API Error:', data.error)
          setStatus('Error: ' + data.error)
          setTimeout(() => router.push('/voter/login'), 2000)
          return
        }
  
        console.log('API SUCCESS - updating localStorage')
        
        // Get full voter data
        const votersRes = await fetch('/api/voters')
        const voters = await votersRes.json()
        const updatedVoter = voters.find(v => v.id === voterId)
  
        if (updatedVoter) {
          console.log('Found updated voter:', updatedVoter.email)
          localStorage.setItem(
            'currentVoter',
            JSON.stringify(updatedVoter)
          )
        }
  
        // Clean up temp storage
        localStorage.removeItem('verifyingVoterId')
        localStorage.removeItem('verifyingVoterEmail')
        
        console.log('About to redirect to /voter/voting')
        setStatus('Redirecting...')
  
        setTimeout(() => {
          console.log('Executing router.push...')
          router.push('/voter/voting')
        }, 500)
  
      } catch (err) {
        console.error('CALLBACK ERROR:', err)
        console.error('Error message:', err.message)
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
