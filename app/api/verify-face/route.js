import { NextResponse } from 'next/server'
import { getCurrentEventId } from '@/lib/events'
import { readVoters, writeVoters, findVoterIndex } from '@/lib/voterStore'

export async function POST(request) {
  try {
    const { voterId, email } = await request.json()
    const eventId = getCurrentEventId()
    const voters = readVoters()

    const idx = findVoterIndex(voters, {
      id: voterId,
      email,
      eventId
    })

    if (idx === -1) {
      return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
    }

    voters[idx].faceVerifiedToday = true
    voters[idx].lastVerifiedAt = new Date().toISOString()
    writeVoters(voters)

    return NextResponse.json({
      success: true,
      voter: voters[idx]
    })
  } catch (err) {
    console.error('Verify face error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
