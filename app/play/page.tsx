import Link from 'next/link'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import PixelButton from '@/components/ui/PixelButton'
import { Bot, Users, Puzzle, Monitor, ChevronRight } from 'lucide-react'

const modes = [
  {
    id: 'ai',
    icon: Bot,
    title: 'vs Arman AI',
    subtitle: 'Single Player',
    desc: 'Battle the 8-bit Arman. He reads tech news while thinking and analyzes your game after.',
    href: '/play/ai',
    color: '#f3701e',
    tag: 'AI-POWERED',
  },
  {
    id: 'multiplayer',
    icon: Users,
    title: 'Multiplayer',
    subtitle: 'Online PvP',
    desc: 'Play with friends via link or find rated opponents. ELO ranking + city leaderboards.',
    href: '/play/multiplayer',
    color: '#669bbc',
    tag: 'REALTIME',
  },
  {
    id: 'puzzle',
    icon: Puzzle,
    title: 'Puzzles',
    subtitle: 'Brain Training',
    desc: 'Daily puzzle + 50+ tactical studies from Easy to Grandmaster difficulty.',
    href: '/play/puzzle',
    color: '#c1121f',
    tag: 'DAILY',
  },
  {
    id: 'local',
    icon: Monitor,
    title: 'Local 2-Player',
    subtitle: 'Pass & Play',
    desc: 'Two players on the same device. Classic face-to-face experience.',
    href: '/play/local',
    color: '#669bbc',
    tag: 'LOCAL',
  },
]

export default function PlayPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-pixel text-[10px] text-[#f3701e] mb-3">SELECT MODE</div>
            <h1 className="text-4xl font-black text-white">How do you want to play?</h1>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {modes.map((mode) => (
              <Link key={mode.id} href={mode.href} className="group block">
                <div className="h-full p-6 border-2 border-white/10 hover:border-white/30 transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: 'rgba(10,37,64,0.8)',
                  }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 flex items-center justify-center border-2"
                      style={{ borderColor: mode.color, color: mode.color }}>
                      <mode.icon size={22} />
                    </div>
                    <span className="font-pixel text-[7px] px-2 py-1 border"
                      style={{ borderColor: mode.color + '40', color: mode.color }}>
                      {mode.tag}
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="text-xs text-[#669bbc] font-medium mb-0.5">{mode.subtitle}</div>
                    <h3 className="text-xl font-black text-white group-hover:text-[#f3701e] transition-colors">{mode.title}</h3>
                  </div>

                  <p className="text-sm text-[#669bbc]/80 leading-relaxed mb-4">{mode.desc}</p>

                  <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: mode.color }}>
                    Play now <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
