import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Pencil, Trash2, Clock, DoorOpen, QrCode, ScanFace } from 'lucide-react'
import { formatPhoneDisplay } from '../lib/phoneUtils'
import { getGroupById } from '../lib/groupsApi'
import { getStudentsByGroup, createStudent, updateStudent, deleteStudent } from '../lib/studentsApi'
import Loading from '../components/Loading'
import ConfirmModal from '../components/ConfirmModal'
import StudentModal from '../components/StudentModal'
import QRModal from '../components/QRModal'
import FaceEnrollModal from '../components/FaceEnrollModal'

const DAY_SHORT = {
  dushanba: 'Du', seshanba: 'Se', chorshanba: 'Ch',
  payshanba: 'Pa', juma: 'Ju', shanba: 'Sh', yakshanba: 'Ya'
}
const DAY_ORDER = ['dushanba','seshanba','chorshanba','payshanba','juma','shanba','yakshanba']

export default function GroupDetailPage() {
  const { groupId } = useParams()
  const navigate    = useNavigate()

  const [group,    setGroup]    = useState(null)
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const [showModal,      setShowModal]      = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [qrStudent,      setQrStudent]      = useState(null)
  const [faceStudent,    setFaceStudent]    = useState(null)

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

  async function handleSave(studentData) {
    if (editingStudent) {
      await updateStudent(editingStudent.id, studentData)
    } else {
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

  function openAddModal()         { setEditingStudent(null);    setShowModal(true) }
  function openEditModal(student) { setEditingStudent(student); setShowModal(true) }
  function closeModal()           { setShowModal(false);        setEditingStudent(null) }

  if (loading) return <Loading text="Yuklanmoqda..." />

  if (!group) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-[#78716C] mb-4">Guruh topilmadi.</p>
        <button onClick={() => navigate('/groups')}
          className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded">
          Guruhlar ro'yxatiga qaytish
        </button>
      </div>
    )
  }

  const sortedDays = [...(group.group_days ?? [])]
    .sort((a, b) => DAY_ORDER.indexOf(a.kun) - DAY_ORDER.indexOf(b.kun))

  const lockedGroup = { id: group.id, nomi: group.nomi }

  return (
    <div>
      {/* Orqaga */}
      <button
        onClick={() => navigate('/groups')}
        className="flex items-center gap-1 text-sm text-[#78716C] hover:text-[#1C1917] mb-5 transition-colors -ml-1"
      >
        <ChevronLeft size={15} strokeWidth={1.75} />
        Guruhlar ro'yxati
      </button>

      {/* Guruh info */}
      <div className="bg-white border border-[#E7E5E4] rounded-lg p-4 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-[#1C1917] mb-1.5">{group.nomi}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#78716C]">
              {group.xona && (
                <span className="flex items-center gap-1">
                  <DoorOpen size={11} strokeWidth={1.75} />{group.xona}
                </span>
              )}
              {(group.dars_vaqti_boshlanish || group.dars_vaqti_tugash) && (
                <span className="flex items-center gap-1">
                  <Clock size={11} strokeWidth={1.75} />
                  {group.dars_vaqti_boshlanish ?? '?'} – {group.dars_vaqti_tugash ?? '?'}
                </span>
              )}
            </div>
            {sortedDays.length > 0 && (
              <div className="flex gap-1 mt-2">
                {sortedDays.map(d => (
                  <span key={d.kun}
                    className="text-[11px] bg-[#EFF6FF] text-[#2563EB] px-1.5 py-0.5 rounded font-medium">
                    {DAY_SHORT[d.kun]}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* O'quvchilar soni */}
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-[#1C1917] tabular-nums">{students.length}</p>
            <p className="text-xs text-[#78716C]">o'quvchi</p>
          </div>
        </div>
      </div>

      {/* O'quvchilar sarlavhasi */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
          O'quvchilar ro'yxati
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-xs font-medium hover:bg-[#1D4ED8] transition-colors rounded"
        >
          <Plus size={13} strokeWidth={2} />
          O'quvchi qo'shish
        </button>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3.5 py-2.5 mb-3 text-sm">
          {error}
        </div>
      )}

      {/* Bo'sh holat */}
      {students.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-12 px-6">
          <p className="text-sm font-medium text-[#1C1917] mb-1">Bu guruhda o'quvchi yo'q</p>
          <p className="text-sm text-[#78716C] mb-4">Birinchi o'quvchini qo'shing</p>
          <button onClick={openAddModal}
            className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded hover:bg-[#1D4ED8] transition-colors">
            O'quvchi qo'shish
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E7E5E4] rounded-lg divide-y divide-[#E7E5E4]">
          {students.map((student, i) => (
            <div key={student.id}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF9] transition-colors
                ${i === 0 ? 'rounded-t-lg' : ''} ${i === students.length - 1 ? 'rounded-b-lg' : ''}`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full flex items-center justify-center text-xs font-semibold text-[#78716C] shrink-0">
                {student.ism?.charAt(0)?.toUpperCase() ?? '?'}
              </div>

              {/* Ma'lumotlar */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1C1917] truncate">{student.ism}</p>
                {student.telefon_raqami && (
                  <p className="text-xs text-[#78716C] mt-0.5">{formatPhoneDisplay(student.telefon_raqami)}</p>
                )}
              </div>

              {/* Tartib raqami */}
              <span className="text-xs text-[#A8A29E] tabular-nums w-5 text-right shrink-0">
                {i + 1}
              </span>

              {/* Amallar */}
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setFaceStudent(student)}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors
                    ${student.face_descriptor ? 'text-[#16A34A] hover:bg-[#F0FDF4]' : 'text-[#78716C] hover:bg-[#F5F5F4]'}`}
                  title={student.face_descriptor ? "Yuz ro'yxatdan o'tgan" : "Yuzni ro'yxatdan o'tkazish"}>
                  <ScanFace size={13} strokeWidth={1.75} />
                </button>
                <button onClick={() => setQrStudent({ ...student, groups: { nomi: group?.nomi } })}
                  className="w-8 h-8 flex items-center justify-center rounded text-[#78716C] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                  title="QR kod">
                  <QrCode size={13} strokeWidth={1.75} />
                </button>
                <button onClick={() => openEditModal(student)}
                  className="w-8 h-8 flex items-center justify-center rounded text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917] transition-colors"
                  title="Tahrirlash">
                  <Pencil size={13} strokeWidth={1.75} />
                </button>
                <button onClick={() => setDeleteTarget(student)}
                  className="w-8 h-8 flex items-center justify-center rounded text-[#78716C] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                  title="O'chirish">
                  <Trash2 size={13} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {faceStudent && (
        <FaceEnrollModal
          student={faceStudent}
          onClose={() => setFaceStudent(null)}
          onSaved={loadData}
        />
      )}
      {qrStudent && (
        <QRModal student={qrStudent} onClose={() => setQrStudent(null)} />
      )}
      {showModal && (
        <StudentModal
          student={editingStudent}
          groups={[]}
          lockedGroup={lockedGroup}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
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
