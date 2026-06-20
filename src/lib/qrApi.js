import { supabase } from './supabase'

// O'quvchini ID bo'yicha topish — guruh va dars kunlari bilan birga
// QR skanerlanganda o'quvchini aniqlash uchun ishlatiladi
export async function getStudentById(studentId) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      id, ism, group_id,
      groups!inner ( id, nomi, teacher_id, group_days ( kun ) )
    `)
    .eq('id', studentId)
    .single()

  // Agar topilmasa yoki RLS ruxsat bermasa — xato
  if (error) throw new Error('O\'quvchi topilmadi')
  return data
}

// QR skanerlash orqali davomatni saqlash
// tugriKunmi: bugun o'quvchining dars kuni bo'lsa true, bo'lmasa false
export async function saveQRAttendance(studentId, tugriKunmi) {
  const now     = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  // upsert: agar bugun allaqachon yozuv bo'lsa — vaqtni yangilaydi
  // (student_id + sana) unique constraint ishlatiladi
  const { error } = await supabase
    .from('attendance_logs')
    .upsert(
      {
        student_id:  studentId,
        sana:        dateStr,
        vaqt:        timeStr,
        holat:       'keldi',
        tugri_kunmi: tugriKunmi,
      },
      { onConflict: 'student_id,sana' }
    )

  if (error) throw new Error(error.message)
}

// Noto'g'ri kunda skanerlangan loglarni olish (tugri_kunmi = false)
// Faqat o'qituvchi ko'radi — RLS orqali himoyalangan
export async function getWrongDayLogs() {
  const { data, error } = await supabase
    .from('attendance_logs')
    .select(`
      id, sana, vaqt,
      students!inner (
        id, ism,
        groups!inner ( id, nomi )
      )
    `)
    .eq('tugri_kunmi', false)
    .order('sana', { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)
  return data ?? []
}
