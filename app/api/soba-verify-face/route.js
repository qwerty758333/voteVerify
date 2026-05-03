import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getResolvedSobaCredentials, SOBA_ORG_ID } from '@/lib/events'

const SOBA_VERIFY_FACE = 'https://poc.soba.network/api/verify-face'
const DB_PATH = path.join(process.cwd(), 'data', 'voters.json')

function readVoters() {
  try {
    if (!fs.existsSync(DB_PATH)) return []
    const content = fs.readFileSync(DB_PATH, 'utf8')
    if (!content?.trim()) return []
    return JSON.parse(content)
  } catch (err) {
    console.error('[soba-verify-face] read voters failed:', err)
    return []
  }
}

function writeVoters(voters) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(voters, null, 2))
}

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

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

    const body = { org_id: SOBA_ORG_ID, event_id: eventId, email }

    const res = await fetch(SOBA_VERIFY_FACE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(body)
    })

    const text = await res.text()
    let json = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = { _parseError: true, raw: text }
    }

    // Response contains: face_id_registered: true (face exists), verified: true (face matched today)
    const faceRegistered = !!(json && json.face_id_registered === true)
    const faceVerified = !!(json && json.verified === true)

    if (faceRegistered && faceVerified) {
      const voters = readVoters()
      const idx = voters.findIndex(v => v.email === email)
      if (idx !== -1) {
        voters[idx].faceVerifiedToday = true
        voters[idx].lastVerifiedAt = new Date().toISOString()
        writeVoters(voters)
        return NextResponse.json({ success: true, voter: voters[idx] })
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: faceRegistered ? 'Face verification failed' : 'Face ID not registered',
      json 
    })
  } catch (err) {
    console.error('[soba-verify-face] failed:', err)
    return NextResponse.json({ error: 'Verification check failed' }, { status: 500 })
  }
}
