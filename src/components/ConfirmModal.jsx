// O'chirish tasdiqlash modali — "Rostdan ham o'chirmoqchimisiz?" deb so'raydi
export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    // Qora shaffof fon — modal ortida sahifani yopadi
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">

        {/* Ogohlantirish belgisi */}
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">⚠️</span>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
          Tasdiqlash
        </h3>
        <p className="text-gray-500 text-center mb-6 text-sm">
          {message}
        </p>

        <div className="flex gap-3">
          {/* Bekor qilish */}
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          {/* Tasdiqlash */}
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            O'chirish
          </button>
        </div>

      </div>
    </div>
  )
}
