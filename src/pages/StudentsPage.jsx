import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../lib/studentsApi'
import { getGroups } from '../lib/groupsApi'
import Loading from '../components/Loading'
import ConfirmModal from '../components/ConfirmModal'
import StudentModal from '../components/StudentModal'

export default function StudentsPage() {
  const { user } = useAuth()

  const [students, setStudents] = useState([])
  const [groups,   setGroups]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  // Qidiruv matni
  const [search, setSearch] = useState('')

  // Modal holatlari
  const [showModal,      setShowModal]      = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)

  async function loadData() {
    try {
      setError('')
      // O'quvchilar va guruhlarni bir vaqtda yuklaymiz
      const [studentsData, groupsData] = await Promise.all([
        getStudents(),
        getGroups(),
      ])
      setStudents(studentsData)
      setGroups(groupsData)
    } catch {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Real vaqtda qidiruv — ism, telefon yoki guruh nomi bo'yicha
  // useMemo — har safar qidiruv matnini o'zgarganda qayta hisoblaydi
  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return students
    return students.filter(s =>
      s.ism?.toLowerCase().includes(q) ||
      s.telefon_raqami?.toLowerCase().includes(q) ||
      s.groups?.nomi?.toLowerCase().includes(q)
    )
  }, [students, search])

  async function handleSave(studentData) {
    if (editingStudent) {
      await updateStudent(editingStudent.id, studentData)
    } else {
      await createStudent(studentData)
    }
    await loadData()
  }

  async function handleDelete() {
    try {
      await deleteStudent(deleteTarget.id)
      setDeleteTarget(null)
      await loadData()
    } catch {
      setError("O'chirishda xatolik yuz berdi.")
      setDeleteTarget(null)
    }
  }

  function openAddModal()          { setEditingStudent(null); setShowModal(true) }
  function openEditModal(student)  { setEditingStudent(student); setShowModal(true) }
  function closeModal()            { setShowModal(false); setEditingStudent(null) }

  if (loading) return <Loading text="O'quvchilar yuklanmoqda..." />

  return (
    <div>
      {/* Sarlavha va qo'shish tugmasi */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">O'quvchilar</h1>
          <p className="text-gray-500 text-sm mt-0.5">{students.length} ta o'quvchi</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        >
          <span className="text-lg">+</span>
          <span className="hidden sm:inline">Yangi o'quvchi</span>
        </button>
      </div>

      {/* Xatolik */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Qidiruv qutisi */}
      <div className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ism, telefon yoki guruh bo'yicha qidirish..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
        />
        {/* Qidiruv matnini tozalash */}
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Bo'sh holat — hech qanday o'quvchi yo'q */}
      {students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">🎓</div>
          <p className="text-gray-500 mb-4">Hali o'quvchi qo'shilmagan</p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Birinchi o'quvchini qo'shish
          </button>
        </div>

      /* Qidiruv natijasi bo'sh */
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-500">"{search}" bo'yicha hech narsa topilmadi</p>
        </div>

      ) : (
        /* O'quvchilar jadvali */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Katta ekranda jadval ko'rinishi */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ism</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefon</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Guruh</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-400">{index + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar */}
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-semibold shrink-0">
                          {student.ism?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{student.ism}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {student.telefon_raqami ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {student.groups ? (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                          {student.groups.nomi}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(student)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors text-gray-500 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors text-gray-500 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Telefon ekranida kartochka ko'rinishi */}
          <div className="sm:hidden divide-y divide-gray-50">
            {filteredStudents.map(student => (
              <div key={student.id} className="flex items-center gap-3 px-4 py-3.5">
                {/* Avatar */}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold shrink-0">
                  {student.ism?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                {/* Ma'lumotlar */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{student.ism}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {student.groups?.nomi ?? '—'}
                    {student.telefon_raqami && ` · ${student.telefon_raqami}`}
                  </p>
                </div>
                {/* Amallar */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(student)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteTarget(student)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-red-50 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Jami natijalar soni */}
          {search && (
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50 text-xs text-gray-500">
              {filteredStudents.length} ta natija topildi
            </div>
          )}
        </div>
      )}

      {/* O'quvchi qo'shish/tahrirlash modali */}
      {showModal && (
        <StudentModal
          student={editingStudent}
          groups={groups}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* O'chirish tasdiqlash */}
      {deleteTarget && (
        <ConfirmModal
          message={`"${deleteTarget.ism}" ni o'quvchilar ro'yxatidan o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

    </div>
  )
}
