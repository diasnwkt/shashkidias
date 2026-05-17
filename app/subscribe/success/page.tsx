import Link from 'next/link'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import PixelButton from '@/components/ui/PixelButton'
import { Trophy } from 'lucide-react'

export default function SubscribeSuccessPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />
      <div className="relative z-10 text-center max-w-sm">
        <Trophy size={48} className="mx-auto mb-4" style={{ color: '#f3701e' }} />
        <div className="font-pixel text-[14px] text-[#f3701e] mb-3">YOU'RE PRO!</div>
        <h1 className="text-2xl font-black text-white mb-2">Welcome to nfactorial Pro</h1>
        <p className="text-[#669bbc] mb-6">Board themes and custom colors are now unlocked. Go make it yours.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/customize">
            <PixelButton glowing>Customize Now</PixelButton>
          </Link>
          <Link href="/play">
            <PixelButton variant="secondary">Play</PixelButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
