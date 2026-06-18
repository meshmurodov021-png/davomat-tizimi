import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, GraduationCap, ChevronRight } from 'lucide-react'
import { getGroupsCount } from '../lib/groupsApi'
import { getStudentsCount } from '../lib/studentsApi'
import Loading from '../components/Loading'

function StatCard({ label, value, Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-[#E7E5E4] rounded-lg p-5 text-left hover:border-[#2563EB]/40 hover:shadow-sm transition-all"
    >
      <p className="text-3xl font-bold text-[#1C1917] mb-1 tabular-nums">
        {value ?? '—'}
      </p>
      <div className="flex items-center gap-1.5 text-sm text-[#78716C]">
        <Icon size={14} strokeWidth={1.75} />
        {label}
      </div>
    </button>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [groupsCount,   setGroupsCount]   = useState(null)
  const [studentsCount, setStudentsCount] = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')

  useEffect(() => {
    async function loadStats() {
      try {
        const [groups, students] = await Promise.all([
          getGroupsCount(),
          getStudentsCount(),
        ])
        setGroupsCount(groups)
        setStudentsCount(students)
      } catch {
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi.")
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) return <Loading text="Yuklanmoqda..." />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[#1C1917]">Bosh sahifa</h1>
        <p className="text-sm text-[#78716C] mt-0.5">Umumiy ko'rinish</p>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3.5 py-2.5 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Statistika */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard
          label="Jami guruhlar"
          value={groupsCount}
          Icon={Users}
          onClick={() => navigate('/groups')}
        />
        <StatCard
          label="Jami o'quvchilar"
          value={studentsCount}
          Icon={GraduationCap}
          onClick={() => navigate('/students')}
        />
      </div>

      {/* Tezkor havolalar */}
      <h2 className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-3">
        Tezkor o'tish
      </h2>
      <div className="bg-white border border-[#E7E5E4] rounded-lg divide-y divide-[#E7E5E4]">
        {[
          { to: '/groups',   Icon: Users,          label: 'Guruhlarni boshqarish',    sub: "Qo'shish, tahrirlash, o'chirish" },
          { to: '/students', Icon: GraduationCap,  label: "O'quvchilarni boshqarish", sub: "Qidirish, qo'shish, tahrirlash" },
        ].map(({ to, Icon, label, sub }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#F5F5F4] transition-colors first:rounded-t-lg last:rounded-b-lg"
          >
            <div className="w-8 h-8 bg-[#F5F5F4] border border-[#E7E5E4] rounded flex items-center justify-center shrink-0">
              <Icon size={15} className="text-[#78716C]" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1C1917]">{label}</p>
              <p className="text-xs text-[#78716C] mt-0.5">{sub}</p>
            </div>
            <ChevronRight size={15} className="text-[#A8A29E]" strokeWidth={1.75} />
          </button>
        ))}
      </div>
    </div>
  )
}
