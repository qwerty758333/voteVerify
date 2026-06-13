'use client'

import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  if (pathname === '/') {
    return null
  }

  return (
    <footer className="site-footer w-full border-t border-[#272640] bg-[#111827] text-white py-8 text-center">
      <p className="site-footer-text">
        VoteVerify © 2025 • Secure Voter Authentication Powered by SOBA Network
      </p>
    </footer>
  )
}
