import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlighted' | 'danger'
  noPadding?: boolean
}

export default function PixelCard({ className, variant = 'default', noPadding = false, children, ...props }: PixelCardProps) {
  const variants = {
    default: 'bg-[#0a2540] border-2 border-[#1a3a55] shadow-[4px_4px_0px_rgba(0,0,0,0.4)]',
    highlighted: 'bg-[#0a2540] border-2 border-[#f3701e] shadow-[4px_4px_0px_#780000]',
    danger: 'bg-[#200010] border-2 border-[#c1121f] shadow-[4px_4px_0px_#780000]',
  }

  return (
    <div
      className={cn(variants[variant], !noPadding && 'p-6', 'relative', className)}
      {...props}
    >
      {children}
    </div>
  )
}
