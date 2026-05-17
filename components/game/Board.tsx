'use client'
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameState, Move, Piece } from '@/lib/checkers/types'
import { selectPiece, applyMoveToState } from '@/lib/checkers/engine'
import Explosion from './Explosion'

interface ExplosionData {
  id: number
  x: number
  y: number
  color: string
}

interface BoardProps {
  gameState: GameState
  onStateChange: (state: GameState) => void
  disabled?: boolean
  playerColor?: 'red' | 'blue'
  boardTheme?: {
    lightCell: string
    darkCell: string
    pieceRed: string
    pieceBlue: string
  }
  onCapture?: () => void
  onKingPromotion?: () => void
  onMove?: () => void
  showCoordinates?: boolean
}

const DEFAULT_THEME = {
  lightCell: '#c8a96e',
  darkCell: '#1a3a50',
  pieceRed: '#c1121f',
  pieceBlue: '#669bbc',
}

export default function Board({
  gameState, onStateChange, disabled = false,
  playerColor = 'red', boardTheme, onCapture, onKingPromotion, onMove,
  showCoordinates = false,
}: BoardProps) {
  const theme = { ...DEFAULT_THEME, ...boardTheme }
  const [explosions, setExplosions] = useState<ExplosionData[]>([])
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set())
  const boardRef = useRef<HTMLDivElement>(null)
  const expIdRef = useRef(0)

  const addExplosion = useCallback((cellRow: number, cellCol: number, color: string) => {
    if (!boardRef.current) return
    const rect = boardRef.current.getBoundingClientRect()
    const cellSize = rect.width / 8
    const x = rect.left + cellCol * cellSize + cellSize / 2
    const y = rect.top + cellRow * cellSize + cellSize / 2
    const id = expIdRef.current++
    setExplosions(prev => [...prev, { id, x, y, color }])
  }, [])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (disabled || gameState.status !== 'playing') return
    if (gameState.currentTurn !== playerColor && playerColor !== undefined) return

    const piece = gameState.board[row]?.[col]

    // If clicking own piece, select it
    if (piece && piece.color === gameState.currentTurn) {
      onStateChange(selectPiece(gameState, row, col))
      return
    }

    // If a piece is selected and clicking a valid move target
    if (gameState.selectedPiece && gameState.validMoves.length > 0) {
      const move = gameState.validMoves.find(m => m.to.row === row && m.to.col === col)
      if (!move) return

      // Trigger explosions for captures
      for (const cap of move.captures) {
        const capturedPiece = gameState.board[cap.row][cap.col]
        const expColor = capturedPiece?.color === 'red' ? theme.pieceRed : theme.pieceBlue
        addExplosion(cap.row, cap.col, expColor)
        onCapture?.()
      }

      const newState = applyMoveToState(gameState, move)

      // Check for new king promotions
      const movedPiece = newState.board[move.to.row][move.to.col]
      if (movedPiece?.type === 'king' && gameState.board[move.from.row][move.from.col]?.type === 'man') {
        setPromotedIds(prev => new Set([...prev, movedPiece.id]))
        onKingPromotion?.()
        setTimeout(() => setPromotedIds(prev => {
          const next = new Set(prev)
          next.delete(movedPiece.id)
          return next
        }), 1000)
      }

      onMove?.()
      onStateChange(newState)
    }
  }, [gameState, disabled, playerColor, theme, addExplosion, onCapture, onKingPromotion, onMove, onStateChange])

  const isValidMoveTarget = (row: number, col: number) =>
    gameState.validMoves.some(m => m.to.row === row && m.to.col === col)

  const isSelected = (piece: Piece | null) =>
    piece && gameState.selectedPiece?.id === piece.id

  const isLastMoveCell = (row: number, col: number) =>
    gameState.lastMove && (
      (gameState.lastMove.from.row === row && gameState.lastMove.from.col === col) ||
      (gameState.lastMove.to.row === row && gameState.lastMove.to.col === col)
    )

  return (
    <>
      {/* Explosions */}
      <AnimatePresence>
        {explosions.map(exp => (
          <Explosion key={exp.id} x={exp.x} y={exp.y} color={exp.color}
            onDone={() => setExplosions(prev => prev.filter(e => e.id !== exp.id))} />
        ))}
      </AnimatePresence>

      {/* Board container */}
      <div className="relative inline-block">
        {showCoordinates && (
          <>
            {/* Column labels */}
            <div className="absolute -bottom-5 left-0 right-0 flex">
              {['a','b','c','d','e','f','g','h'].map(l => (
                <div key={l} className="flex-1 text-center font-pixel text-[7px] text-[#669bbc]/50">{l}</div>
              ))}
            </div>
            {/* Row labels */}
            <div className="absolute -left-5 top-0 bottom-0 flex flex-col">
              {[8,7,6,5,4,3,2,1].map(n => (
                <div key={n} className="flex-1 flex items-center font-pixel text-[7px] text-[#669bbc]/50">{n}</div>
              ))}
            </div>
          </>
        )}

        {/* Board grid */}
        <div
          ref={boardRef}
          className="relative scanlines"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            width: 'min(480px, calc(100vw - 48px))',
            aspectRatio: '1',
            border: '3px solid rgba(243,112,30,0.5)',
            boxShadow: '0 0 30px rgba(193,18,31,0.2), 8px 8px 0 #780000',
          }}
        >
          {gameState.board.map((row, r) =>
            row.map((piece, c) => {
              const isDark = (r + c) % 2 === 1
              const isTarget = isValidMoveTarget(r, c)
              const isLastMove = isLastMoveCell(r, c)
              const isCapture = gameState.validMoves.some(m => m.to.row === r && m.to.col === c && m.captures.length > 0)

              let cellBg = isDark ? theme.darkCell : theme.lightCell
              if (isLastMove && isDark) cellBg = `color-mix(in srgb, ${theme.darkCell} 70%, #f3701e 30%)`

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => isDark && handleCellClick(r, c)}
                  className={`relative flex items-center justify-center transition-colors duration-150 ${
                    isDark ? 'cursor-pointer' : ''
                  } ${isTarget && isDark ? 'cell-selected' : ''}`}
                  style={{ background: cellBg, aspectRatio: '1' }}
                >
                  {/* Valid move indicator */}
                  {isTarget && isDark && !piece && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`rounded-full transition-colors ${
                        isCapture ? 'bg-[#c1121f]/40 border-2 border-[#c1121f]/60' : 'bg-[#f3701e]/25 border-2 border-[#f3701e]/40'
                      }`} style={{ width: '35%', height: '35%' }} />
                    </div>
                  )}

                  {/* Piece */}
                  {piece && (
                    <AnimatePresence>
                      <motion.div
                        key={piece.id}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{
                          scale: isSelected(piece) ? 1.15 : 1,
                          opacity: 1,
                          y: isSelected(piece) ? -4 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={(e) => { e.stopPropagation(); handleCellClick(r, c) }}
                        className="relative cursor-pointer"
                        style={{ width: '75%', height: '75%' }}
                      >
                        <PieceGraphic
                          piece={piece}
                          isSelected={!!isSelected(piece)}
                          isPromoted={promotedIds.has(piece.id)}
                          redColor={theme.pieceRed}
                          blueColor={theme.pieceBlue}
                        />
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Corner decorations */}
        {['-top-1 -left-1 border-t-2 border-l-2', '-top-1 -right-1 border-t-2 border-r-2',
          '-bottom-1 -left-1 border-b-2 border-l-2', '-bottom-1 -right-1 border-b-2 border-r-2'].map((cls, i) => (
          <div key={i} className={`absolute ${cls} border-[#f3701e] w-4 h-4`} />
        ))}
      </div>
    </>
  )
}

function PieceGraphic({ piece, isSelected, isPromoted, redColor, blueColor }: {
  piece: Piece; isSelected: boolean; isPromoted: boolean; redColor: string; blueColor: string
}) {
  const color = piece.color === 'red' ? redColor : blueColor
  const darkColor = piece.color === 'red' ? '#780000' : '#003049'

  return (
    <div className="w-full h-full relative">
      {/* Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-40"
        style={{ width: '85%', height: '20%', background: 'rgba(0,0,0,0.5)', filter: 'blur(3px)', bottom: '-8%' }} />

      {/* Piece body */}
      <div className="absolute inset-0 rounded-full border-2 transition-all duration-200"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${color}ee, ${color})`,
          borderColor: darkColor,
          boxShadow: isSelected
            ? `0 0 0 3px rgba(243,112,30,0.7), 0 4px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.25)`
            : `0 3px 6px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.2)`,
        }}
      >
        {/* Inner highlight */}
        <div className="absolute rounded-full" style={{
          width: '40%', height: '30%', top: '15%', left: '15%',
          background: 'rgba(255,255,255,0.3)',
        }} />
      </div>

      {/* King crown */}
      {piece.type === 'king' && (
        <div className={`absolute inset-0 flex items-center justify-center ${isPromoted ? 'crown-appear' : ''}`}>
          <svg viewBox="0 0 20 14" width="55%" height="55%" style={{ filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.5))` }}>
            <polygon points="2,12 5,4 10,9 15,4 18,12" fill="#f3c700" stroke="#b8960a" strokeWidth="1" strokeLinejoin="round" />
            <circle cx="2" cy="12" r="2" fill="#f3c700" stroke="#b8960a" strokeWidth="0.5" />
            <circle cx="10" cy="9" r="2" fill="#f3c700" stroke="#b8960a" strokeWidth="0.5" />
            <circle cx="18" cy="12" r="2" fill="#f3c700" stroke="#b8960a" strokeWidth="0.5" />
          </svg>
        </div>
      )}
    </div>
  )
}
