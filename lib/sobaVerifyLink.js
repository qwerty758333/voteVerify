/** Env fallbacks when /api/events URLs are unavailable (client-safe, no fs). */

const REGISTRATION_BASE =
  process.env.NEXT_PUBLIC_SOBA_REGISTRATION_URL ||
  'https://poh.soba.network/verifyHuman?sid=NzUwMDA2fDI3OTAwMDF8PHVzZXJfZW1haWw%2B'

const VERIFICATION_BASE =
  process.env.NEXT_PUBLIC_SOBA_VERIFICATION_URL ||
  'https://poh.soba.network/verify?sid=NzUwMDA2fDI3OTAwMDE%3D'

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

export function buildSobaRegistrationUrl(email, baseUrl = REGISTRATION_BASE) {
  return applyEmailToRegistrationUrl(baseUrl, email)
}

export function buildSobaVerificationUrl(baseUrl = VERIFICATION_BASE) {
  return baseUrl
}
