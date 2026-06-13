import { NextResponse } from 'next/server'
import { getCurrentEventId } from '@/lib/events'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { email } = await request.json()
    const eventId = await getCurrentEventId()
    const em = String(email || '').trim().toLowerCase()

    if (!em) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    console.log('SOBA verifying email:', em)

    const voter = await prisma.voter.findFirst({
      where: {
        eventId,
        email: em
      }
    })

    if (!voter) {
      return NextResponse.json(
        { error: 'Voter not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.voter.update({
      where: { id: voter.id },
      data: {
        sobaVerified: true,
        verifiedAt: new Date()
      }
    })

    console.log('SOBA verified:', updated.email)

    return NextResponse.json({
      success: true,
      voter: updated
    })
  } catch (err) {
    console.error('Verify SOBA error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
