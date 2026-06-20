// Telefon raqami bilan ishlash uchun yordamchi funksiyalar

// Bazaga saqlanadigan toza format: "+998901234567"
// Ko'rsatiladigan format:           "+998 90 123 45 67"

// 9 ta raqamni chiroyli formatga o'girish: "901234567" → "90 123 45 67"
function formatNineDigits(digits) {
  if (!digits) return ''
  const d = digits.slice(0, 9)
  let out = d.slice(0, 2)
  if (d.length > 2) out += ' ' + d.slice(2, 5)
  if (d.length > 5) out += ' ' + d.slice(5, 7)
  if (d.length > 7) out += ' ' + d.slice(7, 9)
  return out
}

// Bazadagi raqamni ekranda ko'rsatish uchun formatlash
// "+998901234567" → "+998 90 123 45 67"
export function formatPhoneDisplay(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '') // faqat raqamlar: "998901234567"
  if (digits.length === 12 && digits.startsWith('998')) {
    const nine = digits.slice(3) // "901234567"
    return '+998 ' + formatNineDigits(nine)
  }
  return phone // standart bo'lmasa — o'zgartirmasdan qaytarish
}

// Foydalanuvchi kiritgan qismdan faqat 9 ta raqam olib, chiroyli format
// PhoneInput komponenti uchun display qiymati
export function formatInputDisplay(nineDigits) {
  return formatNineDigits(nineDigits)
}

// To'liq raqam valid ekanini tekshirish: "+998" + 9 ta raqam
// Bo'sh qiymat ham ruxsat (ixtiyoriy maydon)
export function isValidPhone(phone) {
  if (!phone) return true
  return /^\+998\d{9}$/.test(phone)
}
