'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import PixelButton from '@/components/ui/PixelButton'
import { createClient } from '@/lib/supabase/client'
import type { Board, GameState, PieceColor, PieceType, Piece } from '@/lib/checkers/types'
import { createInitialBoard } from '@/lib/checkers/engine'
import { Trash2, RotateCcw, Play, Save, Crown, Circle, Eraser, ChevronRight } from 'lucide-react'

type BrushType = 'red-man' | 'red-king' | 'blue-man' | 'blue-king' | 'eraser'

const BRUSH_LABELS: Record<BrushType, string> = {
  'red-man': 'Red Man',
  'red-king': 'Red King',
  'blue-man': 'Blue Man',
  'blue-king': 'Blue King',
  'eraser': 'Eraser',
}

const BRUSH_COLORS: Record<BrushType, string> = {
  'red-man': '#c1121f',
  'red-king': '#c1121f',
  'blue-man': '#669bbc',
  'blue-king': '#669bbc',
  'eraser': '#669bbc',
}

let pieceIdCounter = 100

function buildState(board: Board): GameState {
  return {
    board,
    currentTurn: 'red',
    status: 'playing',
    moveCount: 0,
    movesSinceCapture: 0,
    selectedPiece: null,
    validMoves: [],
    lastMove: null,
    capturedRed: 0,
    capturedBlue: 0,
  }
}

export default function BoardEditorPage() {
  const router = useRouter()
  const supabase = createClient()

  const [board, setBoard] = useState<Board>(() => createInitialBoard())
  const [brush, setBrush] = useState<BrushType>('red-man')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Only dark squares are valid in checkers: (row + col) % 2 === 1
  function isValidSquare(row: number, col: number) {
    return (row + col) % 2 === 1
  }

  function handleSquareClick(row: number, col: number) {
    if (!isValidSquare(row, col)) return

    setBoard(prev => {
      const next = prev.map(r => [...r])

      if (brush === 'eraser') {
        next[row][col] = null
        return next
      }

      const color: PieceColor = brush.startsWith('red') ? 'red' : 'blue'
      const type: PieceType = brush.endsWith('king') ? 'king' : 'man'

      // Toggle off if same piece already there
      const existing = next[row][col]
      if (existing && existing.color === color && existing.type === type) {
        next[row][col] = null
        return next
      }

      next[row][col] = {
        id: `e${pieceIdCounter++}`,
        color,
        type,
        row,
        col,
      }
      return next
    })
  }

  function resetToStart() {
    setBoard(createInitialBoard())
  }

  function clearBoard() {
    setBoard(Array(8).fill(null).map(() => Array(8).fill(null)))
  }

  function playFromHere() {
    const state = buildState(board)
    sessionStorage.setItem('editorBoard', JSON.stringify(state))
    router.push('/play/local?from=editor')
  }

  async function saveAsPuzzle() {
    setSaving(true)
    setSaveMsg('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaveMsg('You must be logged in to save puzzles.')
      setSaving(false)
      return
    }

    const state = buildState(board)
    const { error } = await supabase.from('puzzles').insert({
      title: `Custom Puzzle`,
      description: 'Created with the board editor.',
      difficulty: 'easy',
      is_daily: false,
      board_state: state,
      solution_moves: [],
      created_by: user.id,
    })

    if (error) {
      setSaveMsg(`Error: ${error.message}`)
    } else {
      setSaveMsg('Puzzle saved! Find it in the puzzle library.')
    }
    setSaving(false)
  }

  const redCount = board.flat().filter(p => p?.color === 'red').length
  const blueCount = board.flat().filter(p => p?.color === 'blue').length

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <p className="font-pixel text-[9px] text-[#f3701e] mb-2 tracking-widest">SETUP</p>
            <h1 className="text-3xl font-black text-white">Board Editor</h1>
            <p className="text-[#669bbc] text-sm mt-1">
              Place pieces on dark squares, then play from your custom position.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Board */}
            <div className="flex-shrink-0">
              <div
                className="inline-grid border-2 border-white/20"
                style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}
              >
                {board.map((rowArr, row) =>
                  rowArr.map((piece, col) => {
                    const dark = isValidSquare(row, col)
                    const isRed = piece?.color === 'red'
                    const isKing = piece?.type === 'king'

                    return (
                      <div
                        key={`${row}-${col}`}
                        onClick={() => handleSquareClick(row, col)}
                        className="relative flex items-center justify-center select-none"
                        style={{
                          width: 64,
                          height: 64,
                          background: dark
                            ? 'rgba(10,37,64,0.95)'
                            : 'rgba(30,60,90,0.3)',
                          cursor: dark ? 'pointer' : 'default',
                          boxShadow: dark ? 'inset 0 0 0 1px rgba(255,255,255,0.06)' : undefined,
                        }}
                      >
                        {/* Coordinate hint */}
                        {row === 7 && (
                          <span className="absolute bottom-0.5 right-1 text-[8px] text-white/15 select-none">
                            {col}
                          </span>
                        )}
                        {col === 0 && (
                          <span className="absolute top-0.5 left-1 text-[8px] text-white/15 select-none">
                            {row}
                          </span>
                        )}

                        {/* Hover hint on empty dark squares */}
                        {dark && !piece && (
                          <div
                            className="absolute inset-2 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-100"
                            style={{
                              background: brush === 'eraser'
                                ? 'rgba(255,100,100,0.15)'
                                : brush.startsWith('red')
                                  ? 'rgba(193,18,31,0.25)'
                                  : 'rgba(102,155,188,0.25)',
                            }}
                          />
                        )}

                        {/* Piece */}
                        {piece && (
                          <div
                            className="relative flex items-center justify-center rounded-full border-2 transition-all"
                            style={{
                              width: 46,
                              height: 46,
                              background: isRed
                                ? 'radial-gradient(circle at 38% 35%, #e84040, #8b0000)'
                                : 'radial-gradient(circle at 38% 35%, #89c4e1, #003049)',
                              borderColor: isRed ? '#ff6b6b' : '#90cce0',
                              boxShadow: `0 3px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)`,
                            }}
                          >
                            {isKing && (
                              <Crown
                                size={16}
                                style={{ color: 'rgba(255,230,100,0.9)', filter: 'drop-shadow(0 0 4px rgba(255,200,0,0.7))' }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Piece counts */}
              <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#c1121f]" />
                  <span className="text-[#669bbc] text-xs">{redCount} red</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#669bbc]" />
                  <span className="text-[#669bbc] text-xs">{blueCount} blue</span>
                </div>
              </div>
            </div>

            {/* Controls sidebar */}
            <div className="flex flex-col gap-4 flex-1 min-w-0 w-full lg:w-56">

              {/* Brush picker */}
              <div className="border border-white/10 p-4" style={{ background: 'rgba(10,37,64,0.85)' }}>
                <div className="font-pixel text-[8px] text-[#669bbc] mb-3">PAINT BRUSH</div>
                <div className="flex flex-col gap-2">
                  {(Object.keys(BRUSH_LABELS) as BrushType[]).map(b => (
                    <button
                      key={b}
                      onClick={() => setBrush(b)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold transition-all text-left"
                      style={{
                        background: brush === b
                          ? `${BRUSH_COLORS[b]}22`
                          : 'transparent',
                        color: brush === b ? BRUSH_COLORS[b] : 'rgba(102,155,188,0.6)',
                        borderLeft: brush === b
                          ? `2px solid ${BRUSH_COLORS[b]}`
                          : '2px solid transparent',
                      }}
                    >
                      {b === 'eraser' ? (
                        <Eraser size={14} />
                      ) : b.endsWith('king') ? (
                        <Crown size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      {BRUSH_LABELS[b]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="border border-white/10 p-4" style={{ background: 'rgba(10,37,64,0.85)' }}>
                <div className="font-pixel text-[8px] text-[#669bbc] mb-3">ACTIONS</div>
                <div className="flex flex-col gap-2">
                  <PixelButton
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={resetToStart}
                  >
                    <RotateCcw size={13} /> Reset to start
                  </PixelButton>
                  <PixelButton
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={clearBoard}
                  >
                    <Trash2 size={13} /> Clear board
                  </PixelButton>
                </div>
              </div>

              {/* Play / Save */}
              <div className="flex flex-col gap-2">
                <PixelButton
                  onClick={playFromHere}
                  className="w-full justify-center gap-2"
                  disabled={redCount === 0 || blueCount === 0}
                >
                  <Play size={14} /> Play from here
                  <ChevronRight size={14} />
                </PixelButton>

                <PixelButton
                  variant="secondary"
                  size="sm"
                  onClick={saveAsPuzzle}
                  disabled={saving || redCount === 0 || blueCount === 0}
                  className="w-full justify-center gap-2"
                >
                  <Save size={13} /> {saving ? 'Saving...' : 'Save as puzzle'}
                </PixelButton>

                {saveMsg && (
                  <p className="text-xs text-[#669bbc] mt-1">{saveMsg}</p>
                )}
              </div>

              {/* Instructions */}
              <div className="border border-white/10 p-4" style={{ background: 'rgba(10,37,64,0.6)' }}>
                <div className="font-pixel text-[8px] text-[#669bbc] mb-2">HOW TO USE</div>
                <ul className="text-xs text-[#669bbc]/70 space-y-1 leading-relaxed">
                  <li>• Select a brush above</li>
                  <li>• Click dark squares to place pieces</li>
                  <li>• Click same piece again to remove it</li>
                  <li>• Kings move in all 4 diagonals</li>
                  <li>• Only dark squares are valid</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
