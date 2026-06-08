import { NextResponse } from 'next/server'
import { getCurrentEventId } from '@/lib/events'
import {
  readVoters,
  readVotersNormalized,
  writeVoters,
  filterVotersByEvent,
  voterMatchesEvent
} from '@/lib/voterStore'

export async function GET() {
  try {
    const eventId = getCurrentEventId()
    const allVoters = readVotersNormalized()
    const eventVoters = filterVotersByEvent(allVoters, eventId)

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

    const eventId = getCurrentEventId()
    if (!eventId) {
      return NextResponse.json(
        { error: 'No active event configured. Set Event ID in officer settings.' },
        { status: 503 }
      )
    }

    const formattedNIC = nic.trim().toUpperCase()
    const voters = readVoters()

    const existing = voters.find(
      v => v.nic === formattedNIC && voterMatchesEvent(v, eventId)
    )

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      )
    }

    const newVoter = {
      id: Date.now().toString(),
      eventId,
      nic: formattedNIC,
      email,
      name,
      sobaVerified: false,
      faceVerifiedToday: false,
      hasVoted: false,
      registeredAt: new Date().toISOString(),
      verifiedAt: null,
      lastVerifiedAt: null,
      votedAt: null
    }

    voters.push(newVoter)
    writeVoters(voters)

    return NextResponse.json({ success: true, voter: newVoter }, { status: 201 })
  } catch (err) {
    console.error('POST voters error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
