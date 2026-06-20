import { useEffect, useRef, useState } from 'react'
import { X, Camera, CheckCircle2, AlertTriangle, Loader2, UserCheck } from 'lucide-react'
import { loadFaceModels, detectFaceDescriptor, serializeDescriptor } from '../lib/faceApi'
import { updateFaceDescriptor } from '../lib/studentsApi'

// Yuz ro'yxatdan o'tkazish modali
// student: { id, ism }
// onClose: modalni yopish
// onSaved: saqlangandan keyin — ro'yxatni yangilash uchun
export default function FaceEnrollModal({ student, onClose, onSaved }) {
  const videoRef  = useRef(null)
  const streamRef = useRef(null)

  // phase: 'models' | 'camera' | 'ready' | 'detecting' | 'success' | 'cam_error' | 'model_error'
  const [phase,   setPhase]   = useState('models')
  const [errMsg,  setErrMsg]  = useState('')
  const [faceBox, setFaceBox] = useState(null)  // aniqlanadigan yuz doirasi ko'rsatkichi

  useEffect(() => {
    initAll()
    return () => stopStream()
  }, [])

  async function initAll() {
    // 1. Modellarni yuklaymiz
    setPhase('models')
    try {
      await loadFaceModels()
    } catch (err) {
      setPhase('model_error')
      setErrMsg("Model fayllari topilmadi. public/models/ papkasini tekshiring.")
      return
    }

    // 2. Old kamerani ochamiz (yuzni ro'yxatdan o'tkazish uchun)
    setPhase('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setPhase('ready')
    } catch (err) {
      const msg = err?.name ?? ''
      setPhase('cam_error')
      if (msg === 'NotAllowedError' || msg === 'PermissionDeniedError') {
        setErrMsg("Kameraga ruxsat berilmagan. Brauzer sozlamalarini tekshiring.")
      } else if (msg === 'NotFoundError') {
        setErrMsg("Kamera topilmadi.")
      } else {
        setErrMsg("Kamera ochilmadi: " + (err?.message ?? msg))
      }
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  // Suratga olish va yuz aniqlash
  async function handleCapture() {
    if (!videoRef.current || phase !== 'ready') return
    setPhase('detecting')
    setErrMsg('')
    setFaceBox(null)

    try {
      const descriptor = await detectFaceDescriptor(videoRef.current)

      if (!descriptor) {
        // Yuz topilmadi
        setPhase('ready')
        setErrMsg("Yuz aniqlanmadi. O'quvchini kamera oldiga to'g'ri turib turing va qaytadan urining.")
        return
      }

      // Yuz topildi — bazaga saqlaymiz
      const json = serializeDescriptor(descriptor)
      await updateFaceDescriptor(student.id, json)

      stopStream()
      setPhase('success')

      // 1.8 sekunddan keyin modalni yopamiz
      setTimeout(() => {
        onSaved()
        onClose()
      }, 1800)

    } catch (err) {
      setPhase('ready')
      setErrMsg("Xatolik: " + (err?.message ?? String(err)))
    }
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-lg sm:rounded-lg border border-[#E7E5E4] shadow-lg">

        {/* Sarlavha */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E5E4]">
          <div>
            <h2 className="text-sm font-semibold text-[#1C1917]">Yuzni ro'yxatdan o'tkazish</h2>
            <p className="text-xs text-[#78716C] mt-0.5">{student.ism}</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-[#78716C] hover:bg-[#F5F5F4] transition-colors">
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* ─── Modellar yuklanmoqda ─── */}
          {phase === 'models' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={28} className="text-[#2563EB] animate-spin" strokeWidth={1.5} />
              <p className="text-sm font-medium text-[#1C1917]">AI modellari yuklanmoqda...</p>
              <p className="text-xs text-[#78716C] text-center max-w-xs">
                Birinchi marta ~5-10 soniya ketishi mumkin. Keyingi marta tezroq ochiladi.
              </p>
            </div>
          )}

          {/* ─── Kamera ochilmoqda ─── */}
          {phase === 'camera' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={28} className="text-[#2563EB] animate-spin" strokeWidth={1.5} />
              <p className="text-sm text-[#78716C]">Kamera ochilmoqda...</p>
            </div>
          )}

          {/* ─── Kamera oynasi (ready | detecting) ─── */}
          {(phase === 'ready' || phase === 'detecting') && (
            <div className="space-y-3">
              {/* Ko'rsatma */}
              <p className="text-xs text-[#78716C] text-center">
                O'quvchini kamera oldiga to'g'ri yuzlashtirib turing, keyin tugmani bosing
              </p>

              {/* Video + oval guide */}
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  className="w-full block"
                  muted
                  playsInline
                  style={{ transform: 'scaleX(-1)' }}  // mirror — o'zini ko'rish qulay
                />

                {/* Oval yuz yo'naltiruvchi */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="border-2 border-white/70 rounded-full"
                    style={{ width: 160, height: 200 }}
                  />
                </div>

                {/* Aniqlash davom etayotgan overlay */}
                {phase === 'detecting' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 size={32} className="text-white animate-spin mx-auto mb-2" strokeWidth={1.5} />
                      <p className="text-white text-sm">Yuz aniqlanmoqda...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Xato xabari */}
              {errMsg && (
                <div className="flex items-start gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded px-3 py-2">
                  <AlertTriangle size={14} className="text-[#DC2626] mt-0.5 shrink-0" strokeWidth={1.75} />
                  <p className="text-sm text-[#DC2626]">{errMsg}</p>
                </div>
              )}

              {/* Suratga olish tugmasi */}
              <button
                onClick={handleCapture}
                disabled={phase === 'detecting'}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
              >
                <Camera size={16} strokeWidth={1.75} />
                {phase === 'detecting' ? 'Aniqlanmoqda...' : 'Suratga olish'}
              </button>
            </div>
          )}

          {/* ─── Muvaffaqiyat ─── */}
          {phase === 'success' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center">
                <UserCheck size={32} className="text-[#16A34A]" strokeWidth={1.5} />
              </div>
              <p className="text-base font-semibold text-[#1C1917]">Yuz muvaffaqiyatli saqlandi!</p>
              <p className="text-sm text-[#78716C]">{student.ism}</p>
            </div>
          )}

          {/* ─── Xatolik holatlari ─── */}
          {(phase === 'cam_error' || phase === 'model_error') && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-full flex items-center justify-center">
                <AlertTriangle size={22} className="text-[#DC2626]" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-medium text-[#1C1917]">
                {phase === 'model_error' ? 'Model fayllari topilmadi' : 'Kamera xatosi'}
              </p>
              <p className="text-sm text-[#78716C] max-w-xs">{errMsg}</p>
              {phase === 'cam_error' && (
                <button
                  onClick={initAll}
                  className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded hover:bg-[#1D4ED8] transition-colors"
                >
                  Qaytadan urinish
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
