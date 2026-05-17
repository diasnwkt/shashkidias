'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import PixelButton from '@/components/ui/PixelButton'
import { Zap, Palette, Layers, Sparkles, Check, CreditCard } from 'lucide-react'

const PRO_FEATURES = [
  { icon: Palette, label: '10+ Board Themes', desc: 'Midnight, Desert, Ocean, Forest, and more' },
  { icon: Layers, label: 'Custom Color Picker', desc: 'Choose any color for every UI element' },
  { icon: Sparkles, label: 'Animated Pieces', desc: 'Particle effects on every move' },
  { icon: Zap, label: 'Remove Ads', desc: 'Clean, distraction-free experience' },
]

const BOARD_THEMES = [
  { name: 'Default', light: '#c8a96e', dark: '#1a3a50' },
  { name: 'Midnight', light: '#2a2a3e', dark: '#111122' },
  { name: 'Desert', light: '#d4a874', dark: '#8b5e3c' },
  { name: 'Ocean', light: '#7ecae3', dark: '#1a4a6b' },
  { name: 'Forest', light: '#8bc34a', dark: '#2e5016' },
  { name: 'Crimson', light: '#ffcdd2', dark: '#c62828' },
]

export default function SubscribePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="pro-badge text-white rounded">PRO</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-3">
              Level up your <span style={{ color: '#f3701e' }}>game</span>
            </h1>
            <p className="text-[#669bbc] text-lg max-w-md mx-auto">
              Unlock board themes, custom colors, and animated pieces.
              All for less than a coffee.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Pricing card */}
            <div className="border-2 p-8" style={{
              borderColor: '#f3701e',
              background: 'rgba(10,37,64,0.95)',
              boxShadow: '0 0 40px rgba(243,112,30,0.15), 8px 8px 0 #780000',
            }}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="font-pixel text-[10px] text-[#f3701e] mb-1">MONTHLY</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">$5</span>
                    <span className="text-[#669bbc]">/month</span>
                  </div>
                </div>
                <Zap size={32} style={{ color: '#f3701e' }} />
              </div>

              <div className="flex flex-col gap-3 mb-8">
                {PRO_FEATURES.map(f => (
                  <div key={f.label} className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0"
                      style={{ background: 'rgba(243,112,30,0.15)', border: '1px solid rgba(243,112,30,0.4)' }}>
                      <Check size={11} style={{ color: '#f3701e' }} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{f.label}</div>
                      <div className="text-[#669bbc]/60 text-xs">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="text-[#c1121f] text-xs border border-[#c1121f]/30 bg-[#c1121f]/5 px-3 py-2 mb-4">
                  {error}
                </div>
              )}

              <PixelButton onClick={handleSubscribe} disabled={loading} size="lg"
                className="w-full justify-center gap-2" glowing>
                <CreditCard size={16} />
                {loading ? 'Redirecting...' : 'Subscribe — $5/mo'}
              </PixelButton>

              <p className="text-[#669bbc]/40 text-xs text-center mt-3">
                Cancel anytime • Secure payment via Stripe
              </p>
              <p className="text-[#669bbc]/30 text-[10px] text-center mt-1 font-pixel">
                TEST CARD: 4242 4242 4242 4242
              </p>
            </div>

            {/* Theme preview */}
            <div>
              <h3 className="font-black text-white mb-4">Board Themes Preview</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {BOARD_THEMES.map(theme => (
                  <div key={theme.name} className="border border-white/10 p-2"
                    style={{ background: 'rgba(10,37,64,0.6)' }}>
                    {/* Mini board preview */}
                    <div className="grid grid-cols-4 mb-2" style={{ aspectRatio: '1' }}>
                      {Array.from({ length: 16 }, (_, i) => {
                        const row = Math.floor(i / 4)
                        const col = i % 4
                        const isDark = (row + col) % 2 === 1
                        return (
                          <div key={i} style={{ background: isDark ? theme.dark : theme.light, aspectRatio: '1' }}>
                            {isDark && (row === 0 || row === 1) && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="rounded-full w-3/4 h-3/4 bg-[#669bbc]" />
                              </div>
                            )}
                            {isDark && (row === 2 || row === 3) && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="rounded-full w-3/4 h-3/4 bg-[#c1121f]" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="text-center text-xs text-[#669bbc]">{theme.name}</div>
                  </div>
                ))}
              </div>

              <div className="border border-white/10 p-4" style={{ background: 'rgba(10,37,64,0.6)' }}>
                <div className="font-pixel text-[8px] text-[#f3701e] mb-2">CUSTOM COLORS</div>
                <p className="text-sm text-[#669bbc]">
                  Pick any color for board cells, pieces, and the entire UI.
                  Save multiple presets. Your style, your game.
                </p>
                <div className="flex gap-2 mt-3">
                  {['#c1121f', '#f3701e', '#669bbc', '#003049', '#8bc34a', '#9c27b0'].map(c => (
                    <div key={c} className="w-6 h-6 rounded-full border-2 border-black/20" style={{ background: c }} />
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] text-white">+∞</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
