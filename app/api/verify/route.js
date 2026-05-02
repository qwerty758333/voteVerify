import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'voters.json')

function readVoters() {
  if (!fs.existsSync(DB_PATH)) return []
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
}

function writeVoters(voters) {
  fs.writeFileSync(DB_PATH, JSON.stringify(voters, null, 2))
}

export async function POST(request) {
  const { email } = await request.json()

  const voters = readVoters()
  const index = voters.findIndex(v => v.email === email)

  if (index === -1) {
    return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
  }

  // Mark as SOBA verified
  voters[index].sobaVerified = true
  voters[index].verifiedAt = new Date().toISOString()
  writeVoters(voters)

  return NextResponse.json({ success: true, voter: voters[index] })
}