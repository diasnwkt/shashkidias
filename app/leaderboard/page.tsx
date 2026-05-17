import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import { createClient } from '@/lib/supabase/server'
import { Trophy, MapPin, TrendingUp } from 'lucide-react'

const CITIES = ['Almaty', 'Astana', 'Shymkent', 'Karaganda']

export default async function LeaderboardPage() {
  let globalBoard: Record<string, unknown>[] = []
  let cityBoards: Record<string, Record<string, unknown>[]> = {}

  try {
    const supabase = await createClient()

    const { data: global } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(50)

    globalBoard = global || []

    for (const city of CITIES) {
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('city', city)
        .limit(10)
      cityBoards[city] = data || []
    }
  } catch {}

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="font-pixel text-[10px] text-[#f3701e] mb-2">RANKINGS</div>
            <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
              <Trophy size={28} style={{ color: '#f3701e' }} /> Leaderboard
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Global Top */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-[#f3701e]" />
                <span className="font-black text-white">Global Top 50</span>
              </div>

              <div className="border-2 border-white/10" style={{ background: 'rgba(10,37,64,0.8)' }}>
                {globalBoard.length === 0 ? (
                  <div className="p-8 text-center text-[#669bbc] text-sm">
                    No ranked players yet. Play some games!
                  </div>
                ) : (
                  <div>
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/10 text-[10px] text-[#669bbc] font-medium">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">Player</div>
                      <div className="col-span-2 text-right">ELO</div>
                      <div className="col-span-2 text-right">W</div>
                      <div className="col-span-2 text-right">L</div>
                    </div>
                    {globalBoard.map((player: Record<string, unknown>, i) => (
                      <div
                        key={player.id as string}
                        className="leaderboard-row grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="col-span-1 flex items-center">
                          {i === 0 ? <span className="text-[#ffd700]">🥇</span> :
                            i === 1 ? <span className="text-[#c0c0c0]">🥈</span> :
                              i === 2 ? <span className="text-[#cd7f32]">🥉</span> :
                                <span className="font-pixel text-[9px] text-[#669bbc]">{i + 1}</span>}
                        </div>
                        <div className="col-span-5 flex items-center gap-2">
                          <div className="w-6 h-6 flex items-center justify-center text-xs"
                            style={{ background: `hsl(${(player.id as string).charCodeAt(0) * 5 % 360}, 60%, 40%)` }}>
                            {(player.username as string)?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">{player.username as string}</div>
                            {player.city ? (
                              <div className="text-[10px] text-[#669bbc]/60">{player.city as string}</div>
                            ) : null}
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center justify-end font-pixel text-[11px]"
                          style={{ color: i < 3 ? '#f3701e' : 'white' }}>
                          {player.elo_rating as number}
                        </div>
                        <div className="col-span-2 flex items-center justify-end text-sm text-[#669bbc]">
                          {player.games_won as number}
                        </div>
                        <div className="col-span-2 flex items-center justify-end text-sm text-[#c1121f]/70">
                          {player.games_lost as number}
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
                  {(cityBoards[city] || []).length === 0 ? (
                    <p className="text-[#669bbc]/50 text-xs">No players yet</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {(cityBoards[city] || []).slice(0, 5).map((p: Record<string, unknown>, i) => (
                        <div key={p.id as string} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#669bbc]/60 w-4">{i + 1}</span>
                            <span className="text-sm text-white">{p.username as string}</span>
                          </div>
                          <span className="font-pixel text-[9px] text-[#f3701e]">{p.elo_rating as number}</span>
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
