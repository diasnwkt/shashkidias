'use client'
import { useCallback, useRef, useEffect } from 'react'

function createOscillatorSound(
  ctx: AudioContext,
  frequencies: number[],
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.15
) {
  const gainNode = ctx.createGain()
  gainNode.connect(ctx.destination)
  gainNode.gain.setValueAtTime(volume, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    osc.connect(gainNode)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + (i * duration / frequencies.length))
    osc.start(ctx.currentTime + (i * duration / frequencies.length))
    osc.stop(ctx.currentTime + duration)
  })
}

function createNoiseExplosion(ctx: AudioContext, duration = 0.25) {
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  // Low-pass filter for 8-bit feel
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2000

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start()
}

export default function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const mutedRef = useRef(false)
  const volumeRef = useRef(0.15)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playMove = useCallback(() => {
    if (mutedRef.current) return
    try {
      const ctx = getCtx()
      createOscillatorSound(ctx, [280, 340], 0.1, 'square', 0.12)
    } catch {}
  }, [getCtx])

  const playCapture = useCallback(() => {
    if (mutedRef.current) return
    try {
      const ctx = getCtx()
      createNoiseExplosion(ctx, 0.25)
      setTimeout(() => createOscillatorSound(ctx, [150, 100], 0.15, 'sawtooth', 0.1), 50)
    } catch {}
  }, [getCtx])

  const playKing = useCallback(() => {
    if (mutedRef.current) return
    try {
      const ctx = getCtx()
      createOscillatorSound(ctx, [400, 500, 600, 800], 0.5, 'square', 0.15)
    } catch {}
  }, [getCtx])

  const playWin = useCallback(() => {
    if (mutedRef.current) return
    try {
      const ctx = getCtx()
      const fanfare = [523, 659, 784, 1047]
      fanfare.forEach((freq, i) => {
        setTimeout(() => createOscillatorSound(ctx, [freq], 0.25, 'square', 0.12), i * 150)
      })
    } catch {}
  }, [getCtx])

  const playLose = useCallback(() => {
    if (mutedRef.current) return
    try {
      const ctx = getCtx()
      const groan = [400, 300, 200]
      groan.forEach((freq, i) => {
        setTimeout(() => createOscillatorSound(ctx, [freq], 0.3, 'sawtooth', 0.1), i * 200)
      })
    } catch {}
  }, [getCtx])

  const playClick = useCallback(() => {
    if (mutedRef.current) return
    try {
      const ctx = getCtx()
      createOscillatorSound(ctx, [800], 0.05, 'square', 0.08)
    } catch {}
  }, [getCtx])

  const playPuzzleSolved = useCallback(() => {
    if (mutedRef.current) return
    try {
      const ctx = getCtx()
      const chime = [784, 988, 1175]
      chime.forEach((freq, i) => {
        setTimeout(() => createOscillatorSound(ctx, [freq], 0.3, 'sine', 0.12), i * 120)
      })
    } catch {}
  }, [getCtx])

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio_muted', String(muted))
    }
  }, [])

  const getMuted = useCallback(() => mutedRef.current, [])

  // Restore mute preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audio_muted')
      if (saved === 'true') mutedRef.current = true
    }
  }, [])

  return { playMove, playCapture, playKing, playWin, playLose, playClick, playPuzzleSolved, setMuted, getMuted }
}
