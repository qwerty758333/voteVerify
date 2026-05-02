export default function Footer() {
  return (
    <footer 
      className="fixed left-0 right-0 w-full border-t border-[#272640] bg-[#0e0d16] py-8 z-[9999]"
      style={{ bottom: 0, top: 'auto' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex flex-col items-center md:items-start gap-2">
          {/* High-contrast brand with a slight Glaucous accent */}
          <span className="font-black text-2xl text-white tracking-tight drop-shadow-sm">
            Vote<span className="text-[#a19fc6]">Verify</span>
          </span>
          <span className="text-[#8180b3] text-xs uppercase tracking-widest font-bold">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex gap-10 text-sm font-semibold text-[#c0bfd9]">
          <a href="#" className="hover:text-white transition-all hover:scale-105">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-all hover:scale-105">Terms of Service</a>
          <a href="#" className="hover:text-white transition-all hover:scale-105">Security Protocol</a>
        </div>
      </div>
    </footer>
  )
}
