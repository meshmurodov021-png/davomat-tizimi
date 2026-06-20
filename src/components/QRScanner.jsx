import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Loader2, VideoOff } from 'lucide-react'

const SCANNER_DIV_ID = 'qr-camera-view'
const COOLDOWN_MS    = 2500

export default function QRScanner({ onScan }) {
  const scannerRef  = useRef(null)
  const lastScanRef = useRef(0)
  const startedRef  = useRef(false)   // ikki marta ishga tushishni oldini olish

  const [status,      setStatus]      = useState('starting')
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    const timer = setTimeout(startCamera, 200)
    return () => {
      clearTimeout(timer)
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startCamera() {
    if (startedRef.current) {
      console.log('[QRScanner] Allaqachon ishga tushgan, o\'tkazib yuborildi')
      return
    }
    startedRef.current = true
    console.log('[QRScanner] Kamera ishga tushmoqda...')

    try {
      const scanner = new Html5Qrcode(SCANNER_DIV_ID, { verbose: false })
      scannerRef.current = scanner

      // qrbox ni kamera o'lchamiga nisbatan foizda beramiz (55%) —
      // kichikroq zona — tezroq va aniqroq skanerlaydi
      const qrboxFunction = (w, h) => {
        const side = Math.floor(Math.min(w, h) * 0.55)
        console.log(`[QRScanner] Skanerlash zonasi: ${side}×${side} px (kamera: ${w}×${h})`)
        return { width: side, height: side }
      }

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,        // sekundiga kadr soni (oshirildi: 10→15)
          qrbox: qrboxFunction,
          aspectRatio: 1.0,
        },
        (decodedText) => {
          console.log('[QRScanner] QR topildi:', decodedText)
          const now = Date.now()
          if (now - lastScanRef.current < COOLDOWN_MS) {
            console.log('[QRScanner] Cooldown davom etmoqda, o\'tkazib yuborildi')
            return
          }
          lastScanRef.current = now
          onScan(decodedText)
        },
        (err) => {
          // Har kadrda QR topilmasa bu chaqiriladi — odatiy holat
          // Faqat "jiddiy" xatolarni loglaymiz
          if (err && !err.toString().includes('No MultiFormat')) {
            // silent
          }
        }
      )

      console.log('[QRScanner] Kamera muvaffaqiyatli ochildi, skanerlash boshlandi')
      setStatus('ready')

    } catch (err) {
      startedRef.current = false
      scannerRef.current = null
      console.error('[QRScanner] Kamera xatosi:', err)

      const msg = err?.message ?? String(err)
      if (msg.toLowerCase().includes('permission') || msg.includes('NotAllowedError')) {
        setCameraError("Kameraga ruxsat berilmagan. Brauzer manzil satridan 🔒 tugmasini bosib ruxsat bering.")
      } else if (msg.toLowerCase().includes('notfound') || msg.includes('DevicesNotFoundError')) {
        setCameraError("Kamera topilmadi. Qurilmangizda orqa kamera borligini tekshiring.")
      } else {
        setCameraError(`Kamera ochilmadi: ${msg}`)
      }
      setStatus('error')
    }
  }

  async function stopCamera() {
    if (!scannerRef.current) return
    console.log('[QRScanner] Kamera to\'xtatilmoqda...')
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop()
      }
      scannerRef.current.clear()
    } catch (e) {
      console.warn('[QRScanner] Stop xatosi (e\'tibor berilmaydi):', e)
    }
    scannerRef.current = null
    startedRef.current = false
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-black" style={{ minHeight: 260 }}>

      {/* html5-qrcode video elementini shu div ichiga joylaydi */}
      <div id={SCANNER_DIV_ID} className="w-full" />

      {/* Yuklanmoqda */}
      {status === 'starting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-2">
          <Loader2 size={28} className="text-white animate-spin" strokeWidth={1.5} />
          <p className="text-sm text-white/70">Kamera ochilmoqda...</p>
        </div>
      )}

      {/* Xatolik */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-3 p-6 text-center">
          <VideoOff size={32} className="text-white/50" strokeWidth={1.5} />
          <p className="text-sm text-white/80 leading-relaxed">{cameraError}</p>
        </div>
      )}

      {/* Tayyor — markaziy zona ko'rsatkichi */}
      {status === 'ready' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Burchak belgilari */}
          {[
            'top-0 left-0 border-t-2 border-l-2',
            'top-0 right-0 border-t-2 border-r-2',
            'bottom-0 left-0 border-b-2 border-l-2',
            'bottom-0 right-0 border-b-2 border-r-2',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-6 h-6 border-white/80 rounded-sm ${cls}`}
              style={{ margin: '20%' }} />
          ))}
          <p className="absolute bottom-3 text-xs text-white/60">
            QR kodni kamera oynasiga tuzing
          </p>
        </div>
      )}
    </div>
  )
}
