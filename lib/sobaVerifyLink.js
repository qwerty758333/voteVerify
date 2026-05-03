/** 
 * SOBA URL utilities.
 * URLs are now pulled from .env.local to distinguish between 
 * Registration (verifyHuman) and Polling Day (verify) flows.
 */

const REGISTRATION_BASE = process.env.NEXT_PUBLIC_SOBA_REGISTRATION_URL || 'https://poh.soba.network/verifyHuman?sid=NzUwMDA2fDI3OTAwMDF8PHVzZXJfZW1haWw%2B'
const VERIFICATION_BASE = process.env.NEXT_PUBLIC_SOBA_VERIFICATION_URL || 'https://poh.soba.network/verify?sid=NzUwMDA2fDI3OTAwMDE%3D'

export function buildSobaRegistrationUrl(email) {
  const em = String(email || '').trim()
  // Registration URL needs &email=<email> appended
  return `${REGISTRATION_BASE}&email=${encodeURIComponent(em)}`
}

export function buildSobaVerificationUrl() {
  // Polling day verification URL does NOT need email parameter
  return VERIFICATION_BASE
}
