'use client'
import { useEffect, useState } from 'react'
import ArmanSprite, { ArmanMood } from './ArmanSprite'
import { Difficulty } from '@/lib/checkers/minimax'
import { ExternalLink, Rss } from 'lucide-react'

interface NewsItem {
  title: string
  url: string
  source: string
  summary?: string
}

interface ArmanPanelProps {
  mood: ArmanMood
  difficulty: Difficulty
  isMyTurn: boolean
  lastEvent?: 'capture' | 'king' | 'my_capture' | null
}

const ARMAN_QUIPS: Record<string, string[]> = {
  thinking: [
    'Жарайды, let me think...',
    'Calculating 847 possible moves...',
    'Hmm... interesting position 🤔',
    'Reading YC news while I think...',
    'One moment... processing...',
    'Ойлап жатырмын...',
  ],
  my_capture: [
    'Nice capture! But can you handle what\'s coming?',
    'Жарайсың! Good move, but...',
    'Ooh, you got me there. Round 2.',
    'Smart! But my retaliation is incoming.',
  ],
  capture: [
    'Ой кой! You didn\'t see that coming 😈',
    'BOOM! That\'s how Arman plays.',
    'Double capture? Yes please! 👑',
    'Did I just... yes I did.',
    'Жеңдім! Another piece down.',
  ],
  king: [
    'DAMA! Now I\'m unstoppable.',
    'King me! 👑 Absolutely dominant.',
    'Дама алдым! Game over soon.',
  ],
  idle: [
    'Your move, friend.',
    'Take your time... or don\'t.',
    'I\'ve seen 3 moves ahead already.',
    'The clock is ticking ⏱️',
    'Make me proud with that move.',
  ],
}

function getRandomQuip(category: string): string {
  const quips = ARMAN_QUIPS[category] || ARMAN_QUIPS.idle
  return quips[Math.floor(Math.random() * quips.length)]
}

export default function ArmanPanel({ mood, difficulty, isMyTurn, lastEvent }: ArmanPanelProps) {
  const [speech, setSpeech] = useState(getRandomQuip('idle'))
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [newsLoaded, setNewsLoaded] = useState(false)

  // Fetch HackerNews items
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/arman-news')
        if (res.ok) {
          const data = await res.json()
          setNewsItems(data.items || [])
          setNewsLoaded(true)
        }
      } catch {}
    }
    fetchNews()
  }, [])

  // Update speech based on events
  useEffect(() => {
    if (!isMyTurn) {
      setSpeech(getRandomQuip('thinking'))
    } else if (lastEvent === 'capture') {
      setSpeech(getRandomQuip('my_capture'))
    } else if (lastEvent === 'my_capture') {
      setSpeech(getRandomQuip('capture'))
    } else if (lastEvent === 'king') {
      setSpeech(getRandomQuip('king'))
    } else {
      setSpeech(getRandomQuip('idle'))
    }
  }, [isMyTurn, lastEvent])

  const difficultyLabel = { easy: 'EASY', normal: 'NORMAL', arman: 'ARMAN MODE' }[difficulty]
  const difficultyColor = { easy: '#669bbc', normal: '#f3701e', arman: '#c1121f' }[difficulty]

  return (
    <div className="flex flex-col gap-3 w-full max-w-[220px]">
      {/* Arman character */}
      <div className="flex flex-col items-center gap-2">
        <ArmanSprite mood={mood} size={110} />
        <div className="font-pixel text-[8px] text-center" style={{ color: difficultyColor }}>
          ARMAN [{difficultyLabel}]
        </div>
      </div>

      {/* Speech bubble */}
      <div className="relative border-2 border-[#f3701e]/40 p-3 text-xs text-[#669bbc] leading-relaxed"
        style={{ background: 'rgba(0,30,49,0.9)' }}>
        <div className="absolute -top-2 left-4 w-0 h-0"
          style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '8px solid rgba(243,112,30,0.4)' }} />
        <span className="text-white/80">Arman:</span>{' '}{speech}
        {!isMyTurn && (
          <span className="inline-flex gap-0.5 ml-1">
            {[0, 1, 2].map(i => (
              <span key={i} className="inline-block w-1 h-1 rounded-full bg-[#669bbc]"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </span>
        )}
      </div>

      {/* Tech News Grid */}
      <div className="border border-[#669bbc]/15 overflow-hidden"
        style={{ background: 'rgba(0,18,36,0.85)' }}>
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#669bbc]/10">
          <Rss size={9} style={{ color: '#f3701e' }} />
          <span className="font-pixel text-[6px] text-[#f3701e] tracking-wider">TECH NEWS</span>
          {!isMyTurn && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#f3701e] animate-pulse" />
          )}
        </div>

        <div className="flex flex-col divide-y divide-white/[0.04]">
          {newsLoaded && newsItems.length > 0 ? newsItems.slice(0, 3).map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-0.5 px-3 py-2 hover:bg-white/[0.03] transition-colors"
            >
              <p className="text-[10px] text-[#669bbc]/80 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-[#669bbc]/30">{item.source}</span>
                <ExternalLink size={7} className="text-[#669bbc]/20 group-hover:text-[#669bbc]/50 transition-colors ml-auto" />
              </div>
            </a>
          )) : (
            // Skeleton placeholders
            [0, 1, 2].map(i => (
              <div key={i} className="px-3 py-2">
                <div className="h-2 rounded bg-white/[0.06] mb-1.5" style={{ width: `${70 + i * 10}%` }} />
                <div className="h-1.5 rounded bg-white/[0.04]" style={{ width: '40%' }} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
