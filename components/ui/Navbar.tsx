'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import PixelButton from './PixelButton'
import { Menu, X, Zap, ExternalLink } from 'lucide-react'

const links = [
  { href: '/play',        label: 'Play' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/play/puzzle', label: 'Puzzles' },
]

interface NavUser {
  username?: string
  is_pro?: boolean
}

export default function Navbar({ user: userProp }: { user?: NavUser | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<NavUser | null | undefined>(userProp)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data } = await supabase
            .from('profiles')
            .select('username, is_pro')
            .eq('id', authUser.id)
            .single()
          setUser(data ?? null)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(2,16,28,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <Image
            src="/nfactorial-logo.svg"
            alt="nfactorial"
            width={28}
            height={28}
            className="rounded-full flex-shrink-0"
            style={{ filter: 'drop-shadow(0 0 6px rgba(244,121,32,0.5))' }}
          />
          <span className="font-pixel text-[11px] leading-none text-white">checkers</span>
          {user?.is_pro && (
            <span className="pro-badge text-white rounded-sm">PRO</span>
          )}
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-semibold transition-colors hover:text-white"
                style={{ color: active ? '#f3701e' : 'rgba(102,155,188,0.75)' }}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#f3701e]" />
                )}
              </Link>
            )
          })}
        </div>

        {/* nfactorial school CTA + auth actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* nfactorial school button */}
          <a
            href="https://taplink.cc/nfactorial.school"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PixelButton
              variant="danger"
              size="sm"
              className="gap-1.5 text-[10px] font-pixel whitespace-nowrap"
            >
              <ExternalLink size={10} />
              nfactorial school
            </PixelButton>
          </a>

          {user ? (
            <>
              {!user.is_pro && (
                <Link href="/subscribe">
                  <PixelButton variant="ghost" size="sm" className="gap-1.5">
                    <Zap size={13} /> Upgrade
                  </PixelButton>
                </Link>
              )}
              <Link href="/profile">
                <PixelButton variant="secondary" size="sm">
                  {user.username ?? 'Profile'}
                </PixelButton>
              </Link>
            </>
          ) : user === null ? (
            <>
              <Link href="/auth/login">
                <PixelButton variant="ghost" size="sm">Login</PixelButton>
              </Link>
              <Link href="/auth/register">
                <PixelButton variant="primary" size="sm">Sign Up</PixelButton>
              </Link>
            </>
          ) : null /* still loading */}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-[#669bbc] hover:text-white transition-colors p-1.5"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 py-5 flex flex-col gap-4"
          style={{
            background: 'rgba(2,12,22,0.96)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
          {links.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold text-[#669bbc] hover:text-[#f3701e] transition-colors">
              {link.label}
            </Link>
          ))}

          <a href="https://taplink.cc/nfactorial.school" target="_blank" rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-semibold text-[#c1121f] hover:text-[#f3701e] transition-colors flex items-center gap-1.5">
            <ExternalLink size={13} /> nfactorial school
          </a>

          <div className="flex gap-3 pt-3 border-t border-white/[0.06]">
            {user ? (
              <Link href="/profile" onClick={() => setMobileOpen(false)}>
                <PixelButton variant="secondary" size="sm">Profile</PixelButton>
              </Link>
            ) : user === null ? (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <PixelButton variant="ghost" size="sm">Login</PixelButton>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                  <PixelButton variant="primary" size="sm">Sign Up</PixelButton>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  )
}
