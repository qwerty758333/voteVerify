import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getEventSettings } from '@/lib/events'

const DB_PATH = path.join(process.cwd(), 'data', 'voters.json')

function readVoters() {
  if (!fs.existsSync(DB_PATH)) return []
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
}

function writeVoters(voters) {
  fs.writeFileSync(DB_PATH, JSON.stringify(voters, null, 2))
}

export async function POST(request) {
  try {
    const settings = getEventSettings()
    // In a production app, you would use settings.apiKey here to verify the request with SOBA
    
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const voters = readVoters()
    const index = voters.findIndex(v => v.email === email)

    if (index !== -1) {
      voters[index].sobaVerified = true
      voters[index].verifiedAt = new Date().toISOString()
      writeVoters(voters)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ error: 'Callback failed' }, { status: 500 })
  }
}

// Handle GET redirect from SOBA
export async function GET(request) {
  // Extract email from query params or redirect to home
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (email) {
    // Mark as verified in database
    const DB_PATH = path.join(process.cwd(), 'data', 'voters.json')
    const voters = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
    const index = voters.findIndex(v => v.email === email)
    
    if (index !== -1) {
      voters[index].sobaVerified = true
      voters[index].verifiedAt = new Date().toISOString()
      fs.writeFileSync(DB_PATH, JSON.stringify(voters, null, 2))
    }
  }

  // Redirect to success page
  return NextResponse.redirect(new URL('/voter/success', request.url))
}