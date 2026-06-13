import { NextResponse } from 'next/server'
import { getCurrentEventId } from '@/lib/events'
import prisma from '@/lib/prisma'
import { normalizeFaceVerifiedStatus } from '@/lib/voterStore'

async function fetchEventVotersNormalized(eventId) {
  const voters = await prisma.voter.findMany({
    where: { eventId },
    orderBy: { registeredAt: 'desc' }
  })

  const updates = []
  const normalized = voters.map(voter => {
    const next = normalizeFaceVerifiedStatus(voter)
    if (next.faceVerifiedToday !== voter.faceVerifiedToday) {
      updates.push(
        prisma.voter.update({
          where: { id: voter.id },
          data: { faceVerifiedToday: next.faceVerifiedToday }
        })
      )
    }
    return next
  })

  if (updates.length) {
    await Promise.all(updates)
  }

  return normalized
}

export async function GET() {
  try {
    const eventId = await getCurrentEventId()
    if (!eventId) {
      return NextResponse.json([])
    }

    const eventVoters = await fetchEventVotersNormalized(eventId)

    console.log(
      `Returning ${eventVoters.length} voters for event ${eventId || '(none)'}`
    )

    return NextResponse.json(eventVoters)
  } catch (err) {
    console.error('GET voters error:', err)
    return NextResponse.json([])
  }
}

function validateNIC(nic) {
  if (!nic) return false
  const cleaned = nic.trim().toUpperCase()
  const oldFormat = /^[0-9]{9}[VX]$/
  const newFormat = /^[0-9]{12}$/
  return oldFormat.test(cleaned) || newFormat.test(cleaned)
}

export async function POST(request) {
  try {
    const { nic, email, name } = await request.json()

    if (!validateNIC(nic)) {
      return NextResponse.json(
        { error: 'Invalid NIC format' },
        { status: 400 }
      )
    }

    const eventId = await getCurrentEventId()
    if (!eventId) {
      return NextResponse.json(
        { error: 'No active event configured. Set Event ID in officer settings.' },
        { status: 503 }
      )
    }

    const formattedNIC = nic.trim().toUpperCase()

    const existing = await prisma.voter.findFirst({
      where: {
        eventId,
        nic: formattedNIC
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      )
    }

    const newVoter = await prisma.voter.create({
      data: {
        eventId,
        nic: formattedNIC,
        email,
        name,
        sobaVerified: false,
        faceVerifiedToday: false,
        hasVoted: false
      }
    })

    console.log('New voter created:', newVoter.email)

    return NextResponse.json({ success: true, voter: newVoter }, { status: 201 })
  } catch (err) {
    console.error('POST voters error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
