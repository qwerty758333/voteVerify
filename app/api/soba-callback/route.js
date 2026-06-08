import { NextResponse } from 'next/server'
import { getResolvedSobaCredentials, getCurrentEventId } from '@/lib/events'
import { readVoters, writeVoters, findVoterIndex } from '@/lib/voterStore'

function markVerifiedByEmail(email) {
  if (!email) return
  const eventId = getCurrentEventId()
  const voters = readVoters()
  const index = findVoterIndex(voters, { email, eventId })
  if (index !== -1) {
    voters[index].sobaVerified = true
    voters[index].verifiedAt = new Date().toISOString()
    writeVoters(voters)
  }
}

export async function POST(request) {
  try {
    const creds = getResolvedSobaCredentials()
    if (!creds) {
      console.warn('soba-callback: SOBA credentials not configured')
    }

    const body = await request.json()
    const email = body.email

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    markVerifiedByEmail(String(email).trim())

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ error: 'Callback failed' }, { status: 500 })
  }
}

export async function GET(request) {
  const creds = getResolvedSobaCredentials()
  if (!creds) {
    console.warn('soba-callback GET: SOBA credentials not configured')
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (email) {
    markVerifiedByEmail(String(email).trim())
  }

  return NextResponse.redirect(new URL('/voter/success', request.url))
}
