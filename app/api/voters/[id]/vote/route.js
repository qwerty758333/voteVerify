import { NextResponse } from 'next/server'
import { getCurrentEventId } from '@/lib/events'
import prisma from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const eventId = await getCurrentEventId()

    const voter = await prisma.voter.findFirst({
      where: { id, eventId }
    })

    if (!voter) {
      return NextResponse.json(
        { error: 'Voter not found for this event' },
        { status: 404 }
      )
    }

    if (voter.hasVoted) {
      return NextResponse.json(
        { error: 'Voter has already voted' },
        { status: 400 }
      )
    }

    if (!voter.sobaVerified) {
      return NextResponse.json(
        { error: 'Voter not SOBA verified' },
        { status: 400 }
      )
    }

    const updated = await prisma.voter.update({
      where: { id: voter.id },
      data: {
        hasVoted: true,
        votedAt: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Vote PATCH error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
