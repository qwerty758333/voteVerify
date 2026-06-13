import { NextResponse } from 'next/server'
import { getCurrentEventId } from '@/lib/events'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { voterId, email } = await request.json()
    const eventId = await getCurrentEventId()

    console.log('Verifying face for:', email)

    const where = voterId
      ? { id: voterId, eventId }
      : email
        ? {
            eventId,
            email: String(email).toLowerCase().trim()
          }
        : null

    if (!where || !eventId) {
      return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
    }

    const voter = await prisma.voter.findFirst({ where })

    if (!voter) {
      return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
    }

    const updated = await prisma.voter.update({
      where: { id: voter.id },
      data: {
        faceVerifiedToday: true,
        lastVerifiedAt: new Date()
      }
    })

    console.log('Face verified for:', updated.email)

    return NextResponse.json({
      success: true,
      voter: updated
    })
  } catch (err) {
    console.error('Verify face error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
