import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { X, Download, Printer } from 'lucide-react'

// QR kod modal — o'quvchining shaxsiy QR kodini ko'rsatadi
// student: { id, ism, groups?: { nomi } }
export default function QRModal({ student, onClose }) {
  const canvasRef = useRef(null)
  // Canvas ID — sahifada noyob bo'lishi uchun student ID ishlatiladi
  const canvasId  = `qr-canvas-${student.id}`

  // QR kodni PNG formatida yuklab olish
  function handleDownload() {
    const canvas = document.getElementById(canvasId)
    if (!canvas) return
    const url  = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href     = url
    link.download = `${student.ism.replace(/\s+/g, '-')}-QR.png`
    link.click()
  }

  // QR kodni chop etish — yangi oyna ochadi va avtomatik print dialog chiqaradi
  function handlePrint() {
    const canvas = document.getElementById(canvasId)
    if (!canvas) return
    const imgData   = canvas.toDataURL('image/png')
    const printWin  = window.open('', '_blank', 'width=400,height=500')
    if (!printWin) {
      alert("Chop etish uchun brauzer popup-ni ruxsat eting.")
      return
    }
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${student.ism} — QR kod</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 32px; margin: 0; }
            img  { display: block; margin: 0 auto 12px; width: 260px; height: 260px; }
            h2   { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
            p    { margin: 0; font-size: 13px; color: #78716C; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="QR kod" />
          <h2>${student.ism}</h2>
          ${student.groups?.nomi ? `<p>${student.groups.nomi}</p>` : ''}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); window.close(); }, 200)
            }
          </script>
        </body>
      </html>
    `)
    printWin.document.close()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-[#E7E5E4] shadow-lg w-full max-w-xs">

        {/* Sarlavha */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E5E4]">
          <h2 className="text-sm font-semibold text-[#1C1917]">QR kod</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-[#78716C] hover:bg-[#F5F5F4] transition-colors"
          >
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>

        {/* QR kod */}
        <div className="flex flex-col items-center px-6 py-6">
          <div className="p-3 border border-[#E7E5E4] rounded-lg">
            <QRCodeCanvas
              id={canvasId}
              ref={canvasRef}
              value={student.id}   // O'quvchi UUID si — skanerlanganda shu ID qaytadi
              size={220}
              level="M"            // M = o'rtacha (H dan kam zich, kamera osonroq o'qiydi)
              marginSize={3}       // yon bo'shliq — skanerlashni osonlashtiradi
            />
          </div>

          {/* O'quvchi ismi */}
          <p className="mt-3 font-semibold text-[#1C1917] text-center">{student.ism}</p>
          {student.groups?.nomi && (
            <p className="text-xs text-[#78716C] mt-0.5">{student.groups.nomi}</p>
          )}
        </div>

        {/* Tugmalar */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#E7E5E4] text-sm font-medium text-[#1C1917] hover:bg-[#F5F5F4] transition-colors rounded"
          >
            <Download size={14} strokeWidth={1.75} />
            PNG
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#E7E5E4] text-sm font-medium text-[#1C1917] hover:bg-[#F5F5F4] transition-colors rounded"
          >
            <Printer size={14} strokeWidth={1.75} />
            Chop etish
          </button>
        </div>

      </div>
    </div>
  )
}
