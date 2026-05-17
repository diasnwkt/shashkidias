'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import Board from '@/components/game/Board'
import ArmanPanel from '@/components/game/ArmanPanel'
import GameOver from '@/components/game/GameOver'
import PixelButton from '@/components/ui/PixelButton'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import { createInitialGameState, getAllValidMoves } from '@/lib/checkers/engine'
import { getBestMove, Difficulty } from '@/lib/checkers/minimax'
import { GameState } from '@/lib/checkers/types'
import { ArmanMood } from '@/components/game/ArmanSprite'
import { formatTime } from '@/lib/utils'
import { Settings, RotateCcw, Clock } from 'lucide-react'
import useAudio from '@/hooks/useAudio'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '🟢 Beginner',
  normal: '🟡 Normal',
  arman: '🔴 Arman Mode',
}

export default function AIGamePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [gameState, setGameState] = useState<GameState>(createInitialGameState())
  const [armanMood, setArmanMood] = useState<ArmanMood>('idle')
  const [lastEvent, setLastEvent] = useState<'capture' | 'king' | 'my_capture' | null>(null)
  const [isArmanThinking, setIsArmanThinking] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [moveHistory, setMoveHistory] = useState<Record<string, unknown>[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audio = useAudio()

  const playerColor = 'red'
  const armanColor = 'blue'
  const isPlayerTurn = gameState.currentTurn === playerColor && gameState.status === 'playing'
  const isGameOver = gameState.status !== 'playing'

  // Timer
  useEffect(() => {
    if (gameStarted && !isGameOver) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [gameStarted, isGameOver])

  // Arman's turn - AI move
  useEffect(() => {
    if (gameState.currentTurn !== armanColor || gameState.status !== 'playing') return

    setIsArmanThinking(true)
    setArmanMood('think')

    const delay = difficulty === 'easy' ? 600 : difficulty === 'normal' ? 1000 : 1400
    const timer = setTimeout(() => {
      const move = getBestMove(gameState.board, armanColor, difficulty)
      if (!move) return

      setArmanMood(move.captures.length > 0 ? 'attack' : 'idle')
      if (move.captures.length > 0) {
        setLastEvent('my_capture')
        audio.playCapture()
      } else {
        audio.playMove()
      }

      setMoveHistory(prev => [...prev, {
        from: move.from, to: move.to, captures: move.captures,
      }])

      const { applyMoveToState } = require('@/lib/checkers/engine')
      setGameState(prev => applyMoveToState(prev, move))
      setIsArmanThinking(false)

      setTimeout(() => setArmanMood('idle'), 800)
    }, delay)

    return () => clearTimeout(timer)
  }, [gameState.currentTurn, gameState.status, difficulty])

  // Game over: fetch AI analysis
  useEffect(() => {
    if (!isGameOver || moveHistory.length < 4) return

    setLoadingAnalysis(true)
    fetch('/api/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moves: moveHistory,
        winner: gameState.status === 'red_wins' ? 'red' : gameState.status === 'blue_wins' ? 'blue' : null,
        playerColor,
      }),
    })
      .then(r => r.json())
      .then(data => { setAnalysis(data); setLoadingAnalysis(false) })
      .catch(() => setLoadingAnalysis(false))
  }, [isGameOver])

  // Arman celebrates/is sad on game over
  useEffect(() => {
    if (gameState.status === 'blue_wins') setArmanMood('celebrate')
    else if (gameState.status === 'red_wins') setArmanMood('sad')
  }, [gameState.status])

  const handleStateChange = useCallback((newState: GameState) => {
    setGameState(newState)
    if (!gameStarted) setGameStarted(true)
  }, [gameStarted])

  const handleCapture = useCallback(() => {
    setLastEvent('capture')
    audio.playCapture()
  }, [audio])

  const handleKingPromotion = useCallback(() => {
    setLastEvent('king')
    audio.playKing()
  }, [audio])

  const handleMove = useCallback(() => {
    setMoveHistory(prev => {
      const last = gameState.lastMove
      if (!last) return prev
      return [...prev, { from: last.from, to: last.to, captures: last.captures }]
    })
    if (!lastEvent) audio.playMove()
    setTimeout(() => setLastEvent(null), 1000)
  }, [gameState.lastMove, lastEvent, audio])

  const handleRematch = useCallback(() => {
    setGameState(createInitialGameState())
    setArmanMood('idle')
    setLastEvent(null)
    setAnalysis(null)
    setMoveHistory([])
    setTimer(0)
    setGameStarted(false)
  }, [])

  const validMoves = getAllValidMoves(gameState.board, gameState.currentTurn)
  const redPieces = gameState.board.flat().filter(p => p?.color === 'red').length
  const bluePieces = gameState.board.flat().filter(p => p?.color === 'blue').length

  if (!gameStarted) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Navbar />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="font-pixel text-[10px] text-[#f3701e] mb-2">AI OPPONENT</div>
              <h1 className="text-4xl font-black text-white mb-2">vs <span style={{ color: '#f3701e' }}>Arman</span></h1>
              <p className="text-[#669bbc] text-sm">Challenge the nfactorial AI in a game of checkers</p>
            </div>

            <div className="border-2 border-white/10 p-6" style={{ background: 'rgba(10,37,64,0.9)' }}>
              <h2 className="font-black text-white mb-4">Choose Difficulty</h2>
              <div className="flex flex-col gap-3 mb-6">
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`p-3 border-2 text-left transition-all ${
                      difficulty === d ? 'border-[#f3701e] bg-[#f3701e]/10' : 'border-white/20 hover:border-white/40'
                    }`}>
                    <div className="font-semibold text-white">{DIFFICULTY_LABELS[d]}</div>
                    <div className="text-xs text-[#669bbc] mt-0.5">
                      {d === 'easy' ? 'Perfect for learning. Arman makes some mistakes.' :
                        d === 'normal' ? 'Decent challenge. Arman plays solid moves.' :
                          'Near-perfect play. Good luck. You\'ll need it.'}
                    </div>
                  </button>
                ))}
              </div>

              <PixelButton className="w-full justify-center" size="lg" glowing
                onClick={() => setGameStarted(true)}>
                Start Game
              </PixelButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-16 px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between py-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="font-pixel text-[8px] text-[#f3701e]">vs ARMAN</div>
              <div className="px-2 py-0.5 border text-[9px] font-pixel"
                style={{ borderColor: '#669bbc', color: '#669bbc' }}>
                {DIFFICULTY_LABELS[difficulty].split(' ')[1]}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#669bbc]">
              <Clock size={14} />
              <span className="font-pixel text-[10px]">{formatTime(timer)}</span>
            </div>
            <PixelButton variant="ghost" size="sm" onClick={handleRematch} className="gap-1">
              <RotateCcw size={12} /> New Game
            </PixelButton>
          </div>

          {/* Scoreboard */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex items-center gap-2 p-3 border border-[#c1121f]/30"
              style={{ background: 'rgba(193,18,31,0.08)' }}>
              <div className="w-4 h-4 rounded-full" style={{ background: '#c1121f' }} />
              <div>
                <div className="text-xs text-[#669bbc]">You</div>
                <div className="font-pixel text-[12px] text-white">{redPieces}</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="font-pixel text-[10px] text-[#f3701e]">
                {isGameOver ? (gameState.status === 'red_wins' ? 'YOU WIN' : gameState.status === 'blue_wins' ? 'ARMAN WINS' : 'DRAW') :
                  isArmanThinking ? 'THINKING...' : isPlayerTurn ? 'YOUR MOVE' : '...'}
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border border-[#669bbc]/30 justify-end"
              style={{ background: 'rgba(102,155,188,0.08)' }}>
              <div>
                <div className="text-xs text-[#669bbc] text-right">Arman</div>
                <div className="font-pixel text-[12px] text-white text-right">{bluePieces}</div>
              </div>
              <div className="w-4 h-4 rounded-full" style={{ background: '#669bbc' }} />
            </div>
          </div>

          {/* Main game area */}
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
            {/* Arman panel (left on desktop, top on mobile) */}
            <div className="flex justify-center lg:justify-start">
              <ArmanPanel
                mood={armanMood}
                difficulty={difficulty}
                isMyTurn={!isPlayerTurn}
                lastEvent={lastEvent}
              />
            </div>

            {/* Board */}
            <div className="relative flex-1 flex justify-center">
              <Board
                gameState={gameState}
                onStateChange={handleStateChange}
                disabled={!isPlayerTurn || isArmanThinking}
                playerColor={playerColor}
                onCapture={handleCapture}
                onKingPromotion={handleKingPromotion}
                onMove={handleMove}
                showCoordinates
              />

              {/* Game over overlay */}
              {isGameOver && (
                <GameOver
                  status={gameState.status}
                  playerColor={playerColor}
                  onRematch={handleRematch}
                  analysis={analysis as Record<string, unknown> & { summary: string; highlights: { type: 'good' | 'missed' | 'critical'; moveNumber: number; description: string }[]; tip: string; verdict: string } | null}
                  loadingAnalysis={loadingAnalysis}
                />
              )}
            </div>

            {/* Move history (right panel, desktop only) */}
            <div className="hidden lg:flex flex-col gap-2 w-40">
              <div className="font-pixel text-[8px] text-[#669bbc] mb-1">MOVES</div>
              <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
                {moveHistory.slice(-20).map((m: Record<string, unknown>, i) => {
                  const from = m.from as { row: number; col: number }
                  const to = m.to as { row: number; col: number }
                  const captures = m.captures as unknown[]
                  return (
                    <div key={i} className="text-[10px] text-[#669bbc]/60 flex gap-1">
                      <span>{i + 1}.</span>
                      <span>{`(${from.row},${from.col})→(${to.row},${to.col})`}</span>
                      {captures.length > 0 && <span className="text-[#c1121f]">×{captures.length}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Valid moves hint */}
          {isPlayerTurn && !gameState.selectedPiece && (
            <p className="text-center text-[#669bbc]/50 text-xs mt-3">
              {validMoves.some(m => m.captures.length > 0) ? '⚠️ You must capture!' : 'Select a piece to move'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
