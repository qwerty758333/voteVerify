'use client'

import { useEffect } from 'react'

export default function LoginCallbackPage() {
  useEffect(() => {
    window.location.href = '/voter/login?stage=voting'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-600">Returning to voting portal…</p>
    </div>
  )
}
