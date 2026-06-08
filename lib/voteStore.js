import fs from 'fs'
import path from 'path'

const VOTES_PATH = path.join(process.cwd(), 'data', 'votes.json')

export function readVotes() {
  try {
    if (!fs.existsSync(VOTES_PATH)) {
      return { votes: [], candidates: [] }
    }
    const data = JSON.parse(fs.readFileSync(VOTES_PATH, 'utf8'))
    return {
      votes: Array.isArray(data.votes) ? data.votes : [],
      candidates: Array.isArray(data.candidates) ? data.candidates : []
    }
  } catch (err) {
    console.error('Error reading votes:', err)
    return { votes: [], candidates: [] }
  }
}

export function writeVotes(data) {
  fs.mkdirSync(path.dirname(VOTES_PATH), { recursive: true })
  fs.writeFileSync(VOTES_PATH, JSON.stringify(data, null, 2), 'utf8')
}
