import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import LoginPage       from './pages/LoginPage'
import DashboardPage   from './pages/DashboardPage'
import GroupsPage      from './pages/GroupsPage'
import GroupDetailPage from './pages/GroupDetailPage'
import StudentsPage    from './pages/StudentsPage'

export default function App() {
  return (
    // AuthProvider — butun ilovaga auth holatini uzatadi
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Ochiq yo'l — login qilinmasdan kirish mumkin */}
          <Route path="/login" element={<LoginPage />} />

          {/* Himoyalangan yo'llar — faqat login qilgan foydalanuvchi kiradi */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <Layout><GroupsPage /></Layout>
              </ProtectedRoute>
            }
          />
          {/* Guruh ichidagi o'quvchilar sahifasi */}
          <Route
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <Layout><GroupDetailPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Layout><StudentsPage /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Bosh sahifadan dashboard ga yo'naltirish */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Noma'lum yo'llar ham dashboard ga ketsin */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
