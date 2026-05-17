import { redirect } from 'next/navigation'
import Link from 'next/link'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import PixelButton from '@/components/ui/PixelButton'
import { createClient } from '@/lib/supabase/server'
import { Trophy, Target, Puzzle, TrendingUp, Zap, LogOut } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: recentGames } = await supabase
    .from('games')
    .select('*')
    .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: eloHistory } = await supabase
    .from('elo_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const totalGames = (profile?.games_won || 0) + (profile?.games_lost || 0) + (profile?.games_drawn || 0)
  const winRate = totalGames > 0 ? Math.round((profile?.games_won || 0) / totalGames * 100) : 0

  const stats = [
    { label: 'ELO Rating', value: profile?.elo_rating || 1000, icon: TrendingUp, color: '#f3701e' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Trophy, color: '#669bbc' },
    { label: 'Games Won', value: profile?.games_won || 0, icon: Target, color: '#c1121f' },
    { label: 'Puzzle Streak', value: `${profile?.puzzle_streak || 0}d`, icon: Puzzle, color: '#f3701e' },
  ]

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar user={profile} />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center text-2xl font-black border-2"
                style={{
                  background: `hsl(${user.id.charCodeAt(0) * 5 % 360}, 60%, 20%)`,
                  borderColor: `hsl(${user.id.charCodeAt(0) * 5 % 360}, 60%, 40%)`,
                  color: `hsl(${user.id.charCodeAt(0) * 5 % 360}, 80%, 70%)`,
                }}>
                {profile?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{profile?.username}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {profile?.city && <span className="text-[#669bbc] text-sm">{profile.city}</span>}
                  {profile?.is_pro && (
                    <span className="pro-badge text-white rounded">PRO</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!profile?.is_pro && (
                <Link href="/subscribe">
                  <PixelButton variant="ghost" size="sm" className="gap-1">
                    <Zap size={12} /> Upgrade
                  </PixelButton>
                </Link>
              )}
              <form action="/api/auth/logout" method="POST">
                <PixelButton variant="secondary" size="sm" className="gap-1" type="submit">
                  <LogOut size={12} /> Logout
                </PixelButton>
              </form>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {stats.map(s => (
              <div key={s.label} className="border-2 border-white/10 p-4"
                style={{ background: 'rgba(10,37,64,0.8)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={14} style={{ color: s.color }} />
                  <span className="text-xs text-[#669bbc]">{s.label}</span>
                </div>
                <div className="font-pixel text-[16px]" style={{ color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* W/L/D breakdown */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-white/10 p-5" style={{ background: 'rgba(10,37,64,0.8)' }}>
              <div className="font-pixel text-[8px] text-[#669bbc] mb-4">GAME RECORD</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-black text-white">{profile?.games_won || 0}</div>
                  <div className="text-xs text-[#669bbc]">Wins</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#c1121f]">{profile?.games_lost || 0}</div>
                  <div className="text-xs text-[#669bbc]">Losses</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#669bbc]">{profile?.games_drawn || 0}</div>
                  <div className="text-xs text-[#669bbc]">Draws</div>
                </div>
              </div>

              {totalGames > 0 && (
                <div className="mt-4 h-2 flex gap-0.5 overflow-hidden">
                  <div className="bg-[#669bbc] transition-all" style={{ width: `${winRate}%` }} />
                  <div className="bg-[#c1121f]/60 transition-all"
                    style={{ width: `${Math.round((profile?.games_lost || 0) / totalGames * 100)}%` }} />
                  <div className="bg-white/20 flex-1" />
                </div>
              )}
            </div>

            <div className="border-2 border-white/10 p-5" style={{ background: 'rgba(10,37,64,0.8)' }}>
              <div className="font-pixel text-[8px] text-[#669bbc] mb-4">ELO HISTORY</div>
              {(eloHistory || []).length === 0 ? (
                <p className="text-[#669bbc]/50 text-sm">Play rated games to track ELO</p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                  {(eloHistory || []).map((entry: Record<string, unknown>) => (
                    <div key={entry.id as string} className="flex items-center justify-between text-xs">
                      <span className="text-[#669bbc]">{new Date(entry.created_at as string).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{entry.rating_after as number}</span>
                        <span style={{ color: (entry.delta as number) > 0 ? '#669bbc' : '#c1121f' }}>
                          {(entry.delta as number) > 0 ? '+' : ''}{entry.delta as number}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent games */}
          <div className="border-2 border-white/10" style={{ background: 'rgba(10,37,64,0.8)' }}>
            <div className="px-5 py-3 border-b border-white/10">
              <div className="font-pixel text-[8px] text-[#669bbc]">RECENT GAMES</div>
            </div>
            {(recentGames || []).length === 0 ? (
              <div className="p-8 text-center text-[#669bbc]/50 text-sm">No games played yet.</div>
            ) : (
              <div>
                {(recentGames || []).map((game: Record<string, unknown>) => {
                  const won = game.winner_id === user.id
                  const isDraw = !game.winner_id && game.ended_at
                  return (
                    <div key={game.id as string} className="flex items-center justify-between px-5 py-3 border-b border-white/5 text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`font-pixel text-[9px] px-2 py-0.5 ${
                          won ? 'bg-[#669bbc]/20 text-[#669bbc]' : isDraw ? 'bg-white/10 text-white/50' : 'bg-[#c1121f]/20 text-[#c1121f]'
                        }`}>
                          {won ? 'WIN' : isDraw ? 'DRAW' : 'LOSS'}
                        </span>
                        <span className="text-[#669bbc] capitalize">{(game.game_type as string) || 'game'}</span>
                        {game.ai_difficulty ? (
                          <span className="text-xs text-[#669bbc]/50">vs AI ({game.ai_difficulty as string})</span>
                        ) : null}
                      </div>
                      <span className="text-[#669bbc]/50 text-xs">
                        {new Date(game.created_at as string).toLocaleDateString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
