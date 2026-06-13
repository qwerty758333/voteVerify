/** Whether a voter record belongs to the given event */
export function voterMatchesEvent(voter, eventId) {
  const eid = String(eventId || '').trim()
  const stored = voter?.eventId
  if (stored != null && String(stored).trim() !== '') {
    return String(stored).trim() === eid
  }
  return false
}

export function filterVotersByEvent(voters, eventId) {
  const eid = String(eventId || '').trim()
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
