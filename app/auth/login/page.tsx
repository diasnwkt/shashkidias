'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PixelButton from '@/components/ui/PixelButton'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { LogIn, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/play')
      router.refresh()
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-pixel text-[12px] text-white inline-block">
            <span className="text-[#f3701e]">n!</span>checkers
          </Link>
          <p className="text-[#669bbc] text-sm mt-2">Welcome back, player</p>
        </div>

        {/* Card */}
        <div className="border-2 border-white/10 p-8" style={{ background: 'rgba(10,37,64,0.9)' }}>
          <div className="flex items-center gap-2 mb-6">
            <LogIn size={16} className="text-[#f3701e]" />
            <h1 className="font-black text-white text-lg">Sign In</h1>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#001f33] border-2 border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#f3701e] transition-colors pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#669bbc] hover:text-white">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-[#c1121f] text-xs border border-[#c1121f]/30 bg-[#c1121f]/5 px-3 py-2">
                {error}
              </div>
            )}

            <PixelButton type="submit" disabled={loading} className="w-full justify-center mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </PixelButton>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-[#669bbc] text-sm">
              No account?{' '}
              <Link href="/auth/register" className="text-[#f3701e] hover:underline font-medium">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
