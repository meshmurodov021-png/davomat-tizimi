import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { CheckCircle2, AlertCircle, Loader2, VideoOff } from 'lucide-react'

// Kamera ekrandagi QR kodni aniqlab, onScan(text) ni chaqiradi
// onScan: skanerlangan UUID string ni qabul qiladi
// Bir xil QR kod ketma-ket skanerlanmasin deb COOLDOWN_MS interval ishlatiladi
const SCANNER_DIV_ID = 'qr-camera-view'
const COOLDOWN_MS    = 2500  // muvaffaqiyatli skanerlashdan so'ng pauza (ms)

export default function QRScanner({ onScan }) {
  const scannerRef   = useRef(null)   // Html5Qrcode instance
  const lastScanRef  = useRef(0)      // oxirgi muvaffaqiyatli skanerlash vaqti

  const [status, setStatus]         = useState('starting')  // starting | ready | error
  const [cameraError, setCameraError] = useState('')

  // Kamerani yoqish
  useEffect(() => {
    // DOM elementini render bo'lishini kutish uchun kichik kechiktirish
    const timer = setTimeout(startCamera, 150)

    return () => {
      clearTimeout(timer)
      stopCamera()
    }
  }, [])

  async function startCamera() {
    // Agar allaqachon ishga tushirilgan bo'lsa — qaytadan boshlama
    if (scannerRef.current) return

    try {
      const scanner = new Html5Qrcode(SCANNER_DIV_ID, { verbose: false })
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },   // orqa kamera
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
        },
        (decodedText) => {
          // Cooldown tekshiruvi — bir xil QR qayta-qayta skanerlanmasin
          const now = Date.now()
          if (now - lastScanRef.current < COOLDOWN_MS) return
          lastScanRef.current = now
          onScan(decodedText)
        },
        () => {
          // Har kadrda QR topilmasa bu chaqiriladi — odatiy holat, e'tibor bermaylik
        }
      )

      setStatus('ready')
    } catch (err) {
      scannerRef.current = null
      if (err?.message?.toLowerCase().includes('permission')) {
        setCameraError("Kameraga ruxsat berilmagan. Brauzer manzil satridan ruxsat bering.")
      } else if (err?.message?.toLowerCase().includes('notfound')) {
        setCameraError("Kamera topilmadi. Qurilmangizda kamera borligini tekshiring.")
      } else {
        setCameraError("Kamera ochilmadi. Sahifani yangilab qaytadan urining.")
      }
      setStatus('error')
    }
  }

  async function stopCamera() {
    if (!scannerRef.current) return
    try {
      await scannerRef.current.stop()
      scannerRef.current.clear()
    } catch {
      // Agar stop xato bersa — e'tibor bermaslik
    }
    scannerRef.current = null
  }

  return (
    <div className="relative">
      {/* html5-qrcode kamera oynasini shu div ichiga joylaydi */}
      <div
        id={SCANNER_DIV_ID}
        className="w-full rounded-lg overflow-hidden bg-[#0a0a0a]"
        style={{ minHeight: 280 }}
      />

      {/* Yuklanmoqda overlay */}
      {status === 'starting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] rounded-lg gap-2">
          <Loader2 size={28} className="text-white animate-spin" strokeWidth={1.5} />
          <p className="text-sm text-white/70">Kamera ochilmoqda...</p>
        </div>
      )}

      {/* Xatolik overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] rounded-lg gap-3 p-6 text-center">
          <VideoOff size={32} className="text-white/50" strokeWidth={1.5} />
          <p className="text-sm text-white/80 leading-relaxed">{cameraError}</p>
        </div>
      )}

      {/* Tayyor holat — skanerlash ko'rsatkichi (kamera markazida) */}
      {status === 'ready' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className="border-2 border-white/60 rounded"
            style={{ width: 240, height: 240 }}
          />
        </div>
      )}
    </div>
  )
}
