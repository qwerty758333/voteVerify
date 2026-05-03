import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getResolvedSobaCredentials } from '@/lib/events'

const DB_PATH = path.join(process.cwd(), 'data', 'voters.json')

function readVoters() {
  try {
    if (!fs.existsSync(DB_PATH)) return []
    const content = fs.readFileSync(DB_PATH, 'utf8')
    if (!content?.trim()) return []
    return JSON.parse(content)
  } catch {
    return []
  }
}

function writeVoters(voters) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(voters, null, 2))
}

function markVerifiedByEmail(email) {
  if (!email) return
  const voters = readVoters()
  const index = voters.findIndex(v => v.email === email)
  if (index !== -1) {
    voters[index].sobaVerified = true
    voters[index].verifiedAt = new Date().toISOString()
    writeVoters(voters)
  }
}

export async function POST(request) {
  try {
    const creds = getResolvedSobaCredentials()
    if (!creds) {
      console.warn('soba-callback: SOBA credentials not configured')
    }

    const body = await request.json()
    const email = body.email

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    markVerifiedByEmail(String(email).trim())

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ error: 'Callback failed' }, { status: 500 })
  }
}

export async function GET(request) {
  const creds = getResolvedSobaCredentials()
  if (!creds) {
    console.warn('soba-callback GET: SOBA credentials not configured')
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (email) {
    markVerifiedByEmail(String(email).trim())
  }

  return NextResponse.redirect(new URL('/voter/success', request.url))
}
