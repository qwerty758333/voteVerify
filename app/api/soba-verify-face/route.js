import { NextResponse } from 'next/server'
import { getResolvedSobaCredentials, getCurrentEventId, SOBA_ORG_ID } from '@/lib/events'
import prisma from '@/lib/prisma'

const SOBA_VERIFY_FACE = 'https://poc.soba.network/api/verify-face'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const creds = await getResolvedSobaCredentials()
    if (!creds) {
      return NextResponse.json(
        { error: 'SOBA is not configured. Set Event ID + API Key in Officer Settings or .env.local.' },
        { status: 503 }
      )
    }

    const eventId = String(creds.eventId || '').trim()
    const apiKey = String(creds.apiKey || '').trim()
    if (!eventId || !apiKey) {
      return NextResponse.json({ error: 'SOBA credentials missing' }, { status: 503 })
    }

    const body = { org_id: SOBA_ORG_ID, event_id: eventId, email }

    const res = await fetch(SOBA_VERIFY_FACE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(body)
    })

    const text = await res.text()
    let json = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = { _parseError: true, raw: text }
    }

    const faceRegistered = !!(json && json.face_id_registered === true)
    const faceVerified = !!(json && json.verified === true)

    if (faceRegistered && faceVerified) {
      const currentEventId = await getCurrentEventId()
      const em = String(email).toLowerCase().trim()

      const voter = await prisma.voter.findFirst({
        where: { eventId: currentEventId, email: em }
      })

      if (voter) {
        const updated = await prisma.voter.update({
          where: { id: voter.id },
          data: {
            faceVerifiedToday: true,
            lastVerifiedAt: new Date()
          }
        })
        return NextResponse.json({ success: true, voter: updated })
      }
    }

    return NextResponse.json({
      success: false,
      face_id_registered: faceRegistered,
      verified: faceVerified
    })
  } catch (err) {
    console.error('[soba-verify-face] failed:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
