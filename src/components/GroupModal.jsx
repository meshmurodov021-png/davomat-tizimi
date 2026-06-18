import { useState, useEffect } from 'react'

// Haftaning barcha kunlari — tartib bilan
const WEEK_DAYS = [
  'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba'
]

// Kun nomlarini o'zbekcha chiroyli ko'rinishda chiqarish
const DAY_LABELS = {
  dushanba:   'Dushanba',
  seshanba:   'Seshanba',
  chorshanba: 'Chorshanba',
  payshanba:  'Payshanba',
  juma:       'Juma',
  shanba:     'Shanba',
  yakshanba:  'Yakshanba',
}

// Guruh qo'shish/tahrirlash modali
// group — tahrirlash uchun mavjud guruh (yangi qo'shishda null)
export default function GroupModal({ group, onSave, onClose }) {
  // Forma maydonlari — tahrirlash bo'lsa mavjud qiymatlar bilan to'ldiramiz
  const [nomi,      setNomi]      = useState(group?.nomi      ?? '')
  const [xona,      setXona]      = useState(group?.xona      ?? '')
  const [sigimMin,  setSigimMin]  = useState(group?.sigim_min  ?? '')
  const [sigimMax,  setSigimMax]  = useState(group?.sigim_max  ?? '')
  const [vaqtBosh,  setVaqtBosh]  = useState(group?.dars_vaqti_boshlanish ?? '')
  const [vaqtTugash,setVaqtTugash]= useState(group?.dars_vaqti_tugash     ?? '')

  // Tanlangan kunlar — tahrirlashda group_days dan olamiz
  const [selectedDays, setSelectedDays] = useState(() => {
    if (group?.group_days) {
      return group.group_days.map(d => d.kun)
    }
    return []
  })

  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // Kun checkboxini bosish
  function toggleDay(day) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nomi.trim()) { setError("Guruh nomi kiritilishi shart."); return }
    if (selectedDays.length === 0) { setError("Kamida bitta dars kuni tanlanishi shart."); return }

    setError('')
    setSaving(true)

    try {
      await onSave(
        {
          nomi:                    nomi.trim(),
          xona:                    xona.trim() || null,
          sigim_min:               sigimMin ? parseInt(sigimMin) : null,
          sigim_max:               sigimMax ? parseInt(sigimMax) : null,
          dars_vaqti_boshlanish:   vaqtBosh  || null,
          dars_vaqti_tugash:       vaqtTugash || null,
        },
        selectedDays
      )
      onClose()
    } catch (err) {
      setError("Ma'lumot saqlanmadi. Qaytadan urinib ko'ring.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      {/* Modal oynasi — telefonda pastdan chiqadi, katta ekranda markazda */}
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">

        {/* Modal sarlavhasi */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            {group ? 'Guruhni tahrirlash' : 'Yangi guruh'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Xatolik */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Guruh nomi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Guruh nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nomi}
              onChange={e => setNomi(e.target.value)}
              placeholder="Masalan: Ingliz tili - 1"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Xona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Xona (ixtiyoriy)</label>
            <input
              type="text"
              value={xona}
              onChange={e => setXona(e.target.value)}
              placeholder="Masalan: 205-xona"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Dars vaqti */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Boshlanish vaqti</label>
              <input
                type="time"
                value={vaqtBosh}
                onChange={e => setVaqtBosh(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tugash vaqti</label>
              <input
                type="time"
                value={vaqtTugash}
                onChange={e => setVaqtTugash(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
          </div>

          {/* Sig'im */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min o'quvchi</label>
              <input
                type="number"
                value={sigimMin}
                onChange={e => setSigimMin(e.target.value)}
                min="1"
                placeholder="5"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max o'quvchi</label>
              <input
                type="number"
                value={sigimMax}
                onChange={e => setSigimMax(e.target.value)}
                min="1"
                placeholder="20"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
          </div>

          {/* Dars kunlari */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dars kunlari <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WEEK_DAYS.map(day => (
                <label
                  key={day}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors
                    ${selectedDays.includes(day)
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
                </label>
              ))}
            </div>
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
