import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

// Web Audio API orqali oddiy "ding" tovushi — hech qanday fayl kerak emas
function playDing() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)

    // Ikkita nota — "ding-ding" effekti
    ;[880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.connect(gain)
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.5)
    })
  } catch {
    // Brauzer AudioContext ni qo'llab-quvvatlamasa — jim o'tkazib yuboramiz
  }
}

// name     — o'quvchi ismi
// tugriKun — bugun to'g'ri dars kuni bo'lsa true
// onDone   — animatsiya tugagach chaqiriladi
export default function QRSuccessOverlay({ name, tugriKun, onDone }) {
  const [phase, setPhase] = useState('in')   // 'in' | 'out'

  useEffect(() => {
    playDing()

    // 2.1 sekunddan keyin so'nish boshlaydi
    const t1 = setTimeout(() => setPhase('out'), 2100)
    // 2.45 sekunddan keyin to'liq yo'qoladi
    const t2 = setTimeout(onDone, 2450)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5
        ${phase === 'in' ? 'qr-overlay-enter' : 'qr-overlay-exit'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.78)' }}
    >
      {/* Portlash effekti — doira va ripple to'lqini */}
      <div className="relative flex items-center justify-center">

        {/* Ripple to'lqini — kengayib yo'qoladi */}
        <div
          className="qr-ripple absolute rounded-full"
          style={{
            width: 168, height: 168,
            backgroundColor: tugriKun ? '#16A34A' : '#78716C',
          }}
        />

        {/* Asosiy yashil doira — portlab chiqadi */}
        <div
          className="qr-circle-pop relative flex items-center justify-center rounded-full shadow-2xl"
          style={{
            width: 168, height: 168,
            backgroundColor: tugriKun ? '#16A34A' : '#525252',
          }}
        >
          <Check
            size={80}
            strokeWidth={3}
            className="text-white"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
          />
        </div>
      </div>

      {/* O'quvchi ismi */}
      <div className="qr-name-up text-center px-8">
        <p className="text-white text-2xl font-bold tracking-tight">
          {name}
        </p>
        <p className="mt-1.5 text-sm font-medium"
          style={{ color: tugriKun ? '#86EFAC' : '#D4D4D0' }}>
          {tugriKun ? 'Keldi' : 'Qayd etildi'}
        </p>
      </div>

    </div>
  )
}
