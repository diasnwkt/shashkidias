'use client'
import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(193,18,31,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(102,155,188,0.06) 0%, transparent 60%), #003049',
        }}
      />

      {/* Animated diagonal stripes */}
      <div className="absolute inset-0 animated-stripes opacity-100" />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #f3701e, #c1121f, transparent)' }}
      />
    </div>
  )
}
