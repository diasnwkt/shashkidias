import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import { createClient } from '@/lib/supabase/server'
import { Trophy, MapPin, TrendingUp, Users } from 'lucide-react'

const CITIES = ['Almaty', 'Astana', 'Shymkent', 'Karaganda']

interface Player {
  id: string
  username: string | null
  city: string | null
  elo_rating: number
  is_pro: boolean
  puzzle_streak: number
}

function getRankColor(i: number) {
  if (i === 0) return '#ffd700'
  if (i === 1) return '#c0c0c0'
  if (i === 2) return '#cd7f32'
  return '#669bbc'
}

function RankBadge({ i }: { i: number }) {
  if (i === 0) return <span>🥇</span>
  if (i === 1) return <span>🥈</span>
  if (i === 2) return <span>🥉</span>
  return <span className="font-pixel text-[9px]" style={{ color: '#669bbc' }}>{i + 1}</span>
}

export default async function LeaderboardPage() {
  let globalBoard: Player[] = []
  let cityBoards: Record<string, Player[]> = {}
  let totalUsers = 0

  try {
    const supabase = await createClient()

    // All registered users ordered by ELO
    const { data: all, count } = await supabase
      .from('profiles')
      .select('id, username, city, elo_rating, is_pro, puzzle_streak', { count: 'exact' })
      .not('username', 'is', null)
      .order('elo_rating', { ascending: false })
      .limit(100)

    globalBoard = (all as Player[]) || []
    totalUsers = count ?? globalBoard.length

    for (const city of CITIES) {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, city, elo_rating, is_pro, puzzle_streak')
        .eq('city', city)
        .not('username', 'is', null)
        .order('elo_rating', { ascending: false })
        .limit(10)
      cityBoards[city] = (data as Player[]) || []
    }
  } catch {}

  // Ensure every city has an array (guard against undefined during static prerender)
  for (const city of CITIES) {
    if (!cityBoards[city]) cityBoards[city] = []
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="font-pixel text-[10px] text-[#f3701e] mb-2">RANKINGS</div>
            <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
              <Trophy size={28} style={{ color: '#f3701e' }} /> Leaderboard
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-sm text-[#669bbc]">
              <Users size={14} />
              <span>{totalUsers} registered player{totalUsers !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Global Top */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-[#f3701e]" />
                <span className="font-black text-white">Top {globalBoard.length} Players</span>
              </div>

              <div className="border-2 border-white/10" style={{ background: 'rgba(10,37,64,0.8)' }}>
                {globalBoard.length === 0 ? (
                  <div className="p-8 text-center text-[#669bbc] text-sm">
                    No registered players yet. Be the first!
                  </div>
                ) : (
                  <div>
                    {/* Header row */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/10 text-[10px] text-[#669bbc]/60 font-medium uppercase tracking-wider">
                      <div className="col-span-1">#</div>
                      <div className="col-span-6">Player</div>
                      <div className="col-span-3 text-right">ELO</div>
                      <div className="col-span-2 text-right">Streak</div>
                    </div>

                    {globalBoard.map((player, i) => (
                      <div
                        key={player.id}
                        className="leaderboard-row grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors items-center"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        {/* Rank */}
                        <div className="col-span-1 flex items-center">
                          <RankBadge i={i} />
                        </div>

                        {/* Player */}
                        <div className="col-span-6 flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: `hsl(${(player.id.charCodeAt(0) * 37 + player.id.charCodeAt(1) * 13) % 360}, 55%, 35%)` }}
                          >
                            {player.username?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-white text-sm font-medium truncate">
                                {player.username ?? 'Anonymous'}
                              </span>
                              {player.is_pro && (
                                <span className="pro-badge text-white rounded-sm flex-shrink-0">PRO</span>
                              )}
                            </div>
                            {player.city && (
                              <div className="text-[10px] text-[#669bbc]/50 flex items-center gap-0.5">
                                <MapPin size={8} /> {player.city}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ELO */}
                        <div
                          className="col-span-3 flex items-center justify-end font-pixel text-[11px]"
                          style={{ color: i < 3 ? getRankColor(i) : 'white' }}
                        >
                          {player.elo_rating ?? 1000}
                        </div>

                        {/* Puzzle streak */}
                        <div className="col-span-2 flex items-center justify-end text-sm text-[#669bbc]/60">
                          {player.puzzle_streak > 0 ? (
                            <span className="flex items-center gap-0.5 text-[#f3701e]/80 text-xs">
                              🔥 {player.puzzle_streak}
                            </span>
                          ) : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* City boards */}
            <div className="flex flex-col gap-4">
              {CITIES.map(city => (
                <div key={city} className="border-2 border-white/10 p-4" style={{ background: 'rgba(10,37,64,0.8)' }}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <MapPin size={12} className="text-[#f3701e]" />
                    <span className="font-black text-white text-sm">{city}</span>
                  </div>
                  {cityBoards[city].length === 0 ? (
                    <p className="text-[#669bbc]/40 text-xs">No players yet</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {cityBoards[city].slice(0, 5).map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] text-[#669bbc]/40 w-4 flex-shrink-0">{i + 1}</span>
                            <span className="text-sm text-white truncate">{p.username}</span>
                            {p.is_pro && <span className="pro-badge text-white rounded-sm flex-shrink-0">PRO</span>}
                          </div>
                          <span className="font-pixel text-[9px] text-[#f3701e] flex-shrink-0">{p.elo_rating}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
