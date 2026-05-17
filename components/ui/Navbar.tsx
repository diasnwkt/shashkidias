'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import PixelButton from './PixelButton'
import { Menu, X, Zap } from 'lucide-react'

const links = [
  { href: '/play', label: 'Play' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/play/puzzle', label: 'Puzzles' },
]

export default function Navbar({ user }: { user?: { username?: string; is_pro?: boolean } | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{ background: 'rgba(0,30,49,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="font-pixel text-[10px] text-white leading-none">
            <span className="text-[#f3701e]">n!</span>
            <span>checkers</span>
          </div>
          {user?.is_pro && (
            <span className="pro-badge text-white rounded">PRO</span>
          )}
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#f3701e] ${
                pathname.startsWith(link.href) ? 'text-[#f3701e]' : 'text-[#669bbc]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {!user.is_pro && (
                <Link href="/subscribe">
                  <PixelButton variant="ghost" size="sm" className="gap-1">
                    <Zap size={13} /> Upgrade
                  </PixelButton>
                </Link>
              )}
              <Link href="/profile">
                <PixelButton variant="secondary" size="sm">{user.username ?? 'Profile'}</PixelButton>
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
        <button className="md:hidden text-white p-1" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-4 flex flex-col gap-4"
          style={{ background: 'rgba(0,30,49,0.95)' }}>
          {links.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-[#669bbc] hover:text-[#f3701e]">
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2 border-t border-white/10">
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
