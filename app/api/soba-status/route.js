import { NextResponse } from 'next/server'
import { getResolvedSobaCredentials, getCurrentEventId, SOBA_ORG_ID } from '@/lib/events'
import { readVoters, writeVoters, findVoterIndex } from '@/lib/voterStore'

const SOBA_ADD_ATTENDEE = 'https://poc.soba.network/api/add-attendee'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = String(searchParams.get('email') || '').trim()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const creds = getResolvedSobaCredentials()
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

    const res = await fetch(SOBA_ADD_ATTENDEE, {
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

    const faceRegistered = !!(json && typeof json === 'object' && json.face_id_registered === true)
    let updated = false
    let updatedAt = null

    if (faceRegistered) {
      const voters = readVoters()
      const idx = findVoterIndex(voters, { email, eventId: getCurrentEventId() })
      if (idx !== -1 && !voters[idx].sobaVerified) {
        voters[idx].sobaVerified = true
        updatedAt = new Date().toISOString()
        voters[idx].verifiedAt = updatedAt
        writeVoters(voters)
        updated = true
      }
    }

    return NextResponse.json({
      verified: faceRegistered,
      email,
      updated,
      updatedAt,
      soba_status: res.status
    })
  } catch (err) {
    console.error('[soba-status] failed:', err)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}
