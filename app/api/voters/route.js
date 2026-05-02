import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'voters.json')

function readVoters() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return []
    }
    const content = fs.readFileSync(DB_PATH, 'utf8')
    if (!content || content.trim() === '') {
      return []
    }
    return JSON.parse(content)
  } catch (err) {
    console.error('Error reading voters:', err)
    return []
  }
}

function writeVoters(voters) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    fs.writeFileSync(DB_PATH, JSON.stringify(voters, null, 2))
  } catch (err) {
    console.error('Error writing voters:', err)
  }
}

export async function GET() {
  const voters = readVoters()
  return NextResponse.json(voters)
}

export async function POST(request) {
  const { nic, email, name } = await request.json()

  const voters = readVoters()

  const existing = voters.find(v => v.nic === nic)
  if (existing) {
    return NextResponse.json(
      { error: 'This NIC is already registered' },
      { status: 400 }
    )
  }

  const newVoter = {
    id: Date.now().toString(),
    nic,
    email,
    name,
    sobaVerified: false,
    hasVoted: false,
    registeredAt: new Date().toISOString()
  }

  voters.push(newVoter)
  writeVoters(voters)

  return NextResponse.json(newVoter, { status: 201 })
}