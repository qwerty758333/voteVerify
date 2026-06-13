import prisma from '@/lib/prisma'

/** Fixed SOBA org id — stored in Event table and used by add-attendee */
export const SOBA_ORG_ID = '750006'

const DEFAULT_VERIFICATION_URL =
  process.env.NEXT_PUBLIC_SOBA_VERIFICATION_URL ||
  'https://poh.soba.network/verify?sid=NzUwMDA2fDI3OTAwMDE%3D'

const DEFAULT_REGISTRATION_URL =
  process.env.NEXT_PUBLIC_SOBA_REGISTRATION_URL ||
  'https://poh.soba.network/verifyHuman?sid=NzUwMDA2fDI3OTAwMDF8PHVzZXJfZW1haWw%2B'

export async function fetchLatestEvent() {
  try {
    return await prisma.event.findFirst({
      orderBy: { updatedAt: 'desc' }
    })
  } catch (err) {
    console.error('Error reading event from database:', err)
    return null
  }
}

export function maskApiKey(key) {
  if (!key || typeof key !== 'string') return ''
  const k = key.trim()
  if (k.length < 8) return '••••••••'
  return `${k.slice(0, 4)}****-****-****-****-************`
}

export function getVerificationUrl(event) {
  const url = event?.verificationUrl
  if (url != null && String(url).trim() !== '') return String(url).trim()
  return DEFAULT_VERIFICATION_URL
}

export function getRegistrationUrl(event) {
  const url = event?.registrationUrl
  if (url != null && String(url).trim() !== '') return String(url).trim()
  return DEFAULT_REGISTRATION_URL
}

/**
 * Credentials for server-side SOBA calls.
 * Priority: Event table → .env.local
 */
export async function getResolvedSobaCredentials() {
  const event = await fetchLatestEvent()
  const id = event?.eventId != null ? String(event.eventId).trim() : ''
  const key = event?.apiKey != null ? String(event.apiKey).trim() : ''
  if (id && key) return { eventId: id, apiKey: key }

  const envId = process.env.SOBA_EVENT_ID?.trim() || ''
  const envKey = process.env.SOBA_API_KEY?.trim() || ''
  if (envId && envKey) return { eventId: envId, apiKey: envKey }

  return null
}

export async function getCurrentEventId() {
  const creds = await getResolvedSobaCredentials()
  const id = creds?.eventId || process.env.SOBA_EVENT_ID?.trim() || ''
  return String(id).trim()
}

/** Safe payload for GET /api/events */
export async function getPublicEventSettings() {
  const creds = await getResolvedSobaCredentials()
  const event = await fetchLatestEvent()
  const orgId =
    event?.orgId != null && String(event.orgId).trim() !== ''
      ? String(event.orgId).trim()
      : SOBA_ORG_ID

  return {
    org_id: orgId,
    eventId: creds?.eventId || '',
    eventName: event?.eventName || '',
    verificationUrl: getVerificationUrl(event),
    registrationUrl: getRegistrationUrl(event),
    updatedAt: event?.updatedAt || '',
    apiKeyMasked: maskApiKey(creds?.apiKey || ''),
    configured: !!creds
  }
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
