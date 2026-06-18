import { useState } from 'react'

// O'quvchi qo'shish/tahrirlash modali
// student — tahrirlash uchun mavjud o'quvchi (yangi qo'shishda null)
// groups — dropdown uchun guruhlar ro'yxati
export default function StudentModal({ student, groups, onSave, onClose }) {
  const [ism,           setIsm]           = useState(student?.ism              ?? '')
  const [telefon,       setTelefon]       = useState(student?.telefon_raqami   ?? '')
  const [selectedGroup, setSelectedGroup] = useState(student?.group_id         ?? '')

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!ism.trim())           { setError("Ism kiritilishi shart.");         return }
    if (!selectedGroup)        { setError("Guruh tanlanishi shart.");        return }

    setError('')
    setSaving(true)

    try {
      await onSave({
        ism:            ism.trim(),
        telefon_raqami: telefon.trim() || null,
        group_id:       selectedGroup,
      })
      onClose()
    } catch (err) {
      setError("Ma'lumot saqlanmadi. Qaytadan urinib ko'ring.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">

        {/* Sarlavha */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            {student ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Ism */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ism va familiya <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ism}
              onChange={e => setIsm(e.target.value)}
              placeholder="Masalan: Alisher Nazarov"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Telefon raqami (ixtiyoriy)
            </label>
            <input
              type="tel"
              value={telefon}
              onChange={e => setTelefon(e.target.value)}
              placeholder="+998901234567"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Guruh tanlash */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Guruh <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
            >
              <option value="">— Guruhni tanlang —</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.nomi}</option>
              ))}
            </select>
          </div>

          {/* Tugmalar */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
