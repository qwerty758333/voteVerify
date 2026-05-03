import fs from 'fs'
import path from 'path'

const EVENTS_PATH = path.join(process.cwd(), 'data', 'events.json')

export function getEventSettings() {
  try {
    if (!fs.existsSync(EVENTS_PATH)) {
      return {
        eventId: process.env.SOBA_EVENT_ID || '2460005',
        apiKey: process.env.SOBA_API_KEY || ''
      }
    }
    const content = fs.readFileSync(EVENTS_PATH, 'utf8')
    if (!content || content.trim() === '') {
      return {
        eventId: process.env.SOBA_EVENT_ID || '2460005',
        apiKey: process.env.SOBA_API_KEY || ''
      }
    }
    return JSON.parse(content)
  } catch (err) {
    console.error('Error reading events:', err)
    return {
      eventId: process.env.SOBA_EVENT_ID || '2460005',
      apiKey: process.env.SOBA_API_KEY || ''
    }
  }
}

export function saveEventSettings(settings) {
  try {
    fs.mkdirSync(path.dirname(EVENTS_PATH), { recursive: true })
    fs.writeFileSync(EVENTS_PATH, JSON.stringify(settings, null, 2))
    return true
  } catch (err) {
    console.error('Error writing events:', err)
    return false
  }
}
