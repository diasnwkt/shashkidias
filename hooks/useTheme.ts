'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useThemeLoader() {
  useEffect(() => {
    async function loadTheme() {
      // First try localStorage for instant apply
      const cached = localStorage.getItem('board_theme')
      if (cached) {
        try {
          const theme = JSON.parse(cached)
          applyTheme(theme)
        } catch {}
      }

      // Then fetch from Supabase for latest
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
          applyTheme(profile.board_theme as Record<string, string>)
          localStorage.setItem('board_theme', JSON.stringify(profile.board_theme))
        }
      } catch {}
    }

    loadTheme()
  }, [])
}

function applyTheme(theme: Record<string, string>) {
  const root = document.documentElement
  if (theme.lightCell) root.style.setProperty('--board-light', theme.lightCell)
  if (theme.darkCell) root.style.setProperty('--board-dark', theme.darkCell)
  if (theme.pieceRed) root.style.setProperty('--piece-red', theme.pieceRed)
  if (theme.pieceBlue) root.style.setProperty('--piece-blue', theme.pieceBlue)
}
