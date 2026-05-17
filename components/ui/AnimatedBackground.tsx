'use client'

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep base gradient */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 15% 40%, rgba(193,18,31,0.11) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(102,155,188,0.08) 0%, transparent 55%), #021a2b',
      }} />

      {/* Floating orb 1 — orange/warm */}
      <div className="orb-1 absolute" style={{
        width: 700, height: 700,
        top: '-15%', left: '-8%',
        background: 'radial-gradient(circle, rgba(243,112,30,0.13) 0%, transparent 68%)',
        borderRadius: '50%',
        filter: 'blur(1px)',
      }} />

      {/* Floating orb 2 — red */}
      <div className="orb-2 absolute" style={{
        width: 500, height: 500,
        top: '25%', right: '-8%',
        background: 'radial-gradient(circle, rgba(193,18,31,0.10) 0%, transparent 68%)',
        borderRadius: '50%',
      }} />

      {/* Floating orb 3 — blue/cool */}
      <div className="orb-3 absolute" style={{
        width: 420, height: 420,
        bottom: '5%', left: '28%',
        background: 'radial-gradient(circle, rgba(102,155,188,0.09) 0%, transparent 68%)',
        borderRadius: '50%',
      }} />

      {/* Animated diagonal stripes */}
      <div className="absolute inset-0 animated-stripes" />

      {/* Fine dot grid */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Film grain noise */}
      <div className="absolute inset-0 noise-texture" style={{ opacity: 0.038 }} />

      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)',
      }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent 0%, #f3701e 40%, #c1121f 60%, transparent 100%)',
        opacity: 0.7,
      }} />

      {/* Bottom subtle gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{
        background: 'linear-gradient(to top, rgba(2,10,18,0.6) 0%, transparent 100%)',
      }} />
    </div>
  )
}
