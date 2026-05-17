import Link from 'next/link'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import PixelButton from '@/components/ui/PixelButton'
import Navbar from '@/components/ui/Navbar'
import LandingBoard from '@/components/ui/LandingBoard'
import { createClient } from '@/lib/supabase/server'
import { Bot, Users, Puzzle, Trophy, Zap, Star, ChevronRight } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'vs Arman AI',
    desc: 'Challenge Arman Seitkali\'s 8-bit AI clone. 3 difficulty levels. He reads tech news while he thinks.',
    color: '#f3701e',
    href: '/play/ai',
  },
  {
    icon: Users,
    title: 'Multiplayer',
    desc: 'Play with friends via link or find rated opponents worldwide. ELO system. City leaderboards.',
    color: '#669bbc',
    href: '/play/multiplayer',
  },
  {
    icon: Puzzle,
    title: 'Puzzles',
    desc: 'Daily checkers puzzle + library of 50+ tactical studies. Easy to Grandmaster difficulty.',
    color: '#c1121f',
    href: '/play/puzzle',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    desc: 'Global top 100 + city rankings. Top players from Almaty, Astana and beyond.',
    color: '#f3701e',
    href: '/leaderboard',
  },
]

const stats = [
  { value: '12', label: 'GAME PIECES', pixel: true },
  { value: '64', label: 'SQUARES', pixel: true },
  { value: '∞', label: 'STRATEGIES', pixel: true },
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

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-96px)]">
            {/* Left: text */}
            <div className="flex flex-col gap-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 self-start">
                <span className="font-pixel text-[8px] text-[#f3701e] border border-[#f3701e]/40 px-3 py-1.5 bg-[#f3701e]/5">
                  nfactorial school
                </span>
              </div>

              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight text-white">
                  CHECKERS
                  <br />
                  <span style={{ color: '#f3701e' }}>RE</span>
                  <span style={{ color: '#c1121f' }}>BORN</span>
                </h1>
                <div className="mt-1 h-1 w-32 bg-gradient-to-r from-[#f3701e] to-[#c1121f]" />
              </div>

              <p className="text-[#669bbc] text-lg leading-relaxed max-w-md">
                The most ambitious checkers platform ever built.
                Compete against AI, battle friends online, master daily puzzles —
                all wrapped in{' '}
                <span className="text-white font-semibold">8-bit glory</span>.
              </p>

              {/* Stats row */}
              <div className="flex gap-6">
                {stats.map(s => (
                  <div key={s.label}>
                    <div className="font-pixel text-xl text-[#f3701e]">{s.value}</div>
                    <div className="text-[10px] font-pixel text-[#669bbc]/60 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/play">
                  <PixelButton size="lg" glowing className="font-semibold text-base">
                    START PLAYING <ChevronRight size={18} />
                  </PixelButton>
                </Link>
                <Link href="/subscribe">
                  <PixelButton variant="outline" size="lg" className="gap-2">
                    <Zap size={16} /> Go Pro — $5/mo
                  </PixelButton>
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-2 text-sm text-[#669bbc]/60">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#f3701e" stroke="none" />
                  ))}
                </div>
                <span>Built for nfactorial school 2024 challenge</span>
              </div>
            </div>

            {/* Right: animated board preview */}
            <div className="flex justify-center lg:justify-end">
              <LandingBoard />
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-pixel text-[10px] text-[#f3701e] mb-3">GAME MODES</p>
            <h2 className="text-3xl font-black text-white">Everything you need to<br />become a grandmaster</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Link key={f.title} href={f.href} className="group block">
                <div className="h-full p-6 border-2 border-white/10 hover:border-[#f3701e]/60 transition-colors duration-200"
                  style={{ background: 'rgba(10,37,64,0.6)' }}>
                  <div className="w-10 h-10 flex items-center justify-center mb-4 border-2"
                    style={{ borderColor: f.color, color: f.color }}>
                    <f.icon size={18} />
                  </div>
                  <h3 className="font-black text-white mb-2 group-hover:text-[#f3701e] transition-colors">{f.title}</h3>
                  <p className="text-sm text-[#669bbc] leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Arman teaser section */}
      <section className="relative z-10 py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-pixel text-[10px] text-[#f3701e] mb-4">AI OPPONENT</p>
              <h2 className="text-4xl font-black text-white mb-4">Meet <span style={{ color: '#f3701e' }}>Arman</span></h2>
              <p className="text-[#669bbc] text-lg leading-relaxed mb-6">
                Our 8-bit AI opponent powered by Minimax algorithm.
                He&apos;ll challenge you, read tech news while thinking,
                and analyze your game afterwards.
                <br /><br />
                <span className="text-white">Three difficulty modes:</span>{' '}
                Beginner, Normal, and the legendary <span style={{ color: '#f3701e' }}>Arman Mode</span> — almost unbeatable.
              </p>
              <Link href="/play/ai">
                <PixelButton>Challenge Arman <ChevronRight size={16} /></PixelButton>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                {/* Arman preview sprite */}
                <div className="w-48 h-48 arman-idle" style={{ imageRendering: 'pixelated' }}>
                  <ArmanMiniPreview />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-pixel text-[8px] text-[#f3701e] whitespace-nowrap">
                  ARMAN.EXE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pro CTA */}
      <section className="relative z-10 py-20 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-pixel text-[10px] text-[#f3701e] mb-4">PRO SUBSCRIPTION</p>
          <h2 className="text-4xl font-black text-white mb-4">Customize everything.<br />Be unique.</h2>
          <p className="text-[#669bbc] mb-8 text-lg">
            10+ board themes, custom color pickers, animated pieces.
            <br />For the player who takes aesthetics seriously.
          </p>
          <Link href="/subscribe">
            <PixelButton size="lg" glowing className="font-bold">
              <Zap size={18} /> Go Pro — $5 / month
            </PixelButton>
          </Link>
          <p className="text-[#669bbc]/40 text-xs mt-4 font-pixel">
            cancel anytime • test card: 4242 4242 4242 4242
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[#669bbc]/40 text-xs">
          <div className="font-pixel text-[8px]">
            <span className="text-[#f3701e]">n!</span>checkers — nfactorial school 2024
          </div>
          <div className="flex gap-6">
            <Link href="/play" className="hover:text-white transition-colors">Play</Link>
            <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/subscribe" className="hover:text-white transition-colors">Pro</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Mini Arman preview for landing page
function ArmanMiniPreview() {
  // 8-bit style character using CSS
  return (
    <svg viewBox="0 0 32 32" width="192" height="192" style={{ imageRendering: 'pixelated' }}>
      {/* Background glow */}
      <circle cx="16" cy="16" r="14" fill="rgba(243,112,30,0.08)" />
      {/* Body */}
      <rect x="10" y="16" width="12" height="10" fill="#1a3a50" />
      {/* Shirt/jacket detail */}
      <rect x="11" y="17" width="10" height="8" fill="#003049" />
      <rect x="14" y="17" width="4" height="8" fill="#f3701e" opacity="0.6" />
      {/* Head */}
      <rect x="10" y="8" width="12" height="10" fill="#c8956c" />
      {/* Hair */}
      <rect x="10" y="8" width="12" height="3" fill="#1a0a00" />
      <rect x="10" y="11" width="2" height="2" fill="#1a0a00" />
      {/* Eyes */}
      <rect x="12" y="13" width="2" height="2" fill="#1a0a00" />
      <rect x="18" y="13" width="2" height="2" fill="#1a0a00" />
      {/* Eye shine */}
      <rect x="13" y="13" width="1" height="1" fill="white" />
      <rect x="19" y="13" width="1" height="1" fill="white" />
      {/* Mouth */}
      <rect x="13" y="16" width="6" height="1" fill="#8b4513" />
      {/* Arms */}
      <rect x="6" y="16" width="4" height="3" fill="#c8956c" />
      <rect x="22" y="16" width="4" height="3" fill="#c8956c" />
      {/* Hands */}
      <rect x="6" y="19" width="3" height="3" fill="#c8956c" />
      <rect x="23" y="19" width="3" height="3" fill="#c8956c" />
      {/* Legs */}
      <rect x="11" y="26" width="4" height="4" fill="#1a0a00" />
      <rect x="17" y="26" width="4" height="4" fill="#1a0a00" />
      {/* Shoes */}
      <rect x="10" y="29" width="5" height="2" fill="#0a0a0a" />
      <rect x="17" y="29" width="5" height="2" fill="#0a0a0a" />
      {/* Pixel border */}
      <rect x="0" y="0" width="32" height="32" fill="none" stroke="#f3701e" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}
