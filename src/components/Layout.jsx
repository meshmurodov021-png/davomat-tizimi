import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, GraduationCap, LogOut } from 'lucide-react'
import { logout } from '../lib/authApi'

const navLinks = [
  { to: '/dashboard', label: 'Bosh sahifa', Icon: LayoutDashboard },
  { to: '/groups',    label: 'Guruhlar',    Icon: Users },
  { to: '/students',  label: "O'quvchilar", Icon: GraduationCap },
]

export default function Layout({ children }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">

      {/* Yuqori panel */}
      <header className="bg-white border-b border-[#E7E5E4] px-4 h-14 flex items-center justify-between sticky top-0 z-40">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#2563EB] rounded flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="font-semibold text-[#1C1917] text-sm tracking-tight">Davomat tizimi</span>
        </div>

        {/* Katta ekranda navigatsiya */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4]'}`
              }
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Chiqish */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#78716C] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
        >
          <LogOut size={15} strokeWidth={1.75} />
          <span className="hidden sm:inline">Chiqish</span>
        </button>
      </header>

      {/* Kontent */}
      <main className="flex-1 px-4 py-6 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        {children}
      </main>

      {/* Quyi navigatsiya — faqat telefon */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7E5E4] z-40">
        <div className="flex">
          {navLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors
                ${isActive ? 'text-[#2563EB]' : 'text-[#78716C]'}`
              }
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

    </div>
  )
}
