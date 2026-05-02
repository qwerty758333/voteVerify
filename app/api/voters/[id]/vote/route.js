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

export async function PATCH(request, { params }) {
  const { id } = params
  const voters = readVoters()

  const index = voters.findIndex(v => v.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
  }

  // Prevent duplicate voting
  if (voters[index].hasVoted) {
    return NextResponse.json({ error: 'Voter has already voted' }, { status: 400 })
  }

  // Must be SOBA verified to vote
  if (!voters[index].sobaVerified) {
    return NextResponse.json({ error: 'Voter is not SOBA verified' }, { status: 400 })
  }

  voters[index].hasVoted = true
  voters[index].votedAt = new Date().toISOString()
  writeVoters(voters)

  return NextResponse.json(voters[index])
}