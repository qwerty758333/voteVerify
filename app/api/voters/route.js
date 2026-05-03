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
  console.log('Returning voters:', voters.length)
  return NextResponse.json(voters)
}

function validateNIC(nic) {
  if (!nic) return false
  const cleaned = nic.trim().toUpperCase()
  const oldFormat = /^[0-9]{9}[VX]$/
  const newFormat = /^[0-9]{12}$/
  return oldFormat.test(cleaned) || newFormat.test(cleaned)
}

export async function POST(request) {
  const { nic, email, name } = await request.json()

  if (!validateNIC(nic)) {
    return NextResponse.json(
      { error: 'Invalid NIC format' },
      { status: 400 }
    )
  }

  const formattedNIC = nic.trim().toUpperCase()
  const voters = readVoters()

  const existing = voters.find(v => v.nic === formattedNIC)
  if (existing) {
    return NextResponse.json(
      { error: 'This NIC is already registered' },
      { status: 400 }
    )
  }

  const newVoter = {
    id: Date.now().toString(),
    nic: formattedNIC,
    email,
    name,
    sobaVerified: false,
    faceVerifiedToday: false,
    hasVoted: false,
    registeredAt: new Date().toISOString(),
    verifiedAt: null,
    lastVerifiedAt: null,
    votedAt: null
  }

  voters.push(newVoter)
  writeVoters(voters)

  return NextResponse.json(newVoter, { status: 201 })
}