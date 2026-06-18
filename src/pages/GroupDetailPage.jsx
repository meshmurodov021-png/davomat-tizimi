import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGroupById } from '../lib/groupsApi'
import { getStudentsByGroup, createStudent, updateStudent, deleteStudent } from '../lib/studentsApi'
import Loading from '../components/Loading'
import ConfirmModal from '../components/ConfirmModal'
import StudentModal from '../components/StudentModal'

// Kun nomlarini qisqa ko'rinishda chiqarish
const DAY_SHORT = {
  dushanba: 'Du', seshanba: 'Se', chorshanba: 'Ch',
  payshanba: 'Pa', juma: 'Ju', shanba: 'Sh', yakshanba: 'Ya'
}
const DAY_ORDER = ['dushanba','seshanba','chorshanba','payshanba','juma','shanba','yakshanba']

export default function GroupDetailPage() {
  // URL dan guruh ID sini olamiz: /groups/abc-123
  const { groupId } = useParams()
  const navigate    = useNavigate()

  const [group,    setGroup]    = useState(null)
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  // Modal holatlari
  const [showModal,      setShowModal]      = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)

  // Guruh va uning o'quvchilarini yuklaymiz
  async function loadData() {
    try {
      setError('')
      const [groupData, studentsData] = await Promise.all([
        getGroupById(groupId),
        getStudentsByGroup(groupId),
      ])
      setGroup(groupData)
      setStudents(studentsData)
    } catch {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [groupId])

  // O'quvchi saqlash — guruh ID avtomatik qo'shiladi
  async function handleSave(studentData) {
    if (editingStudent) {
      await updateStudent(editingStudent.id, studentData)
    } else {
      // group_id shu sahifadan keladi, modal qayta so'ramaydi
      await createStudent({ ...studentData, group_id: groupId })
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

  function openAddModal()         { setEditingStudent(null); setShowModal(true) }
  function openEditModal(student) { setEditingStudent(student); setShowModal(true) }
  function closeModal()           { setShowModal(false); setEditingStudent(null) }

  if (loading) return <Loading text="Yuklanmoqda..." />

  if (!group) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Guruh topilmadi.</p>
        <button onClick={() => navigate('/groups')} className="px-4 py-2 bg-blue-600 text-white rounded-xl">
          Guruhlar ro'yxatiga qaytish
        </button>
      </div>
    )
  }

  // Kunlarni tartib bo'yicha saralab chiqaramiz
  const sortedDays = [...(group.group_days ?? [])]
    .sort((a, b) => DAY_ORDER.indexOf(a.kun) - DAY_ORDER.indexOf(b.kun))

  // Bu guruh lockedGroup sifatida modalga uzatiladi
  const lockedGroup = { id: group.id, nomi: group.nomi }

  return (
    <div>

      {/* Orqaga qaytish tugmasi */}
      <button
        onClick={() => navigate('/groups')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors"
      >
        ← Guruhlar ro'yxatiga qaytish
      </button>

      {/* Guruh haqida ma'lumot kartochkasi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{group.nomi}</h1>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
              {group.xona && <span>🚪 {group.xona}</span>}
              {(group.dars_vaqti_boshlanish || group.dars_vaqti_tugash) && (
                <span>🕐 {group.dars_vaqti_boshlanish ?? '?'} – {group.dars_vaqti_tugash ?? '?'}</span>
              )}
              {(group.sigim_min || group.sigim_max) && (
                <span>👤 {group.sigim_min ?? '?'}–{group.sigim_max ?? '?'} o'quvchi</span>
              )}
            </div>

            {/* Dars kunlari */}
            {sortedDays.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sortedDays.map(d => (
                  <span key={d.kun} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                    {DAY_SHORT[d.kun] ?? d.kun}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* O'quvchilar soni ko'rsatkichi */}
          <div className="text-center bg-blue-50 rounded-xl px-4 py-2 shrink-0">
            <p className="text-2xl font-bold text-blue-700">{students.length}</p>
            <p className="text-xs text-blue-500">o'quvchi</p>
          </div>
        </div>
      </div>

      {/* O'quvchilar ro'yxati sarlavhasi va qo'shish tugmasi */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-700">O'quvchilar ro'yxati</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        >
          <span className="text-base">+</span>
          <span>O'quvchi qo'shish</span>
        </button>
      </div>

      {/* Xatolik */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Bo'sh holat */}
      {students.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-2">🎓</div>
          <p className="text-gray-500 mb-4">Bu guruhda hali o'quvchi yo'q</p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Birinchi o'quvchini qo'shish
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Katta ekranda jadval */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ism</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefon</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-400">{index + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-semibold shrink-0">
                          {student.ism?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{student.ism}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {student.telefon_raqami ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(student)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors text-sm"
                          title="Tahrirlash"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-red-50 transition-colors text-sm"
                          title="O'chirish"
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
            {students.map(student => (
              <div key={student.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold shrink-0">
                  {student.ism?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{student.ism}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {student.telefon_raqami ?? 'Telefon yo\'q'}
                  </p>
                </div>
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

        </div>
      )}

      {/* O'quvchi qo'shish/tahrirlash modali — guruh avtomatik shu guruh */}
      {showModal && (
        <StudentModal
          student={editingStudent}
          groups={[]}
          lockedGroup={lockedGroup}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* O'chirish tasdiqlash */}
      {deleteTarget && (
        <ConfirmModal
          message={`"${deleteTarget.ism}" ni ro'yxatdan o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

    </div>
  )
}
