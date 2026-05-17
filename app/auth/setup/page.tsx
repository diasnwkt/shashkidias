'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PixelButton from '@/components/ui/PixelButton'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { User } from 'lucide-react'

const KAZAKH_CITIES = ['Almaty', 'Astana', 'Shymkent', 'Karaganda', 'Aktobe', 'Taraz', 'Pavlodar', 'Oskemen', 'Other']

export default function SetupProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (profile?.username) router.push('/play')
    }
    checkUser()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (username.length < 3) { setError('Username must be at least 3 characters'); return }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) {
      setError('Username is already taken')
      setLoading(false)
      return
    }

    const { error: err } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username, city })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/play')
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-pixel text-[12px] text-white inline-block">
            <span className="text-[#f3701e]">n!</span>checkers
          </div>
          <p className="text-[#669bbc] text-sm mt-2">Almost there! Pick your username</p>
        </div>

        <div className="border-2 border-white/10 p-8" style={{ background: 'rgba(10,37,64,0.9)' }}>
          <div className="flex items-center gap-2 mb-6">
            <User size={16} className="text-[#f3701e]" />
            <h1 className="font-black text-white text-lg">Set Up Profile</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#669bbc] font-medium mb-1.5 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                required minLength={3} maxLength={20}
                autoFocus
                className="w-full bg-[#001f33] border-2 border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#f3701e] transition-colors"
                placeholder="arman_fan_99"
              />
            </div>

            <div>
              <label className="text-xs text-[#669bbc] font-medium mb-1.5 block">
                City <span className="opacity-60">(for leaderboard)</span>
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-[#001f33] border-2 border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#f3701e] transition-colors"
              >
                <option value="">Select city...</option>
                {KAZAKH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {error && (
              <div className="text-[#c1121f] text-xs border border-[#c1121f]/30 bg-[#c1121f]/5 px-3 py-2">
                {error}
              </div>
            )}

            <PixelButton type="submit" disabled={loading} className="w-full justify-center mt-2">
              {loading ? 'Saving...' : 'Save & Start Playing'}
            </PixelButton>
          </form>
        </div>
      </div>
    </div>
  )
}
