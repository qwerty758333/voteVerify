import fs from 'fs'
import path from 'path'
import { getCurrentEventId } from '@/lib/events'

const VOTERS_PATH = path.join(process.cwd(), 'data', 'voters.json')

export function readVoters() {
  try {
    if (!fs.existsSync(VOTERS_PATH)) return []
    const content = fs.readFileSync(VOTERS_PATH, 'utf8')
    if (!content?.trim()) return []
    return JSON.parse(content)
  } catch (err) {
    console.error('Error reading voters:', err)
    return []
  }
}

export function writeVoters(voters) {
  fs.mkdirSync(path.dirname(VOTERS_PATH), { recursive: true })
  fs.writeFileSync(VOTERS_PATH, JSON.stringify(voters, null, 2), 'utf8')
}

/** Whether a voter record belongs to the given event */
export function voterMatchesEvent(voter, eventId) {
  const eid = String(eventId || '').trim()
  const stored = voter?.eventId
  if (stored != null && String(stored).trim() !== '') {
    return String(stored).trim() === eid
  }
  // Legacy rows without eventId: only visible for the configured current event
  return eid === getCurrentEventId()
}

export function filterVotersByEvent(voters, eventId) {
  const eid = String(eventId || getCurrentEventId() || '').trim()
  return voters.filter(v => voterMatchesEvent(v, eid))
}

/** True only when face was verified on the current calendar day */
export function isFaceVerifiedToday(voter) {
  if (!voter?.faceVerifiedToday || !voter?.lastVerifiedAt) return false
  try {
    return (
      new Date(voter.lastVerifiedAt).toDateString() ===
      new Date().toDateString()
    )
  } catch {
    return false
  }
}

export function normalizeFaceVerifiedStatus(voter) {
  if (!voter) return voter
  const verifiedToday = isFaceVerifiedToday(voter)
  if (voter.faceVerifiedToday === verifiedToday) return voter
  return { ...voter, faceVerifiedToday: verifiedToday }
}

export function readVotersNormalized() {
  const voters = readVoters()
  let changed = false
  const normalized = voters.map(v => {
    const next = normalizeFaceVerifiedStatus(v)
    if (next.faceVerifiedToday !== v.faceVerifiedToday) changed = true
    return next
  })
  if (changed) writeVoters(normalized)
  return normalized
}

export function findVoterIndex(voters, { id, email, eventId }) {
  const eid = String(eventId || getCurrentEventId() || '').trim()
  if (id) {
    return voters.findIndex(v => v.id === id && voterMatchesEvent(v, eid))
  }
  if (email) {
    const em = String(email).toLowerCase().trim()
    return voters.findIndex(
      v =>
        String(v.email || '').toLowerCase().trim() === em &&
        voterMatchesEvent(v, eid)
    )
  }
  return -1
}
