'use client'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  tx: string
  ty: string
  color: string
  size: number
  delay: number
}

interface ExplosionProps {
  x: number
  y: number
  color: string
  onDone: () => void
}

export default function Explosion({ x, y, color, onDone }: ExplosionProps) {
  const [particles] = useState<Particle[]>(() => {
    const colors = [color, '#f3701e', '#ffffff', color]
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const dist = 30 + Math.random() * 40
      return {
        id: i,
        x: 0, y: 0,
        tx: `${Math.cos(angle) * dist}px`,
        ty: `${Math.sin(angle) * dist}px`,
        color: colors[i % colors.length],
        size: 4 + Math.random() * 6,
        delay: Math.random() * 80,
      }
    })
  })

  useEffect(() => {
    const t = setTimeout(onDone, 700)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="pointer-events-none fixed z-50" style={{ left: x, top: y, transform: 'translate(-50%,-50%)' }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="explosion-particle absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            left: 0, top: 0,
            '--tx': p.tx,
            '--ty': p.ty,
            animationDelay: `${p.delay}ms`,
            boxShadow: `0 0 ${p.size}px ${p.color}`,
          } as React.CSSProperties}
        />
      ))}
      {/* Flash */}
      <div className="absolute rounded-full animate-ping opacity-75"
        style={{
          width: 24, height: 24, left: -12, top: -12,
          background: color, animationDuration: '0.3s',
        }} />
    </div>
  )
}
