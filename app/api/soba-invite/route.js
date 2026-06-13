import { NextResponse } from 'next/server'
import { getResolvedSobaCredentials, SOBA_ORG_ID } from '@/lib/events'

export async function POST(request) {
  try {
    const { email, name } = await request.json()

    const creds = await getResolvedSobaCredentials()
    const orgId = SOBA_ORG_ID
    const eventId = String(creds?.eventId || process.env.SOBA_EVENT_ID || '').trim()
    const apiKey = String(creds?.apiKey || process.env.SOBA_API_KEY || '').trim()

    console.log('=== SOBA Invite ===')
    console.log('org_id:', orgId)
    console.log('event_id:', eventId)
    console.log('email:', email)
    console.log('api_key prefix:', apiKey.substring(0, 8))
    console.log(
      'Body being sent:',
      JSON.stringify({
        org_id: orgId,
        event_id: eventId,
        email: email,
        api_key: apiKey
      })
    )

    if (!apiKey || !eventId || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing credentials. Configure event in officer settings.'
        },
        { status: 400 }
      )
    }

    const response = await fetch('https://poc.soba.network/api/add-attendee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        org_id: orgId,
        event_id: eventId,
        email: email,
        api_key: apiKey,
        name
      })
    })

    const responseText = await response.text()
    console.log('SOBA status:', response.status)
    console.log('SOBA response:', responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { raw: responseText }
    }

    if (response.ok && data.success) {
      return NextResponse.json({
        success: true,
        message: 'Registered with SOBA'
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: data.message || responseText
      },
      { status: 400 }
    )
  } catch (err) {
    console.error('SOBA invite error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    )
  }
}
