export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0D1B3E]">
      <h1 className="text-4xl font-bold text-white mb-4">VoteVerify</h1>
      <p className="text-[#A0B4CC] mb-10">Privacy-Preserving Voter Authentication</p>
      <div className="flex gap-6 flex-wrap justify-center">
        <a href="/voter/login" className="px-8 py-3 bg-[#E8A020] text-[#0D1B3E] font-bold rounded hover:opacity-90">
          Voter Login
        </a>
        <a href="/voter" className="px-8 py-3 border border-[#E8A020] text-[#E8A020] font-bold rounded hover:bg-[#E8A020] hover:text-[#0D1B3E]">
          Register as Voter
        </a>
        <a href="/officer" className="px-8 py-3 border border-[#E8A020] text-[#E8A020] font-bold rounded hover:bg-[#E8A020] hover:text-[#0D1B3E]">
          Officer Dashboard
        </a>
      </div>
    </main>
  )
}