'use client'
import { useEffect, useState } from 'react'

const INITIAL: (0 | 1 | 2)[][] = [
  [0,1,0,1,0,1,0,1],
  [1,0,1,0,1,0,1,0],
  [0,1,0,1,0,1,0,1],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [2,0,2,0,2,0,2,0],
  [0,2,0,2,0,2,0,2],
  [2,0,2,0,2,0,2,0],
]

export default function LandingBoard() {
  const [highlighted, setHighlighted] = useState<[number, number][]>([])
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const moves: [number, number][][] = [
      [[5, 2], [4, 3]],
      [[2, 1], [3, 2]],
      [[4, 3], [3, 4]],
      [[3, 2], [4, 1]],
    ]
    let i = 0
    const interval = setInterval(() => {
      setHighlighted(moves[i % moves.length])
      i++
    }, 1400)
    return () => clearInterval(interval)
  }, [])

  const size = 'min(340px, 88vw)'

  return (
    <div
      className="relative"
      style={{ perspective: '900px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Atmospheric glow behind */}
      <div className="absolute inset-0 scale-110 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 60%, rgba(193,18,31,0.22) 0%, rgba(243,112,30,0.08) 40%, transparent 70%)',
          transition: 'opacity 0.6s ease',
          opacity: hovered ? 1 : 0.7,
        }} />

      {/* Board wrapper with perspective tilt */}
      <div
        style={{
          transform: hovered
            ? 'rotateX(0deg) rotateY(0deg) scale(1.02)'
            : 'rotateX(6deg) rotateY(-5deg) scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="relative scanlines"
          style={{
            border: '2px solid rgba(243,112,30,0.55)',
            boxShadow: '0 0 50px rgba(193,18,31,0.28), 0 0 120px rgba(193,18,31,0.1), 8px 8px 0 #780000',
          }}
        >
          {/* Board label */}
          <div className="absolute -top-7 left-0 right-0 text-center font-pixel text-[7px] text-[#f3701e]/50 tracking-widest">
            LIVE PREVIEW
          </div>

          <div
            className="grid grid-cols-8"
            style={{ width: size, height: size }}
          >
            {INITIAL.map((row, r) =>
              row.map((cell, c) => {
                const isDark = (r + c) % 2 === 1
                const isHighlighted = highlighted.some(([hr, hc]) => hr === r && hc === c)
                const cellSize = `calc(${size} / 8)`

                return (
                  <div
                    key={`${r}-${c}`}
                    className="relative flex items-center justify-center"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      background: isHighlighted
                        ? 'rgba(243,112,30,0.38)'
                        : isDark ? '#152d40' : '#b89660',
                      transition: 'background 0.35s ease',
                    }}
                  >
                    {cell === 1 && (
                      <div
                        className="rounded-full border-2"
                        style={{
                          width: '72%', height: '72%',
                          background: 'radial-gradient(circle at 32% 32%, #8ab8d4, #4a7fa0)',
                          borderColor: '#002a3f',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.28)',
                        }}
                      />
                    )}
                    {cell === 2 && (
                      <div
                        className="rounded-full border-2"
                        style={{
                          width: '72%', height: '72%',
                          background: 'radial-gradient(circle at 32% 32%, #e85050, #9c0f1a)',
                          borderColor: '#5a0000',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.22)',
                        }}
                      />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#f3701e]" />
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#f3701e]" />
        <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#f3701e]" />
        <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#f3701e]" />
      </div>
    </div>
  )
}
