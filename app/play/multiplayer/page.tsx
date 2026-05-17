'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import PixelButton from '@/components/ui/PixelButton'
import { createClient } from '@/lib/supabase/client'
import { generateRoomCode } from '@/lib/utils'
import { Link2, Search, Users, Copy, Check } from 'lucide-react'

export default function MultiplayerLobbyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<'create' | 'join' | 'matchmaking'>('create')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdRoom, setCreatedRoom] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function createRoom() {
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const code = generateRoomCode()
    const { data, error: err } = await supabase.from('rooms').insert({
      room_code: code,
      player1_id: user.id,
      status: 'waiting',
    }).select().single()

    if (err) { setError(err.message); setLoading(false); return }
    setCreatedRoom(code)
    setLoading(false)
  }

  async function joinRoom() {
    if (!joinCode.trim()) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', joinCode.toUpperCase())
      .eq('status', 'waiting')
      .single()

    if (!room) { setError('Room not found or already started.'); setLoading(false); return }

    await supabase.from('rooms').update({
      player2_id: user.id,
      status: 'playing',
    }).eq('id', room.id)

    router.push(`/play/multiplayer/${joinCode.toUpperCase()}`)
  }

  async function startMatchmaking() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    // Create a matchmaking room with a flag
    const code = generateRoomCode()
    await supabase.from('rooms').insert({
      room_code: code,
      player1_id: user.id,
      status: 'waiting',
    })
    router.push(`/play/multiplayer/${code}?matchmaking=true`)
  }

  const shareLink = createdRoom ? `${window.location.origin}/play/multiplayer/${createdRoom}` : ''

  async function copyLink() {
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="font-pixel text-[10px] text-[#669bbc] mb-2">MULTIPLAYER</div>
            <h1 className="text-3xl font-black text-white">Play Online</h1>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b border-white/10">
            {[
              { id: 'create', label: 'Create Room', icon: Link2 },
              { id: 'join', label: 'Join Room', icon: Users },
              { id: 'matchmaking', label: 'Find Match', icon: Search },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                  tab === t.id ? 'text-[#f3701e] border-b-2 border-[#f3701e]' : 'text-[#669bbc] hover:text-white'
                }`}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          <div className="border-2 border-white/10 p-6" style={{ background: 'rgba(10,37,64,0.9)' }}>
            {tab === 'create' && (
              <div className="flex flex-col gap-4">
                <p className="text-[#669bbc] text-sm">Create a room and share the link with a friend.</p>
                {!createdRoom ? (
                  <PixelButton onClick={createRoom} disabled={loading} className="w-full justify-center">
                    {loading ? 'Creating...' : 'Create Room'}
                  </PixelButton>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="border border-[#f3701e]/40 p-3 flex items-center justify-between"
                      style={{ background: 'rgba(243,112,30,0.05)' }}>
                      <div>
                        <div className="font-pixel text-[8px] text-[#f3701e] mb-1">ROOM CODE</div>
                        <div className="font-pixel text-[16px] text-white">{createdRoom}</div>
                      </div>
                      <button onClick={copyLink} className="p-2 border border-white/20 hover:border-white/40 transition-colors text-[#669bbc] hover:text-white">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-[#669bbc]/60">Waiting for opponent to join...</p>
                    <PixelButton onClick={() => router.push(`/play/multiplayer/${createdRoom}`)}
                      className="w-full justify-center">
                      Enter Room
                    </PixelButton>
                  </div>
                )}
              </div>
            )}

            {tab === 'join' && (
              <div className="flex flex-col gap-4">
                <p className="text-[#669bbc] text-sm">Enter a room code from your friend.</p>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ROOM CODE"
                  className="w-full bg-[#001f33] border-2 border-white/10 text-white px-4 py-3 font-pixel text-[14px] text-center tracking-widest focus:outline-none focus:border-[#f3701e] transition-colors uppercase"
                />
                {error && <p className="text-[#c1121f] text-xs">{error}</p>}
                <PixelButton onClick={joinRoom} disabled={loading || joinCode.length < 4}
                  className="w-full justify-center">
                  {loading ? 'Joining...' : 'Join Game'}
                </PixelButton>
              </div>
            )}

            {tab === 'matchmaking' && (
              <div className="flex flex-col gap-4">
                <p className="text-[#669bbc] text-sm">Get matched with a player of similar ELO rating automatically.</p>
                <div className="border border-[#669bbc]/20 p-3 text-xs text-[#669bbc]/70">
                  <div className="flex justify-between mb-1">
                    <span>Your ELO</span>
                    <span className="text-white">1000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Match range</span>
                    <span className="text-white">±200</span>
                  </div>
                </div>
                <PixelButton onClick={startMatchmaking} disabled={loading}
                  className="w-full justify-center" variant="secondary">
                  {loading ? 'Finding...' : '🔍 Find Opponent'}
                </PixelButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
