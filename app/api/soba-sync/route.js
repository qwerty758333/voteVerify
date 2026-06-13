import { NextResponse } from 'next/server'
import { getResolvedSobaCredentials } from '@/lib/events'
import prisma from '@/lib/prisma'

const SOBA_VERIFIED_USERS = 'https://poc.soba.network/api/verified-users'

function isSobaVerifiedResponse(data) {
  return (
    data?.face_id_registered === true ||
    data?.verified === true ||
    data?.data?.face_id_registered === true ||
    data?.data?.verified === true ||
    data?.status === 'verified'
  )
}

export async function POST() {
  try {
    const creds = await getResolvedSobaCredentials()
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

    const unverified = await prisma.voter.findMany({
      where: { eventId, sobaVerified: false }
    })

    console.log(`Checking ${unverified.length} voters for event ${eventId}`)

    let synced = 0

    for (const voter of unverified) {
      const email = String(voter.email || '').trim()
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

        if (isSobaVerifiedResponse(data)) {
          await prisma.voter.update({
            where: { id: voter.id },
            data: {
              sobaVerified: true,
              verifiedAt: new Date()
            }
          })
          synced += 1
          console.log('Verified:', email)
        }
      } catch {
        console.log('Timeout/error for', email, '- skipping')
      }
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
