import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  SOBA_ORG_ID,
  getPublicEventSettings,
  getResolvedSobaCredentials,
  getVerificationUrl,
  getRegistrationUrl,
  fetchLatestEvent
} from '@/lib/events'

export async function GET() {
  try {
    const events = await getPublicEventSettings()
    const creds = await getResolvedSobaCredentials()

    return NextResponse.json({
      ...events,
      eventId: creds?.eventId || '',
      apiKey: creds?.apiKey || '',
      org_id: events.org_id || SOBA_ORG_ID
    })
  } catch (err) {
    console.error('GET events error:', err)
    return NextResponse.json({})
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const eventId = body.eventId
    const apiKey = body.apiKey
    const eventName = body.eventName
    const verificationUrl = body.verificationUrl
    const registrationUrl = body.registrationUrl
    const orgId = body.orgId

    const id = String(eventId || '').trim()
    const key = apiKey != null ? String(apiKey).trim() : ''

    if (!id) {
      return NextResponse.json({ error: 'SOBA Event ID is required' }, { status: 400 })
    }

    const existing = await fetchLatestEvent()
    const current = await getPublicEventSettings()

    if (!key) {
      if (!current.configured && !existing?.apiKey) {
        return NextResponse.json({ error: 'SOBA API Key is required' }, { status: 400 })
      }
    }

    const resolvedKey =
      key || existing?.apiKey?.trim() || (await getResolvedSobaCredentials())?.apiKey || ''

    if (!resolvedKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 })
    }

    const resolvedName =
      eventName !== undefined && eventName !== null
        ? String(eventName).trim()
        : existing?.eventName || ''

    const resolvedOrg =
      orgId != null && String(orgId).trim() !== ''
        ? String(orgId).trim()
        : existing?.orgId || SOBA_ORG_ID

    const resolvedVerification =
      verificationUrl !== undefined && verificationUrl !== null
        ? String(verificationUrl).trim()
        : getVerificationUrl(existing)

    const resolvedRegistration =
      registrationUrl !== undefined && registrationUrl !== null
        ? String(registrationUrl).trim()
        : getRegistrationUrl(existing)

    console.log('Updating event:', id)

    await prisma.event.upsert({
      where: { eventId: id },
      update: {
        apiKey: resolvedKey,
        orgId: resolvedOrg,
        eventName: resolvedName,
        verificationUrl: resolvedVerification,
        registrationUrl: resolvedRegistration
      },
      create: {
        eventId: id,
        apiKey: resolvedKey,
        orgId: resolvedOrg,
        eventName: resolvedName,
        verificationUrl: resolvedVerification,
        registrationUrl: resolvedRegistration
      }
    })

    console.log('Event updated:', resolvedName)

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    })
  } catch (err) {
    console.error('POST events error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to save settings' },
      { status: 500 }
    )
  }
}
