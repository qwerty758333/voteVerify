'use client'

export default function SobaButton({ email }) {
  function handleVerify() {
    if (!email) {
      alert('Email not found. Please register again.')
      return
    }

    const uuid = 'e69c8117-c2b4-4c51-a86e-2359099b4151'
    
    // Save email for callback
    localStorage.setItem('voterEmail', email)
    
    // Build SOBA verification URL
    const sobaUrl = `https://poh.crowdsnap.ai/verify?uuid=${uuid}`
    
    // Open in new window
    window.open(sobaUrl, 'sobaVerify', 'width=800,height=600')
  }

  return (
    <button
      onClick={handleVerify}
      className="w-full bg-[#E8A020] text-[#0D1B3E] font-bold py-3 rounded hover:opacity-90"
    >
      Verify with SOBA →
    </button>
  )
}