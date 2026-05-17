'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Board from '@/components/game/Board'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import PixelButton from '@/components/ui/PixelButton'
import { createClient } from '@/lib/supabase/client'
import { GameState, Move } from '@/lib/checkers/types'
import { formatTime } from '@/lib/utils'
import { Lightbulb, Clock, RotateCcw, ChevronLeft, CheckCircle, XCircle } from 'lucide-react'
import useAudio from '@/hooks/useAudio'

interface Puzzle {
  id: string
  title: string
  description?: string
  difficulty: string
  board_state: GameState
  solution_moves: Move[]
  hint1?: string
  hint2?: string
  hint3?: string
}

export default function PuzzleSolvePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const audio = useAudio()

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [timer, setTimer] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [currentHint, setCurrentHint] = useState<string | null>(null)
  const [solveStatus, setSolveStatus] = useState<'playing' | 'solved' | 'failed'>('playing')
  const [moveCount, setMoveCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function loadPuzzle() {
      const { data } = await supabase.from('puzzles').select('*').eq('id', params.id).single()
      if (!data) { router.push('/play/puzzle'); return }
      setPuzzle(data as Puzzle)
      setGameState(data.board_state as GameState)
      setLoading(false)
    }
    loadPuzzle()
  }, [params.id])

  // Timer
  useEffect(() => {
    if (solveStatus !== 'playing' || loading) return
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [solveStatus, loading])

  const handleStateChange = useCallback((newState: GameState) => {
    if (!puzzle || solveStatus !== 'playing') return

    setGameState(newState)
    const newMoveCount = moveCount + 1
    setMoveCount(newMoveCount)

    // Check if this move matches expected solution
    const expectedMove = puzzle.solution_moves[moveCount]
    if (newState.lastMove && expectedMove) {
      const isCorrect =
        newState.lastMove.to.row === expectedMove.to.row &&
        newState.lastMove.to.col === expectedMove.to.col

      if (!isCorrect) {
        setSolveStatus('failed')
        if (timerRef.current) clearInterval(timerRef.current)
        audio.playLose()
        return
      }
    }

    // Check if puzzle is solved (all solution moves made)
    if (newMoveCount >= puzzle.solution_moves.length) {
      setSolveStatus('solved')
      if (timerRef.current) clearInterval(timerRef.current)
      audio.playPuzzleSolved()

      // Calculate score
      const timeBonus = Math.max(0, 300 - timer)
      const hintPenalty = hintsUsed * 50
      const finalScore = Math.max(0, 100 + timeBonus - hintPenalty)
      setScore(finalScore)

      // Save completion
      savePuzzleCompletion(finalScore)
    }
  }, [puzzle, moveCount, solveStatus, timer, hintsUsed, audio])

  async function savePuzzleCompletion(finalScore: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !puzzle) return

    await supabase.from('puzzle_completions').upsert({
      user_id: user.id,
      puzzle_id: puzzle.id,
      time_seconds: timer,
      hints_used: hintsUsed,
      score: finalScore,
    })

    // Update streak if daily puzzle
    if ((puzzle as unknown as Record<string, unknown>).is_daily) {
      const today = new Date().toISOString().split('T')[0]
      const { data: profile } = await supabase.from('profiles').select('puzzle_streak, last_puzzle_date').eq('id', user.id).single()

      if (profile) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const newStreak = profile.last_puzzle_date === yesterday ? (profile.puzzle_streak || 0) + 1 : 1
        await supabase.from('profiles').update({ puzzle_streak: newStreak, last_puzzle_date: today }).eq('id', user.id)
      }
    }
  }

  function useHint() {
    if (!puzzle || hintsUsed >= 3) return
    const hints = [puzzle.hint1, puzzle.hint2, puzzle.hint3]
    const hint = hints[hintsUsed]
    if (hint) {
      setCurrentHint(hint)
      setHintsUsed(h => h + 1)
    }
  }

  function resetPuzzle() {
    if (!puzzle) return
    setGameState(puzzle.board_state)
    setMoveCount(0)
    setSolveStatus('playing')
    setTimer(0)
    setHintsUsed(0)
    setCurrentHint(null)
    setScore(0)
  }

  const diffColors: Record<string, string> = {
    easy: '#669bbc', medium: '#f3701e', hard: '#c1121f', grandmaster: '#780000'
  }

  if (loading || !puzzle || !gameState) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="font-pixel text-[10px] text-[#f3701e] animate-pulse">LOADING PUZZLE...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-16 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Back + header */}
          <div className="flex items-center gap-3 py-4 mb-4">
            <button onClick={() => router.push('/play/puzzle')}
              className="flex items-center gap-1 text-[#669bbc] hover:text-white transition-colors text-sm">
              <ChevronLeft size={14} /> Puzzles
            </button>
            <div className="w-px h-4 bg-white/20" />
            <span className="capitalize text-sm font-medium" style={{ color: diffColors[puzzle.difficulty] ?? '#669bbc' }}>
              {puzzle.difficulty}
            </span>
            <div className="ml-auto flex items-center gap-2 text-[#669bbc]">
              <Clock size={14} />
              <span className="font-pixel text-[10px]">{formatTime(timer)}</span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">{puzzle.title}</h1>
            {puzzle.description && <p className="text-[#669bbc] text-sm mt-1">{puzzle.description}</p>}
            <p className="text-[#669bbc]/60 text-xs mt-1">
              Move {moveCount + 1} of {puzzle.solution_moves.length} — Red to move
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Board */}
            <div className="relative flex justify-center flex-1">
              <Board
                gameState={gameState}
                onStateChange={handleStateChange}
                disabled={solveStatus !== 'playing'}
                playerColor="red"
                onCapture={() => audio.playCapture()}
                onMove={() => audio.playMove()}
              />

              {/* Solved overlay */}
              {solveStatus !== 'playing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                >
                  <div className="text-center p-6 border-2 max-w-xs"
                    style={{
                      background: 'rgba(10,37,64,0.98)',
                      borderColor: solveStatus === 'solved' ? '#669bbc' : '#c1121f',
                    }}>
                    {solveStatus === 'solved' ? (
                      <>
                        <CheckCircle size={40} className="mx-auto mb-3" style={{ color: '#669bbc' }} />
                        <div className="font-pixel text-[12px] text-[#669bbc] mb-2">SOLVED!</div>
                        <div className="font-pixel text-[20px] text-[#f3701e] mb-1">{score}</div>
                        <div className="text-xs text-[#669bbc]/60 mb-4">points</div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-[#669bbc] mb-4">
                          <div>Time: <span className="text-white">{formatTime(timer)}</span></div>
                          <div>Hints: <span className="text-white">{hintsUsed}/3</span></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle size={40} className="mx-auto mb-3" style={{ color: '#c1121f' }} />
                        <div className="font-pixel text-[12px] text-[#c1121f] mb-3">WRONG MOVE</div>
                        <p className="text-[#669bbc] text-sm mb-4">That wasn't the right move. Try again!</p>
                      </>
                    )}
                    <div className="flex gap-2">
                      <PixelButton onClick={resetPuzzle} size="sm" className="flex-1 justify-center gap-1">
                        <RotateCcw size={12} /> Reset
                      </PixelButton>
                      <PixelButton onClick={() => router.push('/play/puzzle')} variant="secondary" size="sm" className="flex-1 justify-center">
                        Back
                      </PixelButton>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Side panel */}
            <div className="w-full lg:w-48 flex flex-col gap-3">
              {/* Hints */}
              <div className="border border-white/10 p-4" style={{ background: 'rgba(10,37,64,0.8)' }}>
                <div className="font-pixel text-[8px] text-[#669bbc] mb-3">HINTS ({3 - hintsUsed} left)</div>
                <PixelButton variant="secondary" size="sm" className="w-full justify-center gap-1"
                  onClick={useHint} disabled={hintsUsed >= 3 || solveStatus !== 'playing'}>
                  <Lightbulb size={12} /> Use Hint (-50pts)
                </PixelButton>
                {currentHint && (
                  <p className="text-xs text-[#669bbc] mt-2 leading-relaxed">{currentHint}</p>
                )}
              </div>

              {/* Reset */}
              <PixelButton variant="ghost" size="sm" className="w-full justify-center gap-1" onClick={resetPuzzle}>
                <RotateCcw size={12} /> Reset
              </PixelButton>

              {/* Progress */}
              <div className="border border-white/10 p-3" style={{ background: 'rgba(10,37,64,0.6)' }}>
                <div className="font-pixel text-[7px] text-[#669bbc] mb-2">PROGRESS</div>
                <div className="flex gap-1">
                  {puzzle.solution_moves.map((_, i) => (
                    <div key={i} className="flex-1 h-2"
                      style={{
                        background: i < moveCount ? '#669bbc' : 'rgba(255,255,255,0.1)',
                      }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
