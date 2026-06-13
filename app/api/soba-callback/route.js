import { NextResponse } from 'next/server'
import { getResolvedSobaCredentials, getCurrentEventId } from '@/lib/events'
import prisma from '@/lib/prisma'

async function markVerifiedByEmail(email) {
  if (!email) return

  const eventId = await getCurrentEventId()
  const em = String(email).trim().toLowerCase()

  const voter = await prisma.voter.findFirst({
    where: { eventId, email: em }
  })

  if (!voter) return

  await prisma.voter.update({
    where: { id: voter.id },
    data: {
      sobaVerified: true,
      verifiedAt: new Date()
    }
  })
}

export async function POST(request) {
  try {
    const creds = await getResolvedSobaCredentials()
    if (!creds) {
      console.warn('soba-callback: SOBA credentials not configured')
    }

    const body = await request.json()
    const email = body.email

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    await markVerifiedByEmail(String(email).trim())

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ error: 'Callback failed' }, { status: 500 })
  }
}

export async function GET(request) {
  const creds = await getResolvedSobaCredentials()
  if (!creds) {
    console.warn('soba-callback GET: SOBA credentials not configured')
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (email) {
    await markVerifiedByEmail(String(email).trim())
  }

  return NextResponse.redirect(new URL('/voter/success', request.url))
}
