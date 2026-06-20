import { supabase } from './supabase'

// Bitta guruhning muayyan kундagi davomat yozuvlarini olish
// studentIds — shu guruhning o'quvchi IDlari ro'yxati
export async function getAttendanceByGroup(studentIds, date) {
  if (!studentIds || studentIds.length === 0) return []

  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .in('student_id', studentIds)
    .eq('sana', date)

  if (error) throw new Error(error.message)
  return data ?? []
}

// Davomatni saqlash yoki yangilash
// Avval shu guruhning bugungi yozuvlarini o'chirib, yangilarini yozadi
// records: [{ student_id, sana, vaqt, holat, tugri_kunmi }]
export async function saveAttendance(studentIds, date, records) {
  // 1. Eski yozuvlarni o'chirish (agar mavjud bo'lsa)
  if (studentIds.length > 0) {
    const { error: delError } = await supabase
      .from('attendance_logs')
      .delete()
      .in('student_id', studentIds)
      .eq('sana', date)

    if (delError) throw new Error(delError.message)
  }

  // 2. Yangi yozuvlarni kiritish (faqat belgilangan o'quvchilar)
  if (records.length > 0) {
    const { error } = await supabase
      .from('attendance_logs')
      .insert(records)

    if (error) throw new Error(error.message)
  }
}
