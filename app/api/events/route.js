import { NextResponse } from 'next/server'
import { getEventSettings, saveEventSettings } from '@/lib/events'

export async function GET() {
  const events = getEventSettings()
  return NextResponse.json(events)
}

export async function POST(request) {
  try {
    const { eventId, apiKey } = await request.json()
    
    if (!eventId || !apiKey) {
      return NextResponse.json({ error: 'Event ID and API Key are required' }, { status: 400 })
    }

    const success = saveEventSettings({ eventId, apiKey })
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Settings saved successfully' })
    } else {
      throw new Error('Failed to save settings')
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
