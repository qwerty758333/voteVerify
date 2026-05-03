'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SobaButton from '@/app/components/SobaButton'
import FullBackground from '@/app/components/FullBackground'

export default function VoterPage() {
  const [nic, setNic] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /** 'form' | 'soba_loading' | 'soba_ok' | 'soba_error' */
  const [flow, setFlow] = useState('form')
  const [sobaError, setSobaError] = useState('')
  const [verificationOpened, setVerificationOpened] = useState(false)
  const router = useRouter()

  async function registerWithSoba(em, voterName) {
    setSobaError('')
    setFlow('soba_loading')
    try {
      const res = await fetch('/api/soba-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, name: voterName })
      })
      const data = await res.json().catch(() => ({ success: false, error: 'Invalid response from server' }))

      if (data.success === true) {
        setFlow('soba_ok')
        setVerificationOpened(false)
        return
      }

      setSobaError(data.error || 'Could not register with SOBA. Please try again.')
      setFlow('soba_error')
    } catch {
      setSobaError('Network error. Check your connection and try again.')
      setFlow('soba_error')
    }
  }

  function validateNIC(nic) {
    if (!nic) return false
    const cleaned = nic.trim().toUpperCase()
    const oldFormat = /^[0-9]{9}[VX]$/
    const newFormat = /^[0-9]{12}$/
    return oldFormat.test(cleaned) || newFormat.test(cleaned)
  }

  function getNICInfo(nic) {
    if (!validateNIC(nic)) return null
    const cleaned = nic.trim().toUpperCase()
    let birthYear, gender, dayOfYear

    if (cleaned.length === 10) {
      birthYear = 1900 + parseInt(cleaned.substring(0, 2))
      dayOfYear = parseInt(cleaned.substring(2, 5))
    } else {
      birthYear = parseInt(cleaned.substring(0, 4))
      dayOfYear = parseInt(cleaned.substring(4, 7))
    }

    if (dayOfYear > 500) {
      dayOfYear -= 500
      gender = 'Female'
    } else {
      gender = 'Male'
    }

    const currentYear = new Date().getFullYear()
    const age = currentYear - birthYear
    return { birthYear, gender, age, valid: age >= 18 }
  }

  async function handleRegister() {
    if (!nic || !email || !name) {
      setError('Please fill in all fields')
      return
    }

    if (!validateNIC(nic)) {
      setError('Invalid NIC format. Enter 9 digits + V/X (e.g. 952341234V) or 12 digits (e.g. 199512345678)')
      return
    }

    const nicInfo = getNICInfo(nic)
    if (!nicInfo || !nicInfo.valid) {
      setError('Voter must be at least 18 years old to register')
      return
    }

    const em = email.trim()
    const voterName = name.trim()
    const formattedNIC = nic.trim().toUpperCase()

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/voters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nic: formattedNIC, email: em, name: voterName })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      localStorage.setItem('voterEmail', em)
      setLoading(false)

      await registerWithSoba(em, voterName)
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  async function retrySobaOnly() {
    const em = email.trim()
    const voterName = name.trim()
    if (!em || !voterName) return
    await registerWithSoba(em, voterName)
  }

  const nicInfo = getNICInfo(nic)
  const isNICValid = validateNIC(nic)

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
      <FullBackground />
      <div className="w-full max-w-[480px] relative z-10 py-10 mx-auto">
        <div className="flex flex-col items-start w-full">
          <a href="/" className="inline-flex items-center gap-3 text-white bg-[#62609f] active:bg-[#3b3960] hover:bg-[#4e4d80] font-bold mb-8 px-6 py-3 rounded-full transition-all text-sm shadow-2xl border-2 border-white/30 relative z-[50] whitespace-nowrap">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
          </a>

          <div className="w-full">
            {flow === 'form' ? (
              <div className="card">
                <h1 className="text-3xl font-bold mb-2 text-slate-900">Register to Vote</h1>
                <p className="text-slate-600 mb-8">Create your voter account</p>

                <div className="voter-form-controls space-y-4">
                  <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="input-btn-match" />
                  
                  <div className="w-full max-w-[16rem] relative mx-auto">
                    <input 
                      placeholder="NIC Number" 
                      value={nic} 
                      onChange={e => setNic(e.target.value)} 
                      className={`input-btn-match pr-10 ${nic && !isNICValid ? 'border-red-400' : isNICValid ? 'border-emerald-400' : ''}`} 
                    />
                    {nic && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 font-bold ${isNICValid ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isNICValid ? '✓' : '✕'}
                      </span>
                    )}
                  </div>

                  <div className="text-left w-full max-w-[16rem]">
                    {nic && isNICValid && nicInfo && (
                      <p className="text-[11px] text-emerald-600 font-bold mb-1">
                        ✓ Valid NIC — {nicInfo.gender}, Born {nicInfo.birthYear}, Age {nicInfo.age}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Enter 9 digits + V/X (old) or 12 digits (new)
                    </p>
                  </div>

                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input-btn-match" />

                  {error && <div className="alert alert-error">{error}</div>}

                  <div className="voter-form-actions mt-4">
                    <button type="button" onClick={handleRegister} disabled={loading} className="btn btn-primary w-full">
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>

                  <p className="text-center text-slate-600 text-sm">
                    Already registered? <a href="/voter/login" className="text-[#4e4d80] font-semibold hover:underline">Sign in</a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="card text-center">
                {flow === 'soba_loading' && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                      <span className="inline-block h-8 w-8 border-2 border-[#62609f] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-slate-800 font-semibold">Account saved.</p>
                    <p className="text-slate-600 text-sm">Registering you with SOBA…</p>
                  </div>
                )}

                {flow === 'soba_error' && (
                  <>
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
                      <span className="text-2xl">!</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-slate-900">SOBA registration failed</h2>
                    <p className="text-slate-600 text-sm mb-4 text-left bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <span className="text-sm text-slate-500 block mb-1">Name</span>
                      <span className="font-semibold block mb-3">{name.trim()}</span>
                      <span className="text-sm text-slate-500 block mb-1">Email</span>
                      <span className="font-semibold break-all">{email.trim()}</span>
                    </p>
                    <div className="alert alert-error text-sm text-left mb-4">{sobaError}</div>
                    <button type="button" onClick={retrySobaOnly} className="btn btn-primary w-full max-w-md mx-auto">
                      Try Again
                    </button>
                    <p className="text-xs text-slate-500 mt-6">
                      Your VoteVerify account is saved. SOBA registration must succeed before you can complete face verification.
                    </p>
                  </>
                )}

                {flow === 'soba_ok' && (
                  <>
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
                      <span className="text-4xl text-emerald-600">✓</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-slate-900">You&apos;re Registered!</h2>
                    
                    <p className="text-slate-600 text-lg leading-relaxed mb-6">
                      You&apos;ll receive a verification email shortly. Please complete the face verification before polling day to be eligible to vote.
                    </p>

                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-8 text-center">
                      <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">We&apos;ll send it to</p>
                      <p className="text-xl font-semibold text-slate-900 break-all">{email.trim()}</p>
                    </div>

                    <div className="voter-form-controls mt-8">
                      <div className="voter-form-actions">
                        <a href="/voter/login" className="btn btn-primary w-full shadow-xl">
                          Go to Dashboard →
                        </a>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-8">
                      Identity verified and secured by SOBA Network.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
