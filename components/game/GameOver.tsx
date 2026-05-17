'use client'
import { motion } from 'framer-motion'
import PixelButton from '@/components/ui/PixelButton'
import { GameStatus } from '@/lib/checkers/types'
import { Trophy, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface CoachAnalysis {
  summary: string
  highlights: { type: 'good' | 'missed' | 'critical'; moveNumber: number; description: string }[]
  tip: string
  verdict: string
}

interface GameOverProps {
  status: GameStatus
  playerColor: 'red' | 'blue'
  onRematch: () => void
  analysis?: CoachAnalysis | null
  loadingAnalysis?: boolean
}

export default function GameOver({ status, playerColor, onRematch, analysis, loadingAnalysis }: GameOverProps) {
  const won = status === `${playerColor}_wins`
  const isDraw = status === 'draw'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-sm border-2 p-6 flex flex-col gap-5"
        style={{
          background: 'rgba(10,37,64,0.98)',
          borderColor: won ? '#f3701e' : isDraw ? '#669bbc' : '#c1121f',
          boxShadow: `0 0 40px ${won ? 'rgba(243,112,30,0.3)' : isDraw ? 'rgba(102,155,188,0.2)' : 'rgba(193,18,31,0.3)'}`,
        }}
      >
        {/* Result */}
        <div className="text-center">
          {won ? (
            <Trophy size={40} className="mx-auto mb-2" style={{ color: '#f3701e' }} />
          ) : isDraw ? (
            <div className="text-4xl mb-2">🤝</div>
          ) : (
            <div className="text-4xl mb-2">💀</div>
          )}
          <div className="font-pixel text-[14px]" style={{ color: won ? '#f3701e' : isDraw ? '#669bbc' : '#c1121f' }}>
            {won ? 'YOU WIN!' : isDraw ? 'DRAW' : 'GAME OVER'}
          </div>
          {!isDraw && (
            <p className="text-[#669bbc] text-sm mt-1">
              {won ? 'Арман has been defeated!' : 'Arman wins this round.'}
            </p>
          )}
        </div>

        {/* AI Coach analysis */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#f3701e]" />
            <span className="font-pixel text-[8px] text-[#f3701e]">ARMAN COACH</span>
          </div>

          {loadingAnalysis ? (
            <div className="flex gap-1 items-center text-[#669bbc] text-xs">
              <span>Analyzing game</span>
              {[0,1,2].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-[#669bbc] animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          ) : analysis ? (
            <div className="flex flex-col gap-2">
              <p className="text-[#669bbc] text-xs leading-relaxed">{analysis.summary}</p>

              {analysis.highlights.map((h, i) => (
                <div key={i} className="flex gap-2 items-start text-xs">
                  <span style={{ color: h.type === 'good' ? '#669bbc' : h.type === 'critical' ? '#c1121f' : '#f3701e' }}>
                    {h.type === 'good' ? '✓' : h.type === 'critical' ? '✗' : '→'}
                  </span>
                  <span className="text-white/70">{h.description}</span>
                </div>
              ))}

              {analysis.tip && (
                <div className="border-t border-white/10 pt-2 text-[10px] text-[#669bbc]/70 italic">
                  💡 {analysis.tip}
                </div>
              )}

              {analysis.verdict && (
                <div className="font-pixel text-[8px] text-[#f3701e] text-center mt-1">
                  {analysis.verdict}
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#669bbc]/50 text-xs">Arman: "Good game! See you next time."</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <PixelButton onClick={onRematch} className="flex-1 justify-center gap-2">
            <RefreshCw size={14} /> Rematch
          </PixelButton>
          <Link href="/play" className="flex-1">
            <PixelButton variant="secondary" className="w-full justify-center gap-2">
              <Home size={14} /> Menu
            </PixelButton>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
