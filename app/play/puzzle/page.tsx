import Link from 'next/link'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import PixelButton from '@/components/ui/PixelButton'
import { createClient } from '@/lib/supabase/server'
import { Puzzle, Star, Calendar, Flame, ChevronRight, Lock } from 'lucide-react'

const DIFFICULTY_COLORS = {
  easy: '#669bbc',
  medium: '#f3701e',
  hard: '#c1121f',
  grandmaster: '#780000',
}

const DIFFICULTY_ICONS = {
  easy: '⭐',
  medium: '⭐⭐',
  hard: '⭐⭐⭐',
  grandmaster: '👑',
}

export default async function PuzzlePage() {
  let dailyPuzzle: Record<string, unknown> | null = null
  let puzzles: Record<string, unknown>[] = []
  let userStreak = 0
  let todaySolved = false

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get today's daily puzzle
    const today = new Date().toISOString().split('T')[0]
    const { data: daily } = await supabase
      .from('puzzles')
      .select('*')
      .eq('is_daily', true)
      .eq('daily_date', today)
      .single()
    dailyPuzzle = daily

    // Get all puzzles
    const { data: allPuzzles } = await supabase
      .from('puzzles')
      .select('*')
      .eq('is_daily', false)
      .order('difficulty', { ascending: true })
    puzzles = allPuzzles || []

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('puzzle_streak').eq('id', user.id).single()
      userStreak = profile?.puzzle_streak || 0

      if (daily) {
        const { data: completion } = await supabase
          .from('puzzle_completions')
          .select('id')
          .eq('user_id', user.id)
          .eq('puzzle_id', daily.id)
          .single()
        todaySolved = !!completion
      }
    }
  } catch {}

  const byDifficulty = ['easy', 'medium', 'hard', 'grandmaster'].map(d => ({
    difficulty: d,
    puzzles: puzzles.filter((p: Record<string, unknown>) => p.difficulty === d),
  }))

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="font-pixel text-[10px] text-[#c1121f] mb-2">BRAIN TRAINING</div>
            <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
              <Puzzle size={28} style={{ color: '#c1121f' }} /> Puzzles
            </h1>
          </div>

          {/* Streak banner */}
          {userStreak > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6 p-3 border border-[#f3701e]/30"
              style={{ background: 'rgba(243,112,30,0.05)' }}>
              <Flame size={16} style={{ color: '#f3701e' }} />
              <span className="font-pixel text-[10px] text-[#f3701e]">{userStreak} DAY STREAK!</span>
              <Flame size={16} style={{ color: '#f3701e' }} />
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Daily Puzzle */}
            <div className="lg:col-span-1">
              <div className="border-2 p-5" style={{
                borderColor: todaySolved ? '#669bbc' : '#f3701e',
                background: 'rgba(10,37,64,0.9)',
                boxShadow: todaySolved ? 'none' : '0 0 20px rgba(243,112,30,0.15)',
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={14} style={{ color: '#f3701e' }} />
                  <span className="font-pixel text-[8px] text-[#f3701e]">DAILY PUZZLE</span>
                  {todaySolved && <span className="font-pixel text-[7px] text-[#669bbc] ml-auto">SOLVED ✓</span>}
                </div>

                {dailyPuzzle ? (
                  <>
                    <h3 className="font-black text-white text-lg mb-1">{dailyPuzzle.title as string}</h3>
                    <p className="text-sm text-[#669bbc] mb-4">{dailyPuzzle.description as string || 'Find the best move sequence.'}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm">{DIFFICULTY_ICONS[dailyPuzzle.difficulty as keyof typeof DIFFICULTY_ICONS]}</span>
                      <span className="text-xs capitalize" style={{ color: DIFFICULTY_COLORS[dailyPuzzle.difficulty as keyof typeof DIFFICULTY_COLORS] }}>
                        {dailyPuzzle.difficulty as string}
                      </span>
                    </div>

                    <Link href={`/play/puzzle/${dailyPuzzle.id}`}>
                      <PixelButton className="w-full justify-center" variant={todaySolved ? 'secondary' : 'primary'}>
                        {todaySolved ? 'Play Again' : 'Solve Today\'s Puzzle'}
                        <ChevronRight size={14} />
                      </PixelButton>
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[#669bbc] text-sm mb-3">No daily puzzle today yet.</p>
                    <p className="text-[#669bbc]/50 text-xs">Check back soon!</p>
                  </div>
                )}
              </div>

              {/* Streak info */}
              <div className="mt-4 border border-white/10 p-4" style={{ background: 'rgba(10,37,64,0.6)' }}>
                <div className="font-pixel text-[8px] text-[#669bbc] mb-3">YOUR STATS</div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#669bbc]">Current streak</span>
                  <span className="text-white font-bold">{userStreak} days</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-[#669bbc]">Puzzles solved</span>
                  <span className="text-white font-bold">—</span>
                </div>
              </div>
            </div>

            {/* Puzzle library */}
            <div className="lg:col-span-2">
              <h2 className="font-black text-white mb-4">Puzzle Library</h2>

              {puzzles.length === 0 ? (
                <div className="border-2 border-white/10 p-8 text-center" style={{ background: 'rgba(10,37,64,0.6)' }}>
                  <Puzzle size={32} className="mx-auto mb-3 text-[#669bbc]/30" />
                  <p className="text-[#669bbc] text-sm mb-2">Puzzles are being loaded...</p>
                  <p className="text-[#669bbc]/50 text-xs">Make sure your Supabase is set up with puzzle data.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {byDifficulty.filter(d => d.puzzles.length > 0).map(({ difficulty, puzzles: dPuzzles }) => (
                    <div key={difficulty}>
                      <div className="flex items-center gap-2 mb-3">
                        <span>{DIFFICULTY_ICONS[difficulty as keyof typeof DIFFICULTY_ICONS]}</span>
                        <span className="font-black capitalize" style={{ color: DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] }}>
                          {difficulty}
                        </span>
                        <span className="text-[#669bbc]/50 text-xs">({dPuzzles.length} puzzles)</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {dPuzzles.slice(0, 6).map((puzzle: Record<string, unknown>) => (
                          <Link key={puzzle.id as string} href={`/play/puzzle/${puzzle.id}`} className="group block">
                            <div className="p-4 border border-white/10 hover:border-white/30 transition-all"
                              style={{ background: 'rgba(10,37,64,0.7)' }}>
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-white text-sm group-hover:text-[#f3701e] transition-colors">
                                  {puzzle.title as string}
                                </h4>
                                {puzzle.created_by === 'arman' && (
                                  <span className="font-pixel text-[6px] px-1 py-0.5"
                                    style={{ background: 'rgba(243,112,30,0.2)', color: '#f3701e', border: '1px solid rgba(243,112,30,0.3)' }}>
                                    ARMAN
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#669bbc]/70">{puzzle.description as string || 'Find the best sequence.'}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
