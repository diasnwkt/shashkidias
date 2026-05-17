'use client'
import Image from 'next/image'

export type ArmanMood = 'idle' | 'think' | 'attack' | 'celebrate' | 'sad'

interface ArmanSpriteProps {
  mood?: ArmanMood
  size?: number
}

const MOOD_IMAGE: Record<ArmanMood, string> = {
  idle:      '/arman/default.png',
  think:     '/arman/terrified.png',
  attack:    '/arman/angry.png',
  celebrate: '/arman/happy.png',
  sad:       '/arman/terrified.png',
}

const MOOD_ANIMATION: Record<ArmanMood, string> = {
  idle:      'arman-idle',
  think:     'arman-think',
  attack:    'arman-attack',
  celebrate: 'arman-celebrate',
  sad:       'arman-sad',
}

export default function ArmanSprite({ mood = 'idle', size = 128 }: ArmanSpriteProps) {
  const h = Math.round(size * 1.1)

  return (
    <div
      className={MOOD_ANIMATION[mood]}
      style={{ display: 'inline-block', width: size, height: h, flexShrink: 0 }}
    >
      <Image
        src={MOOD_IMAGE[mood]}
        alt={`Arman ${mood}`}
        width={size}
        height={h}
        style={{
          imageRendering: 'pixelated',
          objectFit: 'contain',
          width: `${size}px`,
          height: `${h}px`,
          display: 'block',
        }}
        priority
      />
    </div>
  )
}
