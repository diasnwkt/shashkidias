'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Board from '@/components/game/Board'
import GameOver from '@/components/game/GameOver'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import PixelButton from '@/components/ui/PixelButton'
import { createInitialGameState, applyMoveToState } from '@/lib/checkers/engine'
import { GameState } from '@/lib/checkers/types'
import { formatTime } from '@/lib/utils'
import { Users, Clock, Copy, Check } from 'lucide-react'
import useAudio from '@/hooks/useAudio'
import { useBoardTheme } from '@/hooks/useBoardTheme'

export default function MultiplayerGamePage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const supabase = createClient()
  const audio = useAudio()
  const boardTheme = useBoardTheme()

  const [gameState, setGameState] = useState<GameState>(createInitialGameState())
  const [playerColor, setPlayerColor] = useState<'red' | 'blue' | null>(null)
  const [opponentName, setOpponentName] = useState<string>('Opponent')
  const [myName, setMyName] = useState<string>('You')
  const [status, setStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting')
  const [timer, setTimer] = useState(0)
  const [copied, setCopied] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function setup() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
      if (profile) setMyName(profile.username)

      const { data: room } = await supabase.from('rooms').select('*').eq('room_code', roomId).single()
      if (!room) { router.push('/play/multiplayer'); return }

      // Determine player color
      if (room.player1_id === user.id) {
        setPlayerColor('red')
      } else if (room.player2_id === user.id) {
        setPlayerColor('blue')
      } else if (room.status === 'waiting') {
        // Try to join as player 2
        await supabase.from('rooms').update({ player2_id: user.id, status: 'playing' }).eq('room_code', roomId)
        setPlayerColor('blue')
      }

      if (room.board_state) {
        setGameState(room.board_state as GameState)
      }
      setStatus(room.status)

      // Get opponent name
      const opponentId = room.player1_id === user.id ? room.player2_id : room.player1_id
      if (opponentId) {
        const { data: opp } = await supabase.from('profiles').select('username').eq('id', opponentId).single()
        if (opp) setOpponentName(opp.username)
      }
    }
    setup()
  }, [roomId])

  // Subscribe to room changes
  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `room_code=eq.${roomId}`,
      }, (payload) => {
        const room = payload.new as { board_state: GameState; status: string; player2_id: string }
        if (room.board_state) setGameState(room.board_state)
        if (room.status) setStatus(room.status as 'waiting' | 'playing' | 'finished')
        if (room.player2_id) setStatus('playing')
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  // Timer
  useEffect(() => {
    if (status !== 'playing') return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [status])

  const handleStateChange = useCallback(async (newState: GameState) => {
    setGameState(newState)
    audio.playMove()
    // Sync to Supabase
    await supabase.from('rooms').update({
      board_state: newState,
      current_turn: newState.currentTurn,
      last_move: newState.lastMove,
      status: newState.status !== 'playing' ? 'finished' : 'playing',
    }).eq('room_code', roomId)
  }, [roomId, audio])

  const handleCapture = useCallback(() => audio.playCapture(), [audio])

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isPlayerTurn = playerColor && gameState.currentTurn === playerColor && status === 'playing'

  const redPieces = gameState.board.flat().filter(p => p?.color === 'red').length
  const bluePieces = gameState.board.flat().filter(p => p?.color === 'blue').length

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-16 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between py-4 mb-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[#669bbc]" />
              <span className="font-pixel text-[8px] text-[#669bbc]">ROOM: {roomId}</span>
            </div>
            <div className="flex items-center gap-2 text-[#669bbc]">
              <Clock size={14} />
              <span className="font-pixel text-[10px]">{formatTime(timer)}</span>
            </div>
            <button onClick={copyLink} className="flex items-center gap-1.5 text-xs text-[#669bbc] hover:text-white transition-colors">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Share link'}
            </button>
          </div>

          {/* Waiting state */}
          {status === 'waiting' && (
            <div className="text-center py-8">
              <div className="font-pixel text-[10px] text-[#f3701e] mb-3 animate-pulse">
                WAITING FOR OPPONENT...
              </div>
              <p className="text-[#669bbc] text-sm mb-4">Share this link to invite a friend:</p>
              <div className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-sm text-[#669bbc]">
                <span className="truncate max-w-xs">{typeof window !== 'undefined' ? window.location.href : ''}</span>
                <button onClick={copyLink} className="text-[#f3701e]">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Score */}
          {status === 'playing' && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex items-center gap-2 p-3 border border-[#c1121f]/30"
                style={{ background: 'rgba(193,18,31,0.08)' }}>
                <div className="w-4 h-4 rounded-full bg-[#c1121f]" />
                <div>
                  <div className="text-xs text-[#669bbc]">{playerColor === 'red' ? myName : opponentName}</div>
                  <div className="font-pixel text-[12px] text-white">{redPieces}</div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="font-pixel text-[8px] text-[#f3701e]">
                  {isPlayerTurn ? 'YOUR TURN' : 'WAITING...'}
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 border border-[#669bbc]/30 justify-end"
                style={{ background: 'rgba(102,155,188,0.08)' }}>
                <div>
                  <div className="text-xs text-[#669bbc] text-right">{playerColor === 'blue' ? myName : opponentName}</div>
                  <div className="font-pixel text-[12px] text-white text-right">{bluePieces}</div>
                </div>
                <div className="w-4 h-4 rounded-full bg-[#669bbc]" />
              </div>
            </div>
          )}

          {/* Board */}
          {status !== 'waiting' && (
            <div className="relative flex justify-center">
              <Board
                gameState={gameState}
                onStateChange={handleStateChange}
                disabled={!isPlayerTurn}
                playerColor={playerColor ?? 'red'}
                boardTheme={boardTheme}
                onCapture={handleCapture}
                showCoordinates
              />
              {gameState.status !== 'playing' && (
                <GameOver
                  status={gameState.status}
                  playerColor={playerColor ?? 'red'}
                  onRematch={() => router.push('/play/multiplayer')}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
