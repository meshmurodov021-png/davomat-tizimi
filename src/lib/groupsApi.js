import { supabase } from './supabase'

// Joriy o'qituvchiga tegishli barcha guruhlarni olish
// group_days ham birgalikda yuklanadi (nested query)
export async function getGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      group_days ( kun )
    `)
    .order('yaratilgan_sana', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Bitta guruh ma'lumotlarini ID bo'yicha olish
export async function getGroupById(id) {
  const { data, error } = await supabase
    .from('groups')
    .select(`*, group_days ( kun )`)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Yangi guruh qo'shish
// groupData: { nomi, xona, sigim_min, sigim_max, dars_vaqti_boshlanish, dars_vaqti_tugash }
// days: ['dushanba', 'chorshanba', ...] — tanlangan kunlar ro'yxati
export async function createGroup(groupData, days) {
  // Avval guruhning asosiy ma'lumotlarini saqlaymiz
  const { data: group, error } = await supabase
    .from('groups')
    .insert(groupData)
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Keyin tanlangan dars kunlarini group_days jadvaliga qo'shamiz
  if (days && days.length > 0) {
    const dayRows = days.map(kun => ({ group_id: group.id, kun }))
    const { error: daysError } = await supabase.from('group_days').insert(dayRows)
    if (daysError) throw new Error(daysError.message)
  }

  return group
}

// Guruhni tahrirlash
// Avval eski kunlarni o'chirib, yangilarini qo'shamiz
export async function updateGroup(id, groupData, days) {
  // Asosiy guruh ma'lumotlarini yangilaymiz
  const { error } = await supabase
    .from('groups')
    .update(groupData)
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Eski dars kunlarini o'chiramiz
  const { error: deleteError } = await supabase
    .from('group_days')
    .delete()
    .eq('group_id', id)

  if (deleteError) throw new Error(deleteError.message)

  // Yangi kunlarni qo'shamiz
  if (days && days.length > 0) {
    const dayRows = days.map(kun => ({ group_id: id, kun }))
    const { error: daysError } = await supabase.from('group_days').insert(dayRows)
    if (daysError) throw new Error(daysError.message)
  }
}

// Guruhni o'chirish (o'quvchilar ham kaskad o'chadi — schema.sql da ON DELETE CASCADE bor)
export async function deleteGroup(id) {
  const { error } = await supabase.from('groups').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Dashboard uchun: faqat guruhlar sonini olish
export async function getGroupsCount() {
  const { count, error } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })

  if (error) throw new Error(error.message)
  return count
}
