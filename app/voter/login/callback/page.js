'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FullBackground from '@/app/components/FullBackground'

export default function LoginCallbackPage() {
  const [status, setStatus] = useState('verifying') // verifying, success, failed
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const email = localStorage.getItem('pendingLoginEmail')
    if (!email) {
      router.push('/voter/login')
      return
    }

    async function verifyFace() {
      try {
        const res = await fetch('/api/soba-verify-face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        const data = await res.json()

        if (data.success) {
          // Load full voter data
          const votersRes = await fetch('/api/voters')
          const voters = await votersRes.json()
          const voter = voters.find(v => v.email === email)
          
          if (voter) {
            localStorage.setItem('currentVoter', JSON.stringify(voter))
            setStatus('success')
            setTimeout(() => {
              router.push('/voter/dashboard')
            }, 1500)
          } else {
            setError('Voter record not found after verification.')
            setStatus('failed')
          }
        } else {
          setError(data.error || 'Face verification failed. Please try again.')
          setStatus('failed')
        }
      } catch (err) {
        setError('Network error. Please check your connection.')
        setStatus('failed')
      }
    }

    verifyFace()
  }, [router])

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="w-full max-w-[480px] relative z-10 py-10 mx-auto">
        <div className="card text-center">
          {status === 'verifying' && (
            <div className="py-8">
              <div className="w-16 h-16 border-4 border-[#62609f] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Finalizing Verification</h1>
              <p className="text-slate-600">Please wait while we confirm your identity...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">✓</div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Identity Confirmed!</h1>
              <p className="text-slate-600">Redirecting to your dashboard...</p>
            </div>
          )}

          {status === 'failed' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">✕</div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h1>
              <p className="text-slate-600 mb-8">{error}</p>
              <button 
                onClick={() => router.push('/voter/login')}
                className="btn btn-primary w-full"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
