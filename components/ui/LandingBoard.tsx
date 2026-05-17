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

  useEffect(() => {
    const moves: [number, number][][] = [
      [[5, 2], [4, 3]], [[2, 1], [3, 2]], [[4, 3], [3, 4]], [[3, 2], [4, 1]],
    ]
    let i = 0
    const interval = setInterval(() => {
      setHighlighted(moves[i % moves.length])
      i++
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {/* Glow behind board */}
      <div className="absolute inset-0 blur-3xl opacity-30 scale-90"
        style={{ background: 'radial-gradient(circle, #c1121f 0%, #003049 60%, transparent 100%)' }} />

      <div className="relative scanlines" style={{ border: '3px solid rgba(243,112,30,0.6)', boxShadow: '0 0 40px rgba(193,18,31,0.3), 8px 8px 0 #780000' }}>
        {/* Board label */}
        <div className="absolute -top-6 left-0 right-0 text-center font-pixel text-[7px] text-[#f3701e]/60">
          LIVE PREVIEW
        </div>

        <div className="grid grid-cols-8" style={{ width: 'min(360px, 90vw)', height: 'min(360px, 90vw)' }}>
          {INITIAL.map((row, r) =>
            row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1
              const isHighlighted = highlighted.some(([hr, hc]) => hr === r && hc === c)
              const cellSize = 'calc(min(360px, 90vw) / 8)'

              return (
                <div
                  key={`${r}-${c}`}
                  className="relative flex items-center justify-center transition-colors duration-300"
                  style={{
                    width: cellSize, height: cellSize,
                    background: isHighlighted
                      ? 'rgba(243,112,30,0.35)'
                      : isDark ? '#1a3a50' : '#c8a96e',
                  }}
                >
                  {cell === 1 && (
                    <div className="rounded-full border-2 transition-transform duration-200"
                      style={{
                        width: '70%', height: '70%',
                        background: 'radial-gradient(circle at 35% 35%, #8ab8d4, #669bbc)',
                        borderColor: '#003049',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
                      }} />
                  )}
                  {cell === 2 && (
                    <div className="rounded-full border-2 transition-transform duration-200"
                      style={{
                        width: '70%', height: '70%',
                        background: 'radial-gradient(circle at 35% 35%, #e04040, #c1121f)',
                        borderColor: '#780000',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
                      }} />
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#f3701e]" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#f3701e]" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#f3701e]" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#f3701e]" />
    </div>
  )
}
