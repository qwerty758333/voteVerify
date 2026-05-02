export default function FullBackground() {
  return (
    <div 
      className="fixed inset-0 w-full h-full bg-cover bg-center -z-10"
      style={{ backgroundImage: "url('/voting.png')" }}
    >
      {/* Significantly deeper overlay for guaranteed readability */}
      <div className="absolute inset-0 bg-[#0e0d16]/80 backdrop-blur-[4px]"></div>
    </div>
  )
}
