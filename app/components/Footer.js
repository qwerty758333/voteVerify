'use client'

import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  if (pathname === '/') {
    return null
  }

  return (
    <footer
      className="w-full border-t border-[#272640] bg-[#0e0d16] py-8"
      style={{
        backgroundColor: '#111827',
        color: 'white',
        padding: '32px',
        textAlign: 'center'
      }}
    >
      <p style={{ color: '#9CA3AF' }}>
        VoteVerify © 2025 • Secure Voter Authentication Powered by SOBA Network
      </p>
    </footer>
  )
}
