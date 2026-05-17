'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BoardTheme {
  lightCell: string
  darkCell: string
  pieceRed: string
  pieceBlue: string
}

const DEFAULT_THEME: BoardTheme = {
  lightCell: '#c8a96e',
  darkCell: '#1a3a50',
  pieceRed: '#c1121f',
  pieceBlue: '#669bbc',
}

export function useBoardTheme(): BoardTheme {
  const [theme, setTheme] = useState<BoardTheme>(() => {
    // Read from localStorage immediately (sync, no flash)
    if (typeof window === 'undefined') return DEFAULT_THEME
    try {
      const stored = localStorage.getItem('board_theme')
      if (stored) return { ...DEFAULT_THEME, ...JSON.parse(stored) }
    } catch {}
    return DEFAULT_THEME
  })

  useEffect(() => {
    // Also check Supabase in case user is on a new device
    async function syncFromSupabase() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase
          .from('profiles')
          .select('board_theme, is_pro')
          .eq('id', user.id)
          .single()
        if (profile?.is_pro && profile.board_theme) {
          const t = profile.board_theme as BoardTheme
          setTheme(t)
          localStorage.setItem('board_theme', JSON.stringify(t))
        }
      } catch {}
    }
    syncFromSupabase()
  }, [])

  return theme
}
