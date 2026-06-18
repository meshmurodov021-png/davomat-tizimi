import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getGroupsCount } from '../lib/groupsApi'
import { getStudentsCount } from '../lib/studentsApi'
import Loading from '../components/Loading'

// Statistika kartochkasi komponenti
function StatCard({ icon, label, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left`}
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-3`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-800 mb-1">
        {value ?? '—'}
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </button>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [groupsCount, setGroupsCount]     = useState(null)
  const [studentsCount, setStudentsCount] = useState(null)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')

  useEffect(() => {
    async function loadStats() {
      try {
        // Ikkala so'rovni bir vaqtda yuboramiz — tezroq ishlaydi
        const [groups, students] = await Promise.all([
          getGroupsCount(),
          getStudentsCount(),
        ])
        setGroupsCount(groups)
        setStudentsCount(students)
      } catch (err) {
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi.")
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) return <Loading text="Statistika yuklanmoqda..." />

  return (
    <div>
      {/* Sarlavha */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bosh sahifa</h1>
        <p className="text-gray-500 text-sm mt-1">
          Xush kelibsiz! 👋
        </p>
      </div>

      {/* Xatolik xabari */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Statistika kartochkalari */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          icon="👥"
          label="Jami guruhlar"
          value={groupsCount}
          color="bg-blue-100"
          onClick={() => navigate('/groups')}
        />
        <StatCard
          icon="🎓"
          label="Jami o'quvchilar"
          value={studentsCount}
          color="bg-green-100"
          onClick={() => navigate('/students')}
        />
      </div>

      {/* Tezkor havolalar */}
      <h2 className="text-base font-semibold text-gray-700 mb-3">Tezkor havolalar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/groups')}
          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl shrink-0">
            👥
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">Guruhlarni boshqarish</p>
            <p className="text-xs text-gray-500">Qo'shish, tahrirlash, o'chirish</p>
          </div>
          <span className="ml-auto text-gray-300">›</span>
        </button>

        <button
          onClick={() => navigate('/students')}
          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all text-left"
        >
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-xl shrink-0">
            🎓
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">O'quvchilarni boshqarish</p>
            <p className="text-xs text-gray-500">Qo'shish, qidirish, tahrirlash</p>
          </div>
          <span className="ml-auto text-gray-300">›</span>
        </button>
      </div>

    </div>
  )
}
