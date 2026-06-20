import { useEffect, useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Search, X, GraduationCap, QrCode } from 'lucide-react'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../lib/studentsApi'
import { getGroups } from '../lib/groupsApi'
import Loading from '../components/Loading'
import ConfirmModal from '../components/ConfirmModal'
import StudentModal from '../components/StudentModal'
import QRModal from '../components/QRModal'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [groups,   setGroups]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')

  const [showModal,      setShowModal]      = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [qrStudent,      setQrStudent]      = useState(null)  // QR modal uchun

  async function loadData() {
    try {
      setError('')
      const [studentsData, groupsData] = await Promise.all([getStudents(), getGroups()])
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

  function openAddModal()         { setEditingStudent(null);    setShowModal(true) }
  function openEditModal(student) { setEditingStudent(student); setShowModal(true) }
  function closeModal()           { setShowModal(false);        setEditingStudent(null) }

  if (loading) return <Loading text="Yuklanmoqda..." />

  return (
    <div>
      {/* Sarlavha */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-[#1C1917]">O'quvchilar</h1>
          <p className="text-sm text-[#78716C] mt-0.5">{students.length} ta o'quvchi</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors rounded"
        >
          <Plus size={15} strokeWidth={2} />
          <span>Yangi o'quvchi</span>
        </button>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3.5 py-2.5 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Qidiruv */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" strokeWidth={1.75} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ism, telefon yoki guruh bo'yicha qidirish..."
          className="w-full pl-9 pr-8 py-2.5 border border-[#E7E5E4] rounded bg-white text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C] w-5 h-5 flex items-center justify-center">
            <X size={13} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Bo'sh holat */}
      {students.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-14 px-6">
          <div className="w-10 h-10 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg flex items-center justify-center mx-auto mb-3">
            <GraduationCap size={18} className="text-[#A8A29E]" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-[#1C1917] mb-1">O'quvchilar yo'q</p>
          <p className="text-sm text-[#78716C] mb-4">Birinchi o'quvchini qo'shing</p>
          <button onClick={openAddModal}
            className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded hover:bg-[#1D4ED8] transition-colors">
            O'quvchi qo'shish
          </button>
        </div>

      ) : filteredStudents.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-12 px-6">
          <p className="text-sm text-[#78716C]">
            <span className="font-medium text-[#1C1917]">"{search}"</span> bo'yicha hech narsa topilmadi
          </p>
        </div>

      ) : (
        <>
          {/* Katta ekran — jadval */}
          <div className="hidden sm:block bg-white border border-[#E7E5E4] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide w-10">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide">Ism</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide">Telefon</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide">Guruh</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#78716C] uppercase tracking-wide">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-[#FAFAF9] transition-colors">
                    <td className="px-4 py-3 text-sm text-[#A8A29E] tabular-nums">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full flex items-center justify-center text-xs font-semibold text-[#78716C] shrink-0">
                          {student.ism?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-sm font-medium text-[#1C1917]">{student.ism}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#78716C]">
                      {student.telefon_raqami ?? <span className="text-[#D4D4D0]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {student.groups ? (
                        <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded font-medium">
                          {student.groups.nomi}
                        </span>
                      ) : <span className="text-[#D4D4D0] text-sm">—</span>}
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                        <button onClick={() => setQrStudent(student)}
                          className="w-7 h-7 flex items-center justify-center rounded text-[#78716C] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors" title="QR kod">
                          <QrCode size={13} strokeWidth={1.75} />
                        </button>
                        <button onClick={() => openEditModal(student)}
                          className="w-7 h-7 flex items-center justify-center rounded text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917] transition-colors">
                          <Pencil size={13} strokeWidth={1.75} />
                        </button>
                        <button onClick={() => setDeleteTarget(student)}
                          className="w-7 h-7 flex items-center justify-center rounded text-[#78716C] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors">
                          <Trash2 size={13} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Telefon — ro'yxat */}
          <div className="sm:hidden bg-white border border-[#E7E5E4] rounded-lg divide-y divide-[#E7E5E4]">
            {filteredStudents.map((student, i) => (
              <div key={student.id}
                className={`flex items-center gap-3 px-4 py-3
                  ${i === 0 ? 'rounded-t-lg' : ''} ${i === filteredStudents.length - 1 ? 'rounded-b-lg' : ''}`}
              >
                <div className="w-8 h-8 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full flex items-center justify-center text-xs font-semibold text-[#78716C] shrink-0">
                  {student.ism?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1917] truncate">{student.ism}</p>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    {student.groups?.nomi ?? '—'}
                    {student.telefon_raqami && ` · ${student.telefon_raqami}`}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setQrStudent(student)}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#78716C] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors">
                    <QrCode size={13} strokeWidth={1.75} />
                  </button>
                  <button onClick={() => openEditModal(student)}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#78716C] hover:bg-[#F5F5F4] transition-colors">
                    <Pencil size={13} strokeWidth={1.75} />
                  </button>
                  <button onClick={() => setDeleteTarget(student)}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#78716C] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors">
                    <Trash2 size={13} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {search && (
            <p className="text-xs text-[#A8A29E] mt-2 px-1">
              {filteredStudents.length} ta natija
            </p>
          )}
        </>
      )}

      {qrStudent && (
        <QRModal student={qrStudent} onClose={() => setQrStudent(null)} />
      )}
      {showModal && (
        <StudentModal
          student={editingStudent}
          groups={groups}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
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
