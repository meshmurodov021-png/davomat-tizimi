import { formatInputDisplay } from '../lib/phoneUtils'

// O'zbekiston telefon raqami kiritish komponenti
// value:    to'liq raqam "+998901234567" yoki "" (tashqaridan keladi)
// onChange: to'liq raqam "+998901234567" ni qaytaradi (yoki "" bo'sh bo'lsa)
export default function PhoneInput({ value, onChange, className = '' }) {
  // Tashqi value dan faqat 9 ta raqamni ajratamiz
  const nineDigits = value ? value.replace('+998', '').replace(/\D/g, '') : ''

  function handleChange(e) {
    // Faqat raqamlarni olib, 9 ta bilan cheklaymiz
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
    // Tashqariga to'liq formatda yuboramiz
    onChange(digits.length > 0 ? '+998' + digits : '')
  }

  return (
    <div className="flex overflow-hidden border border-[#E7E5E4] rounded bg-white focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:border-transparent transition">
      {/* O'zgarmaydigan prefiks */}
      <span className="flex items-center px-3 text-sm font-medium text-[#78716C] bg-[#F5F5F4] border-r border-[#E7E5E4] select-none shrink-0">
        +998
      </span>
      {/* Faqat 9 ta raqam kiritiladigan qism */}
      <input
        type="tel"
        inputMode="numeric"
        value={formatInputDisplay(nineDigits)}
        onChange={handleChange}
        placeholder="90 123 45 67"
        maxLength={12}
        className={`flex-1 px-3 py-2.5 text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none bg-transparent ${className}`}
      />
    </div>
  )
}
