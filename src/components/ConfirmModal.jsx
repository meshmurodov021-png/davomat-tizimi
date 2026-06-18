import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-[#E7E5E4] shadow-lg w-full max-w-sm p-6">

        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] flex items-center justify-center shrink-0">
            <AlertTriangle size={17} className="text-[#DC2626]" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#1C1917] text-sm mb-1">Tasdiqlash</h3>
            <p className="text-sm text-[#78716C] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm font-medium text-[#1C1917] bg-white border border-[#E7E5E4] hover:bg-[#F5F5F4] transition-colors rounded"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 text-sm font-medium text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors rounded"
          >
            O'chirish
          </button>
        </div>

      </div>
    </div>
  )
}
