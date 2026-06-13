import { NextResponse } from 'next/server'
import { getCurrentEventId } from '@/lib/events'
import prisma from '@/lib/prisma'
import { isFaceVerifiedToday } from '@/lib/voterStore'

export async function POST(request) {
  try {
    const { voterId, choice } = await request.json()
    const eventId = await getCurrentEventId()

    if (!eventId) {
      return NextResponse.json(
        { error: 'No active event configured' },
        { status: 503 }
      )
    }

    const voter = await prisma.voter.findFirst({
      where: { id: voterId, eventId }
    })

    if (!voter) {
      return NextResponse.json(
        { error: 'Voter not found for this event' },
        { status: 404 }
      )
    }

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

    await prisma.vote.create({
      data: {
        eventId,
        voterId,
        choice
      }
    })

    console.log(`Vote cast for ${choice}`)

    await prisma.candidate.updateMany({
      where: { name: choice },
      data: { votes: { increment: 1 } }
    })

    const updatedVoter = await prisma.voter.update({
      where: { id: voterId },
      data: {
        hasVoted: true,
        votedAt: new Date()
      }
    })

    console.log('Voter marked as voted:', updatedVoter.email)

    return NextResponse.json({
      success: true,
      message: 'Vote cast and recorded',
      voter: updatedVoter
    })
  } catch (err) {
    console.error('Vote error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
