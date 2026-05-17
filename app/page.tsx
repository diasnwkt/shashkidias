import Link from 'next/link'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import PixelButton from '@/components/ui/PixelButton'
import Navbar from '@/components/ui/Navbar'
import LandingBoard from '@/components/ui/LandingBoard'
import { createClient } from '@/lib/supabase/server'
import { Bot, Users, Puzzle, Trophy, Zap, ChevronRight, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'vs Arman AI',
    desc: 'Challenge Arman Seitkali\'s 8-bit AI clone. 3 difficulty levels. He reads live tech news while thinking.',
    color: '#f3701e',
    href: '/play/ai',
    tag: 'AI-POWERED',
  },
  {
    icon: Users,
    title: 'Multiplayer',
    desc: 'Play with friends via share link or find rated opponents. ELO ranking + city leaderboards.',
    color: '#669bbc',
    href: '/play/multiplayer',
    tag: 'REALTIME',
  },
  {
    icon: Puzzle,
    title: 'Puzzle Mode',
    desc: 'Daily checkers puzzle + 50+ tactical studies from Easy to Grandmaster. Streak tracking.',
    color: '#c1121f',
    href: '/play/puzzle',
    tag: 'DAILY',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    desc: 'Global top 100 + city rankings. Top players from Almaty, Astana and across Kazakhstan.',
    color: '#f3701e',
    href: '/leaderboard',
    tag: 'ELO',
  },
]

export default async function HomePage() {
  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data } = await supabase.from('profiles').select('username, is_pro').eq('id', authUser.id).single()
      user = data
    }
  } catch {}

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar user={user} />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 pt-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-96px)] py-12">

            {/* Left: text */}
            <div className="flex flex-col gap-7">
              <div className="fade-up" style={{ animationDelay: '60ms' }}>
                <span className="inline-flex items-center gap-2 font-pixel text-[8px] text-[#f3701e] border border-[#f3701e]/30 px-3 py-2 bg-[#f3701e]/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f3701e] animate-pulse inline-block" />
                  nfactorial school 2024
                </span>
              </div>

              <div className="fade-up" style={{ animationDelay: '130ms' }}>
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-[0.9] tracking-[-0.03em] text-white">
                  CHECK
                  <br />
                  <span style={{
                    background: 'linear-gradient(135deg, #f3701e 0%, #c1121f 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>ERS</span>
                  <br />
                  <span className="text-white/90">REBORN</span>
                </h1>
                <div className="mt-3 flex gap-1">
                  <div className="h-0.5 w-16 bg-[#f3701e]" />
                  <div className="h-0.5 w-6 bg-[#c1121f]" />
                  <div className="h-0.5 w-2 bg-[#669bbc]" />
                </div>
              </div>

              <p className="fade-up text-[#669bbc] text-lg leading-relaxed max-w-sm" style={{ animationDelay: '200ms' }}>
                The most ambitious checkers platform ever built.
                AI opponent, realtime multiplayer, daily puzzles —
                wrapped in <span className="text-white font-semibold">8-bit glory</span>.
              </p>

              {/* Stats */}
              <div className="fade-up flex gap-8" style={{ animationDelay: '270ms' }}>
                {[
                  { v: '12', l: 'PIECES' },
                  { v: '64', l: 'SQUARES' },
                  { v: '∞',  l: 'MOVES' },
                ].map((s, i) => (
                  <div key={s.l} className="flex flex-col gap-1.5">
                    <div className="font-pixel text-2xl text-[#f3701e] leading-none stat-count" style={{ animationDelay: `${300 + i * 60}ms` }}>{s.v}</div>
                    <div className="font-pixel text-[7px] text-[#669bbc]/50 tracking-widest">{s.l}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="fade-up flex flex-wrap gap-3" style={{ animationDelay: '340ms' }}>
                <Link href="/play">
                  <PixelButton size="lg" glowing className="font-bold tracking-wide">
                    START PLAYING <ChevronRight size={18} />
                  </PixelButton>
                </Link>
                <Link href="/subscribe">
                  <PixelButton variant="outline" size="lg" className="gap-2">
                    <Zap size={16} className="text-[#f3701e]" /> Go Pro — $5/mo
                  </PixelButton>
                </Link>
              </div>

              <p className="fade-up text-[#669bbc]/35 text-xs font-pixel" style={{ animationDelay: '400ms' }}>
                test card: 4242 4242 4242 4242
              </p>
            </div>

            {/* Right: animated board preview */}
            <div className="fade-up flex justify-center lg:justify-end" style={{ animationDelay: '180ms' }}>
              <LandingBoard />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4"><div className="sep" /></div>

      <section className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="font-pixel text-[9px] text-[#f3701e] mb-3 tracking-widest">GAME MODES</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Everything you need to
              <br />
              <span style={{ color: '#669bbc' }}>become a grandmaster</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <Link key={f.title} href={f.href} className="group block">
                <div className="grad-card relative h-full p-6 overflow-hidden hover:-translate-y-1.5 transition-transform duration-300">
                  {/* Watermark number */}
                  <div className="absolute -bottom-3 -right-1 font-pixel text-[52px] leading-none select-none pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.022)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {/* Top color accent */}
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: f.color, opacity: 0.55 }} />

                  {/* Icon */}
                  <div className="relative inline-flex items-center justify-center w-11 h-11 mb-5"
                    style={{ background: `${f.color}18`, color: f.color }}>
                    <f.icon size={20} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `${f.color}28` }} />
                  </div>

                  <div className="mb-1 font-pixel text-[7px] tracking-wider" style={{ color: `${f.color}80` }}>
                    {f.tag}
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 group-hover:text-[#f3701e] transition-colors duration-200 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(102,155,188,0.72)' }}>
                    {f.desc}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: f.color }}>
                    Explore <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Arman section ──────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4"><div className="sep" /></div>

      <section className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Arman sprite side */}
            <div className="flex justify-center order-2 lg:order-1">
              <div className="relative">
                {/* Glow halo */}
                <div className="absolute inset-0 scale-150 rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(243,112,30,0.18) 0%, transparent 70%)' }} />
                <div className="relative w-52 h-52 arman-idle flex items-center justify-center">
                  <ArmanMiniPreview />
                </div>
                <div className="mt-4 text-center font-pixel text-[8px] text-[#f3701e]">ARMAN.EXE</div>
                {/* Floating speech bubble */}
                <div className="absolute -top-4 -right-4 grad-card px-3 py-2 max-w-[140px]">
                  <p className="text-[10px] text-[#669bbc] leading-relaxed">Reading Hacker News while I think...</p>
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="order-1 lg:order-2">
              <p className="font-pixel text-[9px] text-[#f3701e] mb-4 tracking-widest">AI OPPONENT</p>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                Meet <span style={{
                  background: 'linear-gradient(135deg, #f3701e, #c1121f)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Arman</span>
              </h2>
              <p className="text-[#669bbc] text-lg leading-relaxed mb-6">
                Our 8-bit AI opponent powered by Minimax + Alpha-Beta pruning.
                He challenges you, reads live tech news while thinking,
                then analyzes your game with Gemini AI.
              </p>

              {/* Difficulty pills */}
              <div className="flex gap-2 mb-8">
                {[
                  { label: 'Beginner',    color: '#669bbc' },
                  { label: 'Normal',      color: '#f3701e' },
                  { label: 'Arman Mode',  color: '#c1121f' },
                ].map(d => (
                  <span key={d.label} className="text-xs font-semibold px-3 py-1.5 border"
                    style={{ borderColor: `${d.color}40`, color: d.color, background: `${d.color}0f` }}>
                    {d.label}
                  </span>
                ))}
              </div>

              <Link href="/play/ai">
                <PixelButton className="gap-2">
                  Challenge Arman <ChevronRight size={16} />
                </PixelButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pro CTA ────────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4"><div className="sep" /></div>

      <section className="relative z-10 py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="grad-card grad-card-pro relative p-10 text-center overflow-hidden">
            {/* Background radial glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(243,112,30,0.12) 0%, transparent 65%)' }} />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-6 mx-auto"
                style={{ background: 'rgba(243,112,30,0.15)', color: '#f3701e' }}>
                <Sparkles size={22} />
              </div>

              <p className="font-pixel text-[9px] text-[#f3701e] mb-4 tracking-widest">PRO SUBSCRIPTION</p>
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                Customize everything.
                <br />
                <span style={{ color: '#669bbc' }}>Be unique.</span>
              </h2>
              <p className="text-[#669bbc] mb-3 leading-relaxed">
                10+ board themes, custom color pickers, animated pieces.
                <br />For the player who takes aesthetics seriously.
              </p>

              {/* Feature chips */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {['Midnight', 'Desert', 'Ocean', 'Forest', 'Neon', 'Custom'].map(t => (
                  <span key={t} className="text-xs font-medium px-2.5 py-1 border border-[#f3701e]/25 text-[#f3701e]/70 bg-[#f3701e]/05">
                    {t}
                  </span>
                ))}
              </div>

              <Link href="/subscribe">
                <PixelButton size="lg" glowing className="font-bold tracking-wide mx-auto">
                  <Zap size={18} /> Go Pro — $5 / month
                </PixelButton>
              </Link>
              <p className="text-[#669bbc]/30 text-xs mt-5 font-pixel">
                cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4"><div className="sep" /></div>
      <footer className="relative z-10 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-pixel text-[9px] text-white/30">
            <span className="text-[#f3701e]">n!</span>checkers — nfactorial school 2024
          </div>
          <div className="flex gap-8 text-sm text-[#669bbc]/40">
            <Link href="/play"        className="hover:text-white transition-colors">Play</Link>
            <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/subscribe"   className="hover:text-white transition-colors">Pro</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ArmanMiniPreview() {
  return (
    <svg viewBox="0 0 32 32" width="208" height="208" style={{ imageRendering: 'pixelated' }}>
      <circle cx="16" cy="16" r="14" fill="rgba(243,112,30,0.06)" />
      <rect x="10" y="16" width="12" height="10" fill="#1a3a50" />
      <rect x="11" y="17" width="10" height="8" fill="#003049" />
      <rect x="14" y="17" width="4" height="8" fill="#f3701e" opacity="0.6" />
      <rect x="10" y="8" width="12" height="10" fill="#c8956c" />
      <rect x="10" y="8" width="12" height="3" fill="#1a0a00" />
      <rect x="10" y="11" width="2" height="2" fill="#1a0a00" />
      <rect x="12" y="13" width="2" height="2" fill="#1a0a00" />
      <rect x="18" y="13" width="2" height="2" fill="#1a0a00" />
      <rect x="13" y="13" width="1" height="1" fill="white" />
      <rect x="19" y="13" width="1" height="1" fill="white" />
      <rect x="13" y="16" width="6" height="1" fill="#8b4513" />
      <rect x="6"  y="16" width="4" height="3" fill="#c8956c" />
      <rect x="22" y="16" width="4" height="3" fill="#c8956c" />
      <rect x="6"  y="19" width="3" height="3" fill="#c8956c" />
      <rect x="23" y="19" width="3" height="3" fill="#c8956c" />
      <rect x="11" y="26" width="4" height="4" fill="#1a0a00" />
      <rect x="17" y="26" width="4" height="4" fill="#1a0a00" />
      <rect x="10" y="29" width="5" height="2" fill="#0a0a0a" />
      <rect x="17" y="29" width="5" height="2" fill="#0a0a0a" />
      <rect x="0"  y="0"  width="32" height="32" fill="none" stroke="#f3701e" strokeWidth="0.5" opacity="0.4" />
    </svg>
  )
}
