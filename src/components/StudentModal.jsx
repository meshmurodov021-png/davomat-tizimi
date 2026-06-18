import { useState } from 'react'
import { X } from 'lucide-react'

const inputClass = "w-full px-3 py-2.5 border border-[#E7E5E4] rounded bg-white text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#78716C] uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// lockedGroup — { id, nomi } — guruh detail sahifasidan ochilganda guruh o'zgartirib bo'lmaydi
export default function StudentModal({ student, groups, lockedGroup, onSave, onClose }) {
  const [ism,           setIsm]           = useState(student?.ism            ?? '')
  const [telefon,       setTelefon]       = useState(student?.telefon_raqami ?? '')
  const [selectedGroup, setSelectedGroup] = useState(lockedGroup?.id ?? student?.group_id ?? '')

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!ism.trim())    { setError("Ism kiritilishi shart.");   return }
    if (!selectedGroup) { setError("Guruh tanlanishi shart."); return }
    setError('')
    setSaving(true)
    try {
      await onSave({
        ism:            ism.trim(),
        telefon_raqami: telefon.trim() || null,
        group_id:       selectedGroup,
      })
      onClose()
    } catch {
      setError("Ma'lumot saqlanmadi. Qaytadan urinib ko'ring.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-lg sm:rounded-lg border border-[#E7E5E4] shadow-lg">

        {/* Sarlavha */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E5E4]">
          <h2 className="text-sm font-semibold text-[#1C1917]">
            {student ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}
          </h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-[#78716C] hover:bg-[#F5F5F4] transition-colors">
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <Field label="Ism va familiya" required>
            <input type="text" value={ism} onChange={e => setIsm(e.target.value)}
              placeholder="Alisher Nazarov" className={inputClass} />
          </Field>

          <Field label="Telefon raqami">
            <input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)}
              placeholder="+998 90 123 45 67" className={inputClass} />
          </Field>

          <Field label="Guruh" required>
            {lockedGroup ? (
              // Guruh o'zgartirib bo'lmaydi — faqat ko'rsatiladi
              <div className="w-full px-3 py-2.5 border border-[#E7E5E4] rounded bg-[#F5F5F4] text-sm text-[#78716C] flex items-center justify-between">
                <span className="text-[#1C1917] font-medium">{lockedGroup.nomi}</span>
                <span className="text-xs text-[#A8A29E]">avtomatik</span>
              </div>
            ) : (
              <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                className={inputClass}>
                <option value="">— Guruhni tanlang —</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.nomi}</option>
                ))}
              </select>
            )}
          </Field>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#1C1917] bg-white border border-[#E7E5E4] hover:bg-[#F5F5F4] transition-colors rounded">
              Bekor qilish
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors rounded disabled:opacity-50">
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
