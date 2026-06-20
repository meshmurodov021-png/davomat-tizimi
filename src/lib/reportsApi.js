import { supabase } from './supabase'

// Hisobot uchun ma'lumotlarni olish:
// — sana oralig'idagi davomat yozuvlari
// — o'quvchilar va ularning guruhlari bilan birga
// groupId null bo'lsa — barcha guruhlar
export async function getReportData(startDate, endDate, groupId = null) {
  // 1. O'quvchilarni guruh ma'lumotlari bilan olamiz
  let q = supabase
    .from('students')
    .select('id, ism, group_id, groups(id, nomi)')
    .order('ism', { ascending: true })

  if (groupId) q = q.eq('group_id', groupId)

  const { data: students, error: studErr } = await q
  if (studErr) throw new Error(studErr.message)
  if (!students || students.length === 0) return { students: [], logs: [] }

  // 2. Shu o'quvchilarning tanlangan sana oralig'idagi davomatini olamiz
  const studentIds = students.map(s => s.id)

  const { data: logs, error: logsErr } = await supabase
    .from('attendance_logs')
    .select('student_id, sana, holat')
    .in('student_id', studentIds)
    .gte('sana', startDate)
    .lte('sana', endDate)

  if (logsErr) throw new Error(logsErr.message)

  return { students, logs: logs ?? [] }
}
