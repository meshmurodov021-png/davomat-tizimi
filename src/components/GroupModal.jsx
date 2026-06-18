import { useState } from 'react'
import { X } from 'lucide-react'

const WEEK_DAYS = ['dushanba','seshanba','chorshanba','payshanba','juma','shanba','yakshanba']
const DAY_LABELS = {
  dushanba: 'Du', seshanba: 'Se', chorshanba: 'Ch',
  payshanba: 'Pa', juma: 'Ju', shanba: 'Sh', yakshanba: 'Ya',
}
const DAY_FULL = {
  dushanba: 'Dushanba', seshanba: 'Seshanba', chorshanba: 'Chorshanba',
  payshanba: 'Payshanba', juma: 'Juma', shanba: 'Shanba', yakshanba: 'Yakshanba',
}

// Forma maydoni uchun yordamchi komponent
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

const inputClass = "w-full px-3 py-2.5 border border-[#E7E5E4] rounded bg-white text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"

export default function GroupModal({ group, onSave, onClose }) {
  const [nomi,       setNomi]       = useState(group?.nomi                    ?? '')
  const [xona,       setXona]       = useState(group?.xona                    ?? '')
  const [sigimMin,   setSigimMin]   = useState(group?.sigim_min               ?? '')
  const [sigimMax,   setSigimMax]   = useState(group?.sigim_max               ?? '')
  const [vaqtBosh,   setVaqtBosh]   = useState(group?.dars_vaqti_boshlanish   ?? '')
  const [vaqtTugash, setVaqtTugash] = useState(group?.dars_vaqti_tugash       ?? '')
  const [selectedDays, setSelectedDays] = useState(
    () => group?.group_days?.map(d => d.kun) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function toggleDay(day) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nomi.trim())            { setError("Guruh nomi kiritilishi shart.");          return }
    if (selectedDays.length === 0) { setError("Kamida bitta dars kuni tanlanishi shart."); return }
    setError('')
    setSaving(true)
    try {
      await onSave(
        {
          nomi:                  nomi.trim(),
          xona:                  xona.trim() || null,
          sigim_min:             sigimMin ? parseInt(sigimMin) : null,
          sigim_max:             sigimMax ? parseInt(sigimMax) : null,
          dars_vaqti_boshlanish: vaqtBosh   || null,
          dars_vaqti_tugash:     vaqtTugash || null,
        },
        selectedDays
      )
      onClose()
    } catch {
      setError("Ma'lumot saqlanmadi. Qaytadan urinib ko'ring.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-lg sm:rounded-lg border border-[#E7E5E4] shadow-lg max-h-[92vh] flex flex-col">

        {/* Sarlavha */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E5E4] shrink-0">
          <h2 className="text-sm font-semibold text-[#1C1917]">
            {group ? 'Guruhni tahrirlash' : 'Yangi guruh'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded text-[#78716C] hover:bg-[#F5F5F4] transition-colors">
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-5 space-y-4">

            {error && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <Field label="Guruh nomi" required>
              <input type="text" value={nomi} onChange={e => setNomi(e.target.value)}
                placeholder="Masalan: Ingliz tili — 1-guruh" className={inputClass} />
            </Field>

            <Field label="Xona">
              <input type="text" value={xona} onChange={e => setXona(e.target.value)}
                placeholder="205-xona" className={inputClass} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Boshlanish">
                <input type="time" value={vaqtBosh} onChange={e => setVaqtBosh(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Tugash">
                <input type="time" value={vaqtTugash} onChange={e => setVaqtTugash(e.target.value)} className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Min o'quvchi">
                <input type="number" value={sigimMin} onChange={e => setSigimMin(e.target.value)}
                  min="1" placeholder="5" className={inputClass} />
              </Field>
              <Field label="Max o'quvchi">
                <input type="number" value={sigimMax} onChange={e => setSigimMax(e.target.value)}
                  min="1" placeholder="20" className={inputClass} />
              </Field>
            </div>

            <Field label="Dars kunlari" required>
              <div className="grid grid-cols-4 gap-1.5">
                {WEEK_DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    title={DAY_FULL[day]}
                    className={`py-2 text-xs font-medium border transition-colors rounded
                      ${selectedDays.includes(day)
                        ? 'bg-[#2563EB] border-[#2563EB] text-white'
                        : 'bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#2563EB]/40'}`}
                  >
                    {DAY_LABELS[day]}
                  </button>
                ))}
              </div>
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
    </div>
  )
}
