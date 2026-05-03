import fs from 'fs'
import path from 'path'

const EVENTS_PATH = path.join(process.cwd(), 'data', 'events.json')

/** Fixed SOBA org id — stored in events.json and used by add-attendee */
export const SOBA_ORG_ID = '750006'

function readEventsJson() {
  try {
    if (!fs.existsSync(EVENTS_PATH)) return null
    const content = fs.readFileSync(EVENTS_PATH, 'utf8')
    if (!content || content.trim() === '') return null
    return JSON.parse(content)
  } catch (err) {
    console.error('Error reading events.json:', err)
    return null
  }
}

/**
 * Credentials for server-side SOBA calls.
 * Priority: data/events.json (both eventId + apiKey non-empty) → .env.local
 */
export function getResolvedSobaCredentials() {
  const data = readEventsJson()
  const id = data?.eventId != null ? String(data.eventId).trim() : ''
  const key = data?.apiKey != null ? String(data.apiKey).trim() : ''
  if (id && key) return { eventId: id, apiKey: key }

  const envId = process.env.SOBA_EVENT_ID?.trim() || ''
  const envKey = process.env.SOBA_API_KEY?.trim() || ''
  if (envId && envKey) return { eventId: envId, apiKey: envKey }

  return null
}

/** @deprecated use getResolvedSobaCredentials or getPublicEventSettings */
export function getEventSettings() {
  const creds = getResolvedSobaCredentials()
  const raw = readEventsJson()
  return {
    eventId: creds?.eventId || '',
    apiKey: creds?.apiKey || '',
    eventName: raw?.eventName || '',
    updatedAt: raw?.updatedAt || ''
  }
}

export function maskApiKey(key) {
  if (!key || typeof key !== 'string') return ''
  const k = key.trim()
  if (k.length < 8) return '••••••••'
  return `${k.slice(0, 4)}****-****-****-****-************`
}

/** Safe payload for GET /api/events (never exposes raw apiKey) */
export function getPublicEventSettings() {
  const creds = getResolvedSobaCredentials()
  const raw = readEventsJson()
  const orgId =
    raw?.orgId != null && String(raw.orgId).trim() !== ''
      ? String(raw.orgId).trim()
      : (raw?.org_id != null && String(raw.org_id).trim() !== '' ? String(raw.org_id).trim() : SOBA_ORG_ID)
  return {
    org_id: orgId,
    eventId: creds?.eventId || '',
    eventName: raw?.eventName || '',
    updatedAt: raw?.updatedAt || '',
    apiKeyMasked: maskApiKey(creds?.apiKey || ''),
    configured: !!creds
  }
}

/**
 * Save event config. eventId required. apiKey may be omitted to keep existing file value.
 */
export function saveEventSettings({ eventId, apiKey, eventName }) {
  try {
    const id = String(eventId || '').trim()
    if (!id) return { ok: false, error: 'Event ID is required' }

    const existing = readEventsJson()
    const nextKey = apiKey != null && String(apiKey).trim() !== '' ? String(apiKey).trim() : existing?.apiKey?.trim() || ''
    if (!nextKey) return { ok: false, error: 'API Key is required' }

    const resolvedName =
      eventName !== undefined && eventName !== null
        ? String(eventName).trim()
        : (existing?.eventName || '')

    const payload = {
      org_id: SOBA_ORG_ID,
      eventId: id,
      apiKey: nextKey,
      eventName: resolvedName,
      updatedAt: new Date().toISOString()
    }

    fs.mkdirSync(path.dirname(EVENTS_PATH), { recursive: true })
    fs.writeFileSync(EVENTS_PATH, JSON.stringify(payload, null, 2))
    return { ok: true }
  } catch (err) {
    console.error('Error writing events:', err)
    return { ok: false, error: 'Failed to save settings' }
  }
}
