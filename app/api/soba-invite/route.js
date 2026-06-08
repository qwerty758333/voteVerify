import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const EVENTS_PATH = path.join(
  process.cwd(), 'data', 'events.json'
)

export async function POST(request) {
  try {
    const { email, name } = await request.json()

    // Read credentials
    let apiKey = process.env.SOBA_API_KEY || ''
    let eventId = process.env.SOBA_EVENT_ID || ''

    try {
      if (fs.existsSync(EVENTS_PATH)) {
        const raw = fs.readFileSync(EVENTS_PATH, 'utf8')
        const events = JSON.parse(raw)
        if (events.apiKey) apiKey = events.apiKey
        if (events.eventId) eventId = String(events.eventId)
      }
    } catch (e) {
      console.error('Error reading events.json:', e)
    }

    // Convert to strings explicitly
    const orgId = '750006'
    eventId = String(eventId).trim()
    apiKey = String(apiKey).trim()

    // Log everything for debugging
    console.log('=== SOBA Invite ===')
    console.log('org_id:', orgId)
    console.log('event_id:', eventId)
    console.log('email:', email)
    console.log('api_key prefix:', apiKey.substring(0, 8))
    console.log('Body being sent:', JSON.stringify({
      org_id: orgId,
      event_id: eventId,
      email: email,
      api_key: apiKey
    }))

    // Validate before calling
    if (!apiKey || !eventId || !email) {
      return NextResponse.json({
        success: false,
        error: 'Missing credentials. Configure event in officer settings.'
      }, { status: 400 })
    }

    const response = await fetch(
      'https://poc.soba.network/api/add-attendee',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          org_id: orgId,
          event_id: eventId,
          email: email,
          api_key: apiKey
        })
      }
    )

    const responseText = await response.text()
    console.log('SOBA status:', response.status)
    console.log('SOBA response:', responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      data = { raw: responseText }
    }

    if (response.ok && data.success) {
      return NextResponse.json({ 
        success: true,
        message: 'Registered with SOBA'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || responseText
      }, { status: 400 })
    }

  } catch (err) {
    console.error('SOBA invite error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
