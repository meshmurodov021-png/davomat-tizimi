import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../lib/authApi'
import { useAuth } from '../context/AuthContext'

// Navigatsiya linklari — bir joyda yozilgan, har ikki menyu ishlatadi
const navLinks = [
  { to: '/dashboard', label: 'Bosh sahifa', icon: '🏠' },
  { to: '/groups',    label: 'Guruhlar',    icon: '👥' },
  { to: '/students',  label: "O'quvchilar", icon: '🎓' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ---- Yuqori panel (telefon va katta ekran uchun) ---- */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">📋</span>
          </div>
          <span className="font-semibold text-gray-800 text-sm sm:text-base">Davomat tizimi</span>
        </div>

        {/* Katta ekranda navigatsiya header ichida */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Chiqish tugmasi */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span>🚪</span>
          <span className="hidden sm:inline">Chiqish</span>
        </button>
      </header>

      {/* ---- Asosiy kontent maydoni ---- */}
      <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* ---- Quyi navigatsiya (faqat telefon uchun) ---- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors
                ${isActive ? 'text-blue-600' : 'text-gray-500'}`
              }
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

    </div>
  )
}
