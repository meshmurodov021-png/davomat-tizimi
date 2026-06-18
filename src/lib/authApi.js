import { supabase } from './supabase'

// Login — email va parol orqali tizimga kirish
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

// Logout — tizimdan chiqish
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}
