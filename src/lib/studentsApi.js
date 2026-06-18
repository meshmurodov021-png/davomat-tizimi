import { supabase } from './supabase'

// Faqat bitta guruhga tegishli o'quvchilarni olish
export async function getStudentsByGroup(groupId) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('group_id', groupId)
    .order('yaratilgan_sana', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

// Barcha o'quvchilarni guruh ma'lumotlari bilan birga olish
export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      groups ( id, nomi )
    `)
    .order('yaratilgan_sana', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Yangi o'quvchi qo'shish
// studentData: { ism, telefon_raqami, group_id }
export async function createStudent(studentData) {
  const { data, error } = await supabase
    .from('students')
    .insert(studentData)
    .select(`*, groups ( id, nomi )`)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// O'quvchi ma'lumotlarini tahrirlash
export async function updateStudent(id, studentData) {
  const { error } = await supabase
    .from('students')
    .update(studentData)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// O'quvchini o'chirish
export async function deleteStudent(id) {
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Dashboard uchun: faqat o'quvchilar sonini olish
export async function getStudentsCount() {
  const { count, error } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })

  if (error) throw new Error(error.message)
  return count
}
