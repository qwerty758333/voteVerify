import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getResolvedSobaCredentials, SOBA_ORG_ID } from '@/lib/events'

const SOBA_ADD_ATTENDEE = 'https://poc.soba.network/api/add-attendee'
const DB_PATH = path.join(process.cwd(), 'data', 'voters.json')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function readVoters() {
  try {
    if (!fs.existsSync(DB_PATH)) return []
    const content = fs.readFileSync(DB_PATH, 'utf8')
    if (!content?.trim()) return []
    return JSON.parse(content)
  } catch (err) {
    console.error('[soba-sync] read voters failed:', err)
    return []
  }
}

function writeVoters(voters) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(voters, null, 2))
}

export async function POST() {
  try {
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

    const voters = readVoters()
    const targets = voters.filter(v => !v.sobaVerified && v.email)

    let synced = 0
    const updated_voters = []
    let total_checked = 0

    for (const v of targets) {
      total_checked += 1
      const email = String(v.email || '').trim()
      if (!email) continue

      const body = { org_id: SOBA_ORG_ID, event_id: eventId, email }
      try {
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
          json = null
        }

        const faceRegistered = !!(json && typeof json === 'object' && json.face_id_registered === true)
        if (faceRegistered) {
          const idx = voters.findIndex(x => x.email === email)
          if (idx !== -1 && !voters[idx].sobaVerified) {
            voters[idx].sobaVerified = true
            voters[idx].verifiedAt = new Date().toISOString()
            synced += 1
            updated_voters.push(email)
          }
        }
      } catch (err) {
        console.error('[soba-sync] check failed for', email, err)
      }

      // rate limiting guard
      await sleep(500)
    }

    if (synced > 0) {
      writeVoters(voters)
    }

    return NextResponse.json({
      synced,
      total_checked,
      updated_voters
    })
  } catch (err) {
    console.error('[soba-sync] failed:', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

