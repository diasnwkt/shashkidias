'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import PixelButton from '@/components/ui/PixelButton'
import { createClient } from '@/lib/supabase/client'
import { Save, Lock } from 'lucide-react'

interface BoardTheme {
  lightCell: string
  darkCell: string
  pieceRed: string
  pieceBlue: string
}

const PRESET_THEMES: { name: string; theme: BoardTheme; ui?: string }[] = [
  { name: 'nfactorial', theme: { lightCell: '#c8a96e', darkCell: '#1a3a50', pieceRed: '#c1121f', pieceBlue: '#669bbc' } },
  { name: 'Midnight', theme: { lightCell: '#2a2a3e', darkCell: '#0d0d1a', pieceRed: '#8b0000', pieceBlue: '#1a237e' } },
  { name: 'Desert', theme: { lightCell: '#d4a874', darkCell: '#8b5e3c', pieceRed: '#bf360c', pieceBlue: '#4e342e' } },
  { name: 'Ocean', theme: { lightCell: '#7ecae3', darkCell: '#1565c0', pieceRed: '#e53935', pieceBlue: '#0288d1' } },
  { name: 'Forest', theme: { lightCell: '#aed581', darkCell: '#2e7d32', pieceRed: '#c62828', pieceBlue: '#1b5e20' } },
  { name: 'Crimson', theme: { lightCell: '#ffcdd2', darkCell: '#b71c1c', pieceRed: '#880e4f', pieceBlue: '#37474f' } },
  { name: 'Gold', theme: { lightCell: '#fff9c4', darkCell: '#f57f17', pieceRed: '#4e342e', pieceBlue: '#1a237e' } },
  { name: 'Neon', theme: { lightCell: '#1a1a2e', darkCell: '#0f0f1a', pieceRed: '#ff0055', pieceBlue: '#00ffaa' } },
  { name: 'Sakura', theme: { lightCell: '#fce4ec', darkCell: '#ad1457', pieceRed: '#880e4f', pieceBlue: '#4a148c' } },
  { name: 'Arctic', theme: { lightCell: '#e0f7fa', darkCell: '#006064', pieceRed: '#d84315', pieceBlue: '#01579b' } },
]

const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm text-[#669bbc]">{label}</span>
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className="w-20 bg-[#001f33] border border-white/10 text-white text-xs px-2 py-1 focus:outline-none focus:border-[#f3701e]" />
    </div>
  </div>
)

export default function CustomizePage() {
  const supabase = createClient()
  const router = useRouter()
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [theme, setTheme] = useState<BoardTheme>({
    lightCell: '#c8a96e', darkCell: '#1a3a50', pieceRed: '#c1121f', pieceBlue: '#669bbc',
  })

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase.from('profiles')
        .select('is_pro, board_theme').eq('id', user.id).single()

      if (!profile?.is_pro) { setIsPro(false); setLoading(false); return }
      setIsPro(true)
      if (profile.board_theme) setTheme(profile.board_theme as BoardTheme)
      setLoading(false)
    }
    loadSettings()
  }, [])

  async function saveTheme() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({ board_theme: theme }).eq('id', user.id)
    // Save to localStorage for instant apply
    localStorage.setItem('board_theme', JSON.stringify(theme))
    // Apply CSS variables
    applyTheme(theme)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  function applyTheme(t: BoardTheme) {
    document.documentElement.style.setProperty('--board-light', t.lightCell)
    document.documentElement.style.setProperty('--board-dark', t.darkCell)
    document.documentElement.style.setProperty('--piece-red', t.pieceRed)
    document.documentElement.style.setProperty('--piece-blue', t.pieceBlue)
  }

  function applyPreset(preset: typeof PRESET_THEMES[0]) {
    setTheme(preset.theme)
    applyTheme(preset.theme)
  }

  // Mini board preview
  const MiniBoard = ({ t }: { t: BoardTheme }) => (
    <div className="grid grid-cols-4" style={{ width: 64, height: 64 }}>
      {Array.from({ length: 16 }, (_, i) => {
        const r = Math.floor(i / 4), c = i % 4
        const dark = (r + c) % 2 === 1
        return (
          <div key={i} style={{ background: dark ? t.darkCell : t.lightCell, width: 16, height: 16 }}>
            {dark && r < 2 && <div className="w-full h-full flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full" style={{ background: t.pieceBlue }} /></div>}
            {dark && r > 1 && <div className="w-full h-full flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full" style={{ background: t.pieceRed }} /></div>}
          </div>
        )
      })}
    </div>
  )

  if (loading) return (
    <div className="relative min-h-screen flex items-center justify-center">
      <AnimatedBackground />
      <div className="font-pixel text-[10px] text-[#f3701e] animate-pulse">LOADING...</div>
    </div>
  )

  if (!isPro) return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 text-center max-w-sm mt-16">
        <Lock size={40} className="mx-auto mb-4 text-[#669bbc]" />
        <h1 className="text-2xl font-black text-white mb-2">Pro Feature</h1>
        <p className="text-[#669bbc] mb-6">Board customization requires a Pro subscription.</p>
        <PixelButton onClick={() => router.push('/subscribe')} glowing>Upgrade to Pro — $5/mo</PixelButton>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="font-pixel text-[10px] text-[#f3701e] mb-1">PRO FEATURE</div>
              <h1 className="text-3xl font-black text-white">Customize</h1>
            </div>
            <PixelButton onClick={saveTheme} disabled={saving} className="gap-2">
              <Save size={14} /> {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Theme'}
            </PixelButton>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Live preview */}
            <div className="flex flex-col gap-4">
              <div className="border-2 border-white/10 p-4" style={{ background: 'rgba(10,37,64,0.8)' }}>
                <div className="font-pixel text-[8px] text-[#669bbc] mb-3">LIVE PREVIEW</div>
                <div className="flex justify-center">
                  <div style={{ border: `2px solid ${theme.pieceRed}40` }}>
                    <div className="grid grid-cols-8" style={{ width: 240, height: 240 }}>
                      {Array.from({ length: 64 }, (_, i) => {
                        const r = Math.floor(i / 8), c = i % 8
                        const dark = (r + c) % 2 === 1
                        return (
                          <div key={i} style={{ background: dark ? theme.darkCell : theme.lightCell, width: 30, height: 30 }}>
                            {dark && r < 3 && <div className="w-full h-full flex items-center justify-center"><div className="rounded-full border" style={{ width: '75%', height: '75%', background: theme.pieceBlue, borderColor: theme.darkCell }} /></div>}
                            {dark && r > 4 && <div className="w-full h-full flex items-center justify-center"><div className="rounded-full border" style={{ width: '75%', height: '75%', background: theme.pieceRed, borderColor: theme.darkCell }} /></div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom color pickers */}
              <div className="border-2 border-white/10 p-4 flex flex-col gap-4" style={{ background: 'rgba(10,37,64,0.8)' }}>
                <div className="font-pixel text-[8px] text-[#f3701e] mb-1">CUSTOM COLORS</div>
                <ColorInput label="Light Cells" value={theme.lightCell} onChange={v => setTheme(t => ({ ...t, lightCell: v }))} />
                <ColorInput label="Dark Cells" value={theme.darkCell} onChange={v => setTheme(t => ({ ...t, darkCell: v }))} />
                <ColorInput label="Red Pieces" value={theme.pieceRed} onChange={v => setTheme(t => ({ ...t, pieceRed: v }))} />
                <ColorInput label="Blue Pieces" value={theme.pieceBlue} onChange={v => setTheme(t => ({ ...t, pieceBlue: v }))} />
              </div>
            </div>

            {/* Preset themes */}
            <div className="lg:col-span-2">
              <h2 className="font-black text-white mb-4">Preset Themes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_THEMES.map(preset => (
                  <button key={preset.name} onClick={() => applyPreset(preset)}
                    className="p-3 border-2 text-left transition-all hover:scale-105"
                    style={{
                      background: 'rgba(10,37,64,0.8)',
                      borderColor: JSON.stringify(theme) === JSON.stringify(preset.theme) ? '#f3701e' : 'rgba(255,255,255,0.1)',
                    }}>
                    <MiniBoard t={preset.theme} />
                    <div className="text-sm font-semibold text-white mt-2">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
