import fs from 'fs'
import path from 'path'

const EVENTS_PATH = path.join(process.cwd(), 'data', 'events.json')

/** Fixed SOBA org id — stored in events.json and used by add-attendee */
export const SOBA_ORG_ID = '750006'

const DEFAULT_VERIFICATION_URL =
  process.env.NEXT_PUBLIC_SOBA_VERIFICATION_URL ||
  'https://poh.soba.network/verify?sid=NzUwMDA2fDI3OTAwMDE%3D'

const DEFAULT_REGISTRATION_URL =
  process.env.NEXT_PUBLIC_SOBA_REGISTRATION_URL ||
  'https://poh.soba.network/verifyHuman?sid=NzUwMDA2fDI3OTAwMDF8PHVzZXJfZW1haWw%2B'

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
/** Active SOBA event id from events.json or env */
export function getCurrentEventId() {
  const creds = getResolvedSobaCredentials()
  const id = creds?.eventId || process.env.SOBA_EVENT_ID?.trim() || ''
  return String(id).trim()
}

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
    verificationUrl: getVerificationUrl(raw),
    registrationUrl: getRegistrationUrl(raw),
    updatedAt: raw?.updatedAt || '',
    apiKeyMasked: maskApiKey(creds?.apiKey || ''),
    configured: !!creds
  }
}

export function getVerificationUrl(raw = readEventsJson()) {
  const url = raw?.verificationUrl
  if (url != null && String(url).trim() !== '') return String(url).trim()
  return DEFAULT_VERIFICATION_URL
}

export function getRegistrationUrl(raw = readEventsJson()) {
  const url = raw?.registrationUrl
  if (url != null && String(url).trim() !== '') return String(url).trim()
  return DEFAULT_REGISTRATION_URL
}

/** Append or substitute voter email in a SOBA registration URL template */
export function applyEmailToRegistrationUrl(baseUrl, email) {
  const em = String(email || '').trim()
  if (!em) return baseUrl
  const encoded = encodeURIComponent(em)
  if (baseUrl.includes('<user_email>')) {
    return baseUrl.replace(/<user_email>/gi, em)
  }
  if (baseUrl.includes('%3Cuser_email%3E')) {
    return baseUrl.replace(/%3Cuser_email%3E/gi, encoded)
  }
  if (/[?&]email=/i.test(baseUrl)) return baseUrl
  const joiner = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${joiner}email=${encoded}`
}

/**
 * Save event config. eventId required. apiKey may be omitted to keep existing file value.
 */
export function saveEventSettings({
  eventId,
  apiKey,
  eventName,
  verificationUrl,
  registrationUrl,
  orgId
}) {
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

    const resolvedOrg =
      orgId != null && String(orgId).trim() !== ''
        ? String(orgId).trim()
        : existing?.orgId != null && String(existing.orgId).trim() !== ''
          ? String(existing.orgId).trim()
          : existing?.org_id != null && String(existing.org_id).trim() !== ''
            ? String(existing.org_id).trim()
            : SOBA_ORG_ID

    const resolvedVerification =
      verificationUrl !== undefined && verificationUrl !== null
        ? String(verificationUrl).trim()
        : getVerificationUrl(existing)

    const resolvedRegistration =
      registrationUrl !== undefined && registrationUrl !== null
        ? String(registrationUrl).trim()
        : getRegistrationUrl(existing)

    const payload = {
      org_id: resolvedOrg,
      orgId: resolvedOrg,
      eventId: id,
      apiKey: nextKey,
      eventName: resolvedName,
      verificationUrl: resolvedVerification,
      registrationUrl: resolvedRegistration,
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
