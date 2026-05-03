import { NextResponse } from 'next/server'
import { getPublicEventSettings, saveEventSettings } from '@/lib/events'

export async function GET() {
  const events = getPublicEventSettings()
  return NextResponse.json(events)
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
