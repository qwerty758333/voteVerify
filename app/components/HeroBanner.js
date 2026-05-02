export default function HeroBanner() {
  return (
    <div 
      className="w-full h-[35vh] md:h-[40vh] bg-cover bg-center relative"
      style={{ backgroundImage: "url('/voting.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-[var(--background)]"></div>
    </div>
  )
}
