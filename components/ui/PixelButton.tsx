'use client'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  pixelFont?: boolean
  glowing?: boolean
}

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = 'primary', size = 'md', pixelFont = false, glowing = false, children, ...props }, ref) => {
    const base = 'pixel-btn inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

    const variants = {
      primary: 'bg-[#c1121f] text-white hover:bg-[#ae1f23] border-2 border-[#780000] shadow-[4px_4px_0px_#780000] focus-visible:ring-[#c1121f]',
      secondary: 'bg-[#003049] text-[#669bbc] hover:bg-[#0a2540] border-2 border-[#669bbc] shadow-[4px_4px_0px_rgba(0,0,0,0.5)] focus-visible:ring-[#669bbc]',
      danger: 'bg-[#780000] text-white hover:bg-[#c1121f] border-2 border-[#c1121f] shadow-[4px_4px_0px_#400000] focus-visible:ring-[#780000]',
      ghost: 'bg-transparent text-[#f3701e] hover:bg-[#f3701e]/10 border-2 border-transparent hover:border-[#f3701e]/40 focus-visible:ring-[#f3701e]',
      outline: 'bg-transparent text-white hover:bg-white/5 border-2 border-white/30 hover:border-white/60 shadow-[4px_4px_0px_rgba(0,0,0,0.3)] focus-visible:ring-white',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-4 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          pixelFont && 'font-pixel',
          glowing && variant === 'primary' && 'glow-red',
          glowing && variant === 'ghost' && 'glow-orange',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
PixelButton.displayName = 'PixelButton'

export default PixelButton
