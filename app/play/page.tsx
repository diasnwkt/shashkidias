import Link from 'next/link'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import { Bot, Users, Puzzle, Monitor, LayoutGrid, ChevronRight } from 'lucide-react'

const modes = [
  {
    id: 'ai',
    icon: Bot,
    title: 'vs Arman AI',
    subtitle: 'Single Player',
    desc: 'Battle the 8-bit Arman. He reads live tech news while thinking and analyzes your game with Gemini AI afterwards.',
    href: '/play/ai',
    color: '#f3701e',
    tag: 'AI-POWERED',
  },
  {
    id: 'multiplayer',
    icon: Users,
    title: 'Multiplayer',
    subtitle: 'Online PvP',
    desc: 'Play with friends via invite link or get matched by ELO rating. City leaderboards for Almaty, Astana and more.',
    href: '/play/multiplayer',
    color: '#669bbc',
    tag: 'REALTIME',
  },
  {
    id: 'puzzle',
    icon: Puzzle,
    title: 'Puzzles',
    subtitle: 'Brain Training',
    desc: 'Daily puzzle with streak tracking + library of 50+ tactical studies from Easy to Grandmaster difficulty.',
    href: '/play/puzzle',
    color: '#c1121f',
    tag: 'DAILY',
  },
  {
    id: 'local',
    icon: Monitor,
    title: 'Local 2-Player',
    subtitle: 'Pass & Play',
    desc: 'Two players on the same device. Classic face-to-face experience, no account required.',
    href: '/play/local',
    color: '#669bbc',
    tag: 'LOCAL',
  },
  {
    id: 'editor',
    icon: LayoutGrid,
    title: 'Board Editor',
    subtitle: 'Custom Setup',
    desc: 'Design any board position — add, remove, or promote pieces. Play from your custom setup or save as a puzzle.',
    href: '/editor',
    color: '#f3701e',
    tag: 'EDITOR',
  },
]

export default function PlayPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-14 fade-up" style={{ animationDelay: '60ms' }}>
            <p className="font-pixel text-[9px] text-[#f3701e] mb-3 tracking-widest">SELECT MODE</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              How do you want<br />
              <span style={{ color: '#669bbc' }}>to play?</span>
            </h1>
          </div>

          {/* Mode cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {modes.map((mode, i) => (
              <Link key={mode.id} href={mode.href} className="group block fade-up"
                style={{ animationDelay: `${120 + i * 60}ms` }}>
                <div className="grad-card relative h-full p-8 overflow-hidden hover:-translate-y-1.5 transition-transform duration-300">
                  {/* Radial color tint */}
                  <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    style={{ background: `radial-gradient(ellipse at top left, ${mode.color}10 0%, transparent 60%)` }} />
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 w-14 h-0.5 transition-all duration-300 group-hover:w-24"
                    style={{ background: mode.color }} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-7">
                      <div className="inline-flex items-center justify-center w-14 h-14"
                        style={{ background: `${mode.color}14`, color: mode.color }}>
                        <mode.icon size={24} />
                      </div>
                      <span className="font-pixel text-[7px] px-2.5 py-1.5 border tracking-wider"
                        style={{ borderColor: `${mode.color}38`, color: mode.color, background: `${mode.color}0a` }}>
                        {mode.tag}
                      </span>
                    </div>

                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ color: `${mode.color}80` }}>
                      {mode.subtitle}
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight group-hover:text-[#f3701e] transition-colors duration-200">
                      {mode.title}
                    </h3>
                    <p className="leading-relaxed mb-7 text-sm" style={{ color: 'rgba(102,155,188,0.68)' }}>
                      {mode.desc}
                    </p>

                    <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 border transition-colors duration-200"
                      style={{
                        borderColor: `${mode.color}38`,
                        color: mode.color,
                        background: `${mode.color}0d`,
                      }}>
                      Play now
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
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
