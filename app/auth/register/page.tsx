'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PixelButton from '@/components/ui/PixelButton'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { UserPlus } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

const KAZAKH_CITIES = ['Almaty', 'Astana', 'Shymkent', 'Karaganda', 'Aktobe', 'Taraz', 'Pavlodar', 'Oskemen', 'Other']

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (err) { setError(err.message); setGoogleLoading(false) }
  }

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

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 mb-5 border-2 border-white/15 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/5 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <GoogleIcon />
            {googleLoading ? 'Redirecting...' : 'Sign up with Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[#669bbc]/50 text-xs">or with email</span>
            <div className="flex-1 h-px bg-white/10" />
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
