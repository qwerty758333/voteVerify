import { NextResponse } from 'next/server'
import { getResolvedSobaCredentials, SOBA_ORG_ID } from '@/lib/events'

const SOBA_ADD_ATTENDEE = 'https://poc.soba.network/api/add-attendee'

export async function POST(request) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim()
    const name = body.name != null ? String(body.name).trim() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required' },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required to register with SOBA' },
        { status: 400 }
      )
    }

    const creds = getResolvedSobaCredentials()
    if (!creds) {
      return NextResponse.json(
        {
          success: false,
          error:
            'SOBA is not configured. Add Event ID and API Key under Officer Settings, or set SOBA_EVENT_ID and SOBA_API_KEY in .env.local.'
        },
        { status: 503 }
      )
    }

    const eventIdStr = String(creds.eventId).trim()
    if (!eventIdStr) {
      return NextResponse.json(
        { success: false, error: 'Event ID is missing. Configure it in Officer Settings or .env.local.' },
        { status: 503 }
      )
    }

    const payload = {
      org_id: SOBA_ORG_ID,
      event_id: eventIdStr,
      email
    }

    console.log('Calling SOBA add-attendee...')
    console.log('Event ID:', eventIdStr)
    console.log('API Key prefix:', creds.apiKey?.substring(0, 8))
    console.log('Email:', email)
    console.log('Request body:', JSON.stringify(payload))

    let sobaRes
    try {
      // FORMAT A (requested): x-api-key header
      sobaRes = await fetch(SOBA_ADD_ATTENDEE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': creds.apiKey
        },
        body: JSON.stringify(payload)
      })
    } catch (networkErr) {
      console.error('[SOBA add-attendee] network error (full):', networkErr)
      return NextResponse.json(
        { success: false, error: 'Could not reach SOBA. Check your connection and try again.' },
        { status: 502 }
      )
    }

    const rawText = await sobaRes.text()

    let sobaJson = null
    try {
      sobaJson = rawText ? JSON.parse(rawText) : null
    } catch {
      sobaJson = { _parseError: true, raw: rawText }
    }

    console.log('SOBA status:', sobaRes.status)
    console.log('SOBA response:', rawText)
    if (sobaJson && typeof sobaJson === 'object') {
      console.log('[SOBA add-attendee] FULL response JSON:', JSON.stringify(sobaJson))
    }

    if (!sobaRes.ok) {
      const msg =
        (sobaJson && !sobaJson._parseError && (sobaJson.message || sobaJson.error || sobaJson.detail)) ||
        (typeof rawText === 'string' && rawText.trim() ? rawText.trim() : null) ||
        `SOBA returned ${sobaRes.status}. Please check Event ID and API Key.`
      console.error('[SOBA add-attendee] FAILED:', sobaRes.status, msg)
      return NextResponse.json({ success: false, error: String(msg) }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      message: 'Registered with SOBA',
      soba: sobaJson
    })
  } catch (error) {
    console.error('[SOBA add-attendee] route error (full):', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
