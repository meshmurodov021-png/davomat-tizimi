import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

// ProtectedRoute — faqat login qilgan foydalanuvchiga ruxsat beradi
// Agar login qilinmagan bo'lsa, login sahifasiga yo'naltiradi
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Auth holati tekshirilayotganda yuklanish ko'rsatkichini chiqaramiz
  if (loading) return <Loading />

  // Login qilinmagan bo'lsa, login sahifasiga yuboramiz
  if (!user) return <Navigate to="/login" replace />

  return children
}
