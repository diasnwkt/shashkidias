'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import PixelButton from './PixelButton'
import { Menu, X, Zap } from 'lucide-react'

const links = [
  { href: '/play',        label: 'Play' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/play/puzzle', label: 'Puzzles' },
]

export default function Navbar({ user }: { user?: { username?: string; is_pro?: boolean } | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

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
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center gap-1">
            <span className="font-pixel text-[11px] leading-none">
              <span className="text-[#f3701e]" style={{ textShadow: '0 0 12px rgba(243,112,30,0.5)' }}>n!</span>
              <span className="text-white">checkers</span>
            </span>
          </div>
          {user?.is_pro && (
            <span className="pro-badge text-white rounded-sm">PRO</span>
          )}
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
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

        {/* Auth actions */}
        <div className="hidden md:flex items-center gap-2.5">
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
          ) : (
            <>
              <Link href="/auth/login">
                <PixelButton variant="ghost" size="sm">Login</PixelButton>
              </Link>
              <Link href="/auth/register">
                <PixelButton variant="primary" size="sm">Sign Up</PixelButton>
              </Link>
            </>
          )}
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
          <div className="flex gap-3 pt-3 border-t border-white/[0.06]">
            {user ? (
              <Link href="/profile" onClick={() => setMobileOpen(false)}>
                <PixelButton variant="secondary" size="sm">Profile</PixelButton>
              </Link>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <PixelButton variant="ghost" size="sm">Login</PixelButton>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                  <PixelButton variant="primary" size="sm">Sign Up</PixelButton>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
