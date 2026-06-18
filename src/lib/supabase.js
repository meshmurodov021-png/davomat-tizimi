import { createClient } from '@supabase/supabase-js'

// Supabase bilan ulanish uchun muhit o'zgaruvchilari
// Bu qiymatlarni .env faylidan o'qiydi (Vite VITE_ prefiksi talab qiladi)
// Supabase loyihasini yaratgandan so'ng .env faylga o'z kalitlaringizni kiriting
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase client — butun loyiha davomida shu obyekt orqali baza bilan ishlanadi
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
