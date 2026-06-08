import { NextResponse } from 'next/server'
import { getResolvedSobaCredentials, getCurrentEventId } from '@/lib/events'
import {
  readVoters,
  writeVoters,
  voterMatchesEvent
} from '@/lib/voterStore'

const SOBA_VERIFIED_USERS = 'https://poc.soba.network/api/verified-users'

export async function POST() {
  try {
    const creds = getResolvedSobaCredentials()
    if (!creds) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing SOBA credentials. Configure event settings first.'
        },
        { status: 400 }
      )
    }

    const { eventId, apiKey } = creds
    const voters = readVoters()
    const unverified = voters.filter(
      v => !v.sobaVerified && voterMatchesEvent(v, eventId)
    )
    console.log(
      `Checking ${unverified.length} voters for event ${eventId}`
    )

    let synced = 0

    for (let i = 0; i < voters.length; i++) {
      if (!voterMatchesEvent(voters[i], eventId)) continue
      if (voters[i].sobaVerified) continue

      const email = String(voters[i].email || '').trim()
      if (!email) continue

      try {
        await new Promise(r => setTimeout(r, 500))

        const response = await fetch(
          `${SOBA_VERIFIED_USERS}?event_id=${encodeURIComponent(eventId)}&org_id=750006&email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'api-key': apiKey
            }
          }
        )

        console.log('Status check for', email, ':', response.status)

        if (!response.ok) continue

        const data = await response.json()

        const isVerified =
          data?.face_id_registered === true ||
          data?.verified === true ||
          data?.data?.face_id_registered === true ||
          data?.data?.verified === true ||
          data?.status === 'verified'

        if (isVerified) {
          voters[i].sobaVerified = true
          voters[i].verifiedAt = new Date().toISOString()
          synced += 1
          console.log('Verified:', email)
        }
      } catch (err) {
        console.log('Timeout/error for', email, '- skipping')
      }
    }

    if (synced > 0) {
      writeVoters(voters)
    }

    console.log('Sync done. Updated:', synced)

    return NextResponse.json({
      success: true,
      synced,
      total_checked: unverified.length,
      eventId
    })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
