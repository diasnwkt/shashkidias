'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PixelButton from '@/components/ui/PixelButton'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { UserPlus } from 'lucide-react'

const KAZAKH_CITIES = ['Almaty', 'Astana', 'Shymkent', 'Karaganda', 'Aktobe', 'Taraz', 'Pavlodar', 'Oskemen', 'Other']

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (username.length < 3) { setError('Username must be at least 3 characters'); return }

    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, city } },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/play'), 2000)
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <div className="font-pixel text-[14px] text-[#f3701e] mb-4">WELCOME!</div>
          <p className="text-white text-lg">Account created. Redirecting to game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-pixel text-[12px] text-white inline-block">
            <span className="text-[#f3701e]">n!</span>checkers
          </Link>
          <p className="text-[#669bbc] text-sm mt-2">Create your account</p>
        </div>

        <div className="border-2 border-white/10 p-8" style={{ background: 'rgba(10,37,64,0.9)' }}>
          <div className="flex items-center gap-2 mb-6">
            <UserPlus size={16} className="text-[#f3701e]" />
            <h1 className="font-black text-white text-lg">Sign Up</h1>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#669bbc] font-medium mb-1.5 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                required minLength={3} maxLength={20}
                className="w-full bg-[#001f33] border-2 border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#f3701e] transition-colors"
                placeholder="arman_fan_99"
              />
            </div>

            <div>
              <label className="text-xs text-[#669bbc] font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#001f33] border-2 border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#f3701e] transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs text-[#669bbc] font-medium mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required minLength={6}
                className="w-full bg-[#001f33] border-2 border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#f3701e] transition-colors"
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label className="text-xs text-[#669bbc] font-medium mb-1.5 block">City <span className="opacity-60">(for leaderboard)</span></label>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </PixelButton>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-[#669bbc] text-sm">
              Have an account?{' '}
              <Link href="/auth/login" className="text-[#f3701e] hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
