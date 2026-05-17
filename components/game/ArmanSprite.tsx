'use client'

export type ArmanMood = 'idle' | 'think' | 'attack' | 'celebrate' | 'sad'

interface ArmanSpriteProps {
  mood?: ArmanMood
  size?: number
}

export default function ArmanSprite({ mood = 'idle', size = 128 }: ArmanSpriteProps) {
  const moodClass = {
    idle: 'arman-idle',
    think: 'arman-think',
    attack: 'arman-attack',
    celebrate: 'arman-celebrate',
    sad: 'arman-sad',
  }[mood]

  // Eye state based on mood
  const eyeStyle = mood === 'think'
    ? { fill: '#1a0a00' }
    : mood === 'sad'
    ? { fill: '#1a0a00', transform: 'scaleY(0.5)' }
    : { fill: '#1a0a00' }

  const mouthPath = mood === 'celebrate' ? (
    // Big smile
    <path d="M12,17 Q16,20 20,17" stroke="#8b4513" strokeWidth="1.5" fill="none" />
  ) : mood === 'sad' ? (
    // Frown
    <path d="M12,19 Q16,16 20,19" stroke="#8b4513" strokeWidth="1.5" fill="none" />
  ) : mood === 'attack' ? (
    // Determined
    <rect x="13" y="17" width="6" height="1.5" fill="#8b4513" />
  ) : (
    // Neutral/slight smile
    <rect x="13" y="17" width="6" height="1" fill="#8b4513" />
  )

  return (
    <div className={moodClass} style={{ display: 'inline-block' }}>
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Shadow */}
        <ellipse cx="16" cy="31" rx="8" ry="1.5" fill="rgba(0,0,0,0.3)" />

        {/* Legs */}
        <rect x="11" y="26" width="4" height="4" fill="#1a1a2e" />
        <rect x="17" y="26" width="4" height="4" fill="#1a1a2e" />
        {/* Shoes */}
        <rect x="10" y="29" width="5" height="2" fill="#0a0a0a" />
        <rect x="17" y="29" width="5" height="2" fill="#0a0a0a" />

        {/* Body */}
        <rect x="10" y="16" width="12" height="11" fill="#1a3a50" />
        {/* Shirt */}
        <rect x="11" y="17" width="10" height="9" fill="#003049" />
        {/* nfactorial stripe on shirt */}
        <rect x="14" y="17" width="4" height="9" fill="#f3701e" opacity="0.5" />
        <rect x="15" y="17" width="2" height="9" fill="#c1121f" opacity="0.4" />

        {/* Arms */}
        <rect x="6" y="16" width="4" height="4" fill="#c8956c" />
        <rect x="22" y="16" width="4" height="4" fill="#c8956c" />
        {/* Forearms */}
        <rect x="5" y="20" width="4" height="3" fill="#c8956c" />
        <rect x="23" y="20" width="4" height="3" fill="#c8956c" />
        {/* Hands */}
        <rect x="5" y="23" width="4" height="3" fill="#c8956c" />
        <rect x="23" y="23" width="4" height="3" fill="#c8956c" />

        {/* Neck */}
        <rect x="13" y="14" width="6" height="3" fill="#c8956c" />

        {/* Head */}
        <rect x="9" y="6" width="14" height="10" fill="#c8956c" />

        {/* Hair (dark, short, slightly messy) */}
        <rect x="9" y="6" width="14" height="4" fill="#1a0a00" />
        <rect x="9" y="10" width="2" height="2" fill="#1a0a00" />
        <rect x="21" y="10" width="2" height="2" fill="#1a0a00" />
        {/* Hair highlight */}
        <rect x="13" y="6" width="4" height="1" fill="#3a2010" />

        {/* Eyebrows */}
        <rect x="11" y="11" width="4" height="1" fill="#1a0a00"
          style={mood === 'sad' ? { transform: 'rotate(5deg)', transformOrigin: '13px 11px' } : {}} />
        <rect x="17" y="11" width="4" height="1" fill="#1a0a00"
          style={mood === 'sad' ? { transform: 'rotate(-5deg)', transformOrigin: '19px 11px' } : {}} />

        {/* Eyes */}
        <rect x="11" y="12" width="3" height="3" fill="#ffffff" />
        <rect x="18" y="12" width="3" height="3" fill="#ffffff" />
        {/* Pupils */}
        <rect x="12" y="13" width="2" height="2" fill="#1a0a00" style={eyeStyle} />
        <rect x="19" y="13" width="2" height="2" fill="#1a0a00" style={eyeStyle} />
        {/* Eye shine */}
        <rect x="13" y="13" width="1" height="1" fill="white" />
        <rect x="20" y="13" width="1" height="1" fill="white" />

        {/* Mouth */}
        {mouthPath}

        {/* Ears */}
        <rect x="7" y="9" width="2" height="3" fill="#c8956c" />
        <rect x="23" y="9" width="2" height="3" fill="#c8956c" />

        {/* Celebrate: stars around */}
        {mood === 'celebrate' && (
          <>
            <text x="2" y="8" fontSize="4" fill="#f3701e">★</text>
            <text x="26" y="6" fontSize="3" fill="#c1121f">★</text>
            <text x="0" y="18" fontSize="3" fill="#f3701e">✦</text>
            <text x="28" y="20" fontSize="4" fill="#669bbc">★</text>
          </>
        )}

        {/* Think: dots */}
        {mood === 'think' && (
          <>
            <circle cx="25" cy="5" r="1" fill="#669bbc" opacity="0.6" />
            <circle cx="28" cy="3" r="1.5" fill="#669bbc" opacity="0.4" />
            <circle cx="30" cy="0" r="2" fill="#669bbc" opacity="0.2" />
          </>
        )}

        {/* Pixel scan line */}
        <rect x="9" y="6" width="14" height="16" fill="url(#scan)" opacity="0.1" />
        <defs>
          <pattern id="scan" x="0" y="0" width="1" height="2" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="1" height="1" fill="#000" opacity="0.5" />
          </pattern>
        </defs>
      </svg>
    </div>
  )
}
