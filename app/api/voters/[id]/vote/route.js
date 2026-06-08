import { NextResponse } from 'next/server'
import { getCurrentEventId } from '@/lib/events'
import { readVoters, writeVoters, findVoterIndex } from '@/lib/voterStore'

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const eventId = getCurrentEventId()

    const voters = readVoters()
    const index = findVoterIndex(voters, { id, eventId })

    if (index === -1) {
      return NextResponse.json(
        { error: 'Voter not found for this event' },
        { status: 404 }
      )
    }

    if (voters[index].hasVoted) {
      return NextResponse.json(
        { error: 'Voter has already voted' },
        { status: 400 }
      )
    }

    if (!voters[index].sobaVerified) {
      return NextResponse.json(
        { error: 'Voter not SOBA verified' },
        { status: 400 }
      )
    }

    voters[index].hasVoted = true
    voters[index].votedAt = new Date().toISOString()
    writeVoters(voters)

    return NextResponse.json(voters[index])
  } catch (err) {
    console.error('Vote PATCH error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
