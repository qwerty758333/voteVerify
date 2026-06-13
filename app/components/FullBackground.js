export default function FullBackground({ className = '' }) {
  return (
    <div
      className={`bg-voting-image fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10 ${className}`.trim()}
    >
      <div className="absolute inset-0 bg-[#0e0d16]/80 backdrop-blur-[4px]" />
    </div>
  )
}
