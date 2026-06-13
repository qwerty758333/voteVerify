import { NextResponse } from 'next/server'
import { getResolvedSobaCredentials, getCurrentEventId } from '@/lib/events'
import prisma from '@/lib/prisma'

export async function POST(request) {
  const creds = await getResolvedSobaCredentials()
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
  const em = String(email || '').trim().toLowerCase()

  if (!em) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const eventId = await getCurrentEventId()

  const voter = await prisma.voter.findFirst({
    where: { eventId, email: em }
  })

  if (!voter) {
    return NextResponse.json({ error: 'Voter not found for this event' }, { status: 404 })
  }

  const updated = await prisma.voter.update({
    where: { id: voter.id },
    data: {
      sobaVerified: true,
      verifiedAt: new Date()
    }
  })

  return NextResponse.json({ success: true, voter: updated })
}
