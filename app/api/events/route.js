import { NextResponse } from 'next/server'
import { getPublicEventSettings, saveEventSettings, getResolvedSobaCredentials } from '@/lib/events'

export async function GET() {
  const events = getPublicEventSettings()
  // We need to expose credentials for frontend-side sync
  const creds = getResolvedSobaCredentials()
  return NextResponse.json({
    ...events,
    eventId: creds?.eventId || '',
    apiKey: creds?.apiKey || '',
    org_id: '750006'
  })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const eventId = body.eventId
    const apiKey = body.apiKey
    const eventName = body.eventName

    const id = String(eventId || '').trim()
    const key = apiKey != null ? String(apiKey).trim() : ''

    if (!id) {
      return NextResponse.json({ error: 'SOBA Event ID is required' }, { status: 400 })
    }

    if (!key) {
      const current = getPublicEventSettings()
      if (!current.configured) {
        return NextResponse.json({ error: 'SOBA API Key is required' }, { status: 400 })
      }
    }

    const result = saveEventSettings({
      eventId: id,
      apiKey: key || undefined,
      eventName: eventName !== undefined && eventName !== null ? String(eventName) : undefined
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Validation failed' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' })
  } catch (err) {
    console.error('events POST:', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
