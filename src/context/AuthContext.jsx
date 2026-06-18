import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Auth ma'lumotlarini butun ilovada ulashish uchun Context
const AuthContext = createContext(null)

// AuthProvider — App.jsx ichiga o'ralib, barcha sahifalarga auth holatini uzatadi
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // hozirgi foydalanuvchi
  const [loading, setLoading] = useState(true)  // sahifa ochilayotganda tekshiruv davom etmoqda

  useEffect(() => {
    // Sahifa ochilganda Supabase dan joriy sessiyani olamiz
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Supabase auth o'zgarganda (login/logout) avtomatik yangilanadi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Komponent o'chirilganda subscriberni to'xtatamiz
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth — istalgan komponentda auth ma'lumotlarini olish uchun
export function useAuth() {
  return useContext(AuthContext)
}
