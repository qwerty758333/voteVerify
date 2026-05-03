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

export async function POST(request) {
  const creds = getResolvedSobaCredentials()
  if (!creds) {
    return NextResponse.json(
      {
        error:
          'VoteVerify has no active SOBA credentials. Configure Event ID and API Key in Officer Settings or .env.local.'
      },
      { status: 503 }
    )
  }

  const { email } = await request.json()
  const em = String(email || '').trim()

  if (!em) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const voters = readVoters()
  const index = voters.findIndex(v => v.email === em)

  if (index === -1) {
    return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
  }

  voters[index].sobaVerified = true
  voters[index].verifiedAt = new Date().toISOString()
  writeVoters(voters)

  return NextResponse.json({ success: true, voter: voters[index] })
}
