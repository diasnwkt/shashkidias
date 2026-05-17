'use client'
import { useState, useCallback } from 'react'
import Board from '@/components/game/Board'
import GameOver from '@/components/game/GameOver'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import PixelButton from '@/components/ui/PixelButton'
import { createInitialGameState } from '@/lib/checkers/engine'
import { GameState } from '@/lib/checkers/types'
import { RotateCcw } from 'lucide-react'
import useAudio from '@/hooks/useAudio'

export default function LocalGamePage() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState())
  const audio = useAudio()

  const handleStateChange = useCallback((newState: GameState) => setGameState(newState), [])
  const handleCapture = useCallback(() => audio.playCapture(), [audio])
  const handleKing = useCallback(() => audio.playKing(), [audio])
  const handleMove = useCallback(() => audio.playMove(), [audio])
  const handleRematch = useCallback(() => setGameState(createInitialGameState()), [])

  const redPieces = gameState.board.flat().filter(p => p?.color === 'red').length
  const bluePieces = gameState.board.flat().filter(p => p?.color === 'blue').length

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-16 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between py-4 mb-4">
            <div className="font-pixel text-[10px] text-[#669bbc]">LOCAL 2-PLAYER</div>
            <PixelButton variant="ghost" size="sm" onClick={handleRematch} className="gap-1">
              <RotateCcw size={12} /> New Game
            </PixelButton>
          </div>

          {/* Score bar */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex items-center gap-2 p-3 border border-[#c1121f]/30"
              style={{ background: 'rgba(193,18,31,0.08)' }}>
              <div className="w-4 h-4 rounded-full bg-[#c1121f]" />
              <div>
                <div className="text-xs text-[#669bbc]">Player 1 (Red)</div>
                <div className="font-pixel text-[12px] text-white">{redPieces}</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="font-pixel text-[8px] text-[#f3701e]">
                {gameState.status === 'playing'
                  ? `${gameState.currentTurn.toUpperCase()} TURN`
                  : gameState.status === 'draw' ? 'DRAW' : gameState.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border border-[#669bbc]/30 justify-end"
              style={{ background: 'rgba(102,155,188,0.08)' }}>
              <div>
                <div className="text-xs text-[#669bbc] text-right">Player 2 (Blue)</div>
                <div className="font-pixel text-[12px] text-white text-right">{bluePieces}</div>
              </div>
              <div className="w-4 h-4 rounded-full bg-[#669bbc]" />
            </div>
          </div>

          {/* Board */}
          <div className="relative flex justify-center">
            <Board
              gameState={gameState}
              onStateChange={handleStateChange}
              playerColor={gameState.currentTurn}
              onCapture={handleCapture}
              onKingPromotion={handleKing}
              onMove={handleMove}
              showCoordinates
            />
            {gameState.status !== 'playing' && (
              <GameOver
                status={gameState.status}
                playerColor={gameState.status === 'red_wins' ? 'red' : 'blue'}
                onRematch={handleRematch}
              />
            )}
          </div>

          <p className="text-center text-[#669bbc]/40 text-xs mt-4">
            Pass the device to the other player after each move
          </p>
        </div>
      </div>
    </div>
  )
}
