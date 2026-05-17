import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'nfactorial school — Checkers',
  description: 'The most epic checkers platform. Play vs AI Arman, compete in multiplayer, solve puzzles.',
  keywords: ['checkers', 'nfactorial', 'draughts', 'board game', 'multiplayer', 'AI'],
  openGraph: {
    title: 'nfactorial school Checkers',
    description: 'Play checkers vs AI Arman, find opponents online, solve daily puzzles.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased" style={{ background: 'var(--bg-primary)' }}>
        {children}
      </body>
    </html>
  )
}
