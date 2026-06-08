import { NextResponse } from 'next/server'
import { getCurrentEventId } from '@/lib/events'
import {
  readVotersNormalized,
  writeVoters,
  findVoterIndex,
  isFaceVerifiedToday
} from '@/lib/voterStore'
import { readVotes, writeVotes } from '@/lib/voteStore'

export async function POST(request) {
  try {
    const { voterId, choice } = await request.json()
    const eventId = getCurrentEventId()

    if (!eventId) {
      return NextResponse.json(
        { error: 'No active event configured' },
        { status: 503 }
      )
    }

    const voters = readVotersNormalized()
    const voterIndex = findVoterIndex(voters, { id: voterId, eventId })

    if (voterIndex === -1) {
      return NextResponse.json(
        { error: 'Voter not found for this event' },
        { status: 404 }
      )
    }

    const voter = voters[voterIndex]

    if (!isFaceVerifiedToday(voter)) {
      return NextResponse.json(
        { error: 'Face not verified today' },
        { status: 403 }
      )
    }

    if (voter.hasVoted) {
      return NextResponse.json(
        { error: 'Already voted' },
        { status: 400 }
      )
    }

    const voteData = readVotes()

    voteData.votes.push({
      id: 'vote_' + Date.now(),
      eventId,
      voterId,
      choice,
      timestamp: new Date().toISOString()
    })

    writeVotes(voteData)

    voters[voterIndex].hasVoted = true
    voters[voterIndex].votedAt = new Date().toISOString()
    writeVoters(voters)

    return NextResponse.json({
      success: true,
      message: 'Vote cast and recorded'
    })
  } catch (err) {
    console.error('Vote error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
