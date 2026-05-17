'use client'
import { useEffect, useState, useCallback } from 'react'
import ArmanSprite, { ArmanMood } from './ArmanSprite'
import { Difficulty } from '@/lib/checkers/minimax'

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
  const [news, setNews] = useState<NewsItem | null>(null)
  const [showNews, setShowNews] = useState(false)
  const [newsIndex, setNewsIndex] = useState(0)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])

  // Fetch HackerNews items
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/arman-news')
        if (res.ok) {
          const data = await res.json()
          setNewsItems(data.items || [])
        }
      } catch {}
    }
    fetchNews()
  }, [])

  // Rotate news every 30 seconds during AI turn
  useEffect(() => {
    if (!isMyTurn && newsItems.length > 0) {
      const item = newsItems[newsIndex % newsItems.length]
      setNews(item)
      setShowNews(true)
      const timer = setTimeout(() => {
        setShowNews(false)
        setNewsIndex(i => i + 1)
      }, 28000)
      return () => clearTimeout(timer)
    } else {
      setShowNews(false)
    }
  }, [isMyTurn, newsItems, newsIndex])

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
    <div className="flex flex-col gap-3 w-full max-w-[200px]">
      {/* Arman character */}
      <div className="flex flex-col items-center gap-2">
        <ArmanSprite mood={mood} size={100} />
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
      </div>

      {/* News ticker (shown during AI thinking) */}
      {showNews && news && (
        <div className="border border-[#669bbc]/20 p-2 text-[10px]"
          style={{ background: 'rgba(0,20,40,0.8)' }}>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f3701e] animate-pulse" />
            <span className="font-pixel text-[6px] text-[#f3701e]">TECH NEWS</span>
          </div>
          <p className="text-[#669bbc] leading-relaxed line-clamp-3">{news.title}</p>
          {news.summary && (
            <p className="text-white/50 mt-1 text-[9px] leading-relaxed line-clamp-2">{news.summary}</p>
          )}
        </div>
      )}
    </div>
  )
}
