import { NextResponse } from 'next/server'
import { getCurrentEventId } from '@/lib/events'
import { readVotes } from '@/lib/voteStore'

export async function GET() {
  try {
    const eventId = getCurrentEventId()
    const voteData = readVotes()

    const eid = String(eventId || '')
    const candidatesWithCounts = voteData.candidates.map(c => ({
      ...c,
      votes: voteData.votes.filter(v => {
        if (v.choice !== c.name) return false
        const vid =
          v.eventId != null && String(v.eventId).trim() !== ''
            ? String(v.eventId).trim()
            : eid
        return vid === eid
      }).length
    }))

    return NextResponse.json(candidatesWithCounts)
  } catch (err) {
    console.error('GET candidates error:', err)
    return NextResponse.json([])
  }
}
