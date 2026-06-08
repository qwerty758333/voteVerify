import { NextResponse } from 'next/server'
import { getResolvedSobaCredentials, getCurrentEventId } from '@/lib/events'
import { readVoters, writeVoters, findVoterIndex } from '@/lib/voterStore'

export async function POST(request) {
  const creds = getResolvedSobaCredentials()
  if (!creds) {
    return NextResponse.json(
      {
        error:
          'VoteVerify has no active SOBA credentials. Configure Event ID and API Key in Officer Settings or .env.local.'
      },
      { status: 503 }
    )
  }

  const { email } = await request.json()
  const em = String(email || '').trim()

  if (!em) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const eventId = getCurrentEventId()
  const voters = readVoters()
  const index = findVoterIndex(voters, { email: em, eventId })

  if (index === -1) {
    return NextResponse.json({ error: 'Voter not found for this event' }, { status: 404 })
  }

  voters[index].sobaVerified = true
  voters[index].verifiedAt = new Date().toISOString()
  writeVoters(voters)

  return NextResponse.json({ success: true, voter: voters[index] })
}
