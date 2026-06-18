import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getGroups, createGroup, updateGroup, deleteGroup } from '../lib/groupsApi'
import Loading from '../components/Loading'
import ConfirmModal from '../components/ConfirmModal'
import GroupModal from '../components/GroupModal'

// Kun nomlarini qisqa ko'rinishda chiqarish
const DAY_SHORT = {
  dushanba: 'Du', seshanba: 'Se', chorshanba: 'Ch',
  payshanba: 'Pa', juma: 'Ju', shanba: 'Sh', yakshanba: 'Ya'
}

// Kunlar tartib bo'yicha saralash uchun
const DAY_ORDER = ['dushanba','seshanba','chorshanba','payshanba','juma','shanba','yakshanba']

export default function GroupsPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [groups,  setGroups]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Modal holatlari
  const [showModal,    setShowModal]    = useState(false)  // qo'shish/tahrirlash modali
  const [editingGroup, setEditingGroup] = useState(null)   // tahrirlash uchun tanlangan guruh
  const [deleteTarget, setDeleteTarget] = useState(null)   // o'chirish uchun tanlangan guruh

  // Guruhlarni bazadan yuklaymiz
  async function loadGroups() {
    try {
      setError('')
      const data = await getGroups()
      setGroups(data)
    } catch {
      setError("Guruhlarni yuklashda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadGroups() }, [])

  // Yangi guruh qo'shish yoki mavjudini tahrirlash
  async function handleSave(groupData, days) {
    if (editingGroup) {
      await updateGroup(editingGroup.id, groupData, days)
    } else {
      // RLS uchun teacher_id ni qo'shamiz — faqat shu o'qituvchi ko'ra olsin
      await createGroup({ ...groupData, teacher_id: user.id }, days)
    }
    await loadGroups() // Ro'yxatni yangilaymiz
  }

  // Guruhni o'chirish
  async function handleDelete() {
    try {
      await deleteGroup(deleteTarget.id)
      setDeleteTarget(null)
      await loadGroups()
    } catch {
      setError("O'chirishda xatolik yuz berdi.")
      setDeleteTarget(null)
    }
  }

  function openAddModal()        { setEditingGroup(null); setShowModal(true) }
  function openEditModal(group)  { setEditingGroup(group); setShowModal(true) }
  function closeModal()          { setShowModal(false); setEditingGroup(null) }

  if (loading) return <Loading text="Guruhlar yuklanmoqda..." />

  return (
    <div>
      {/* Sarlavha va qo'shish tugmasi */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Guruhlar</h1>
          <p className="text-gray-500 text-sm mt-0.5">{groups.length} ta guruh</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        >
          <span className="text-lg">+</span>
          <span className="hidden sm:inline">Yangi guruh</span>
        </button>
      </div>

      {/* Xatolik xabari */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Bo'sh holat */}
      {groups.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-gray-500 mb-4">Hali guruh qo'shilmagan</p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Birinchi guruhni qo'shish
          </button>
        </div>
      ) : (
        /* Guruhlar ro'yxati */
        <div className="space-y-3">
          {groups.map(group => {
            // Kunlarni tartib bo'yicha saralab chiqaramiz
            const sortedDays = [...(group.group_days ?? [])]
              .sort((a, b) => DAY_ORDER.indexOf(a.kun) - DAY_ORDER.indexOf(b.kun))

            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all"
              >
                <div className="flex items-center gap-3 p-4">

                  {/* Bosish maydoni — guruh detail sahifasiga o'tadi */}
                  <button
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-gray-800 text-base truncate">
                        {group.nomi}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                        → ko'rish
                      </span>
                    </div>

                    {/* Qo'shimcha ma'lumotlar */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                      {group.xona && (
                        <span>🚪 {group.xona}</span>
                      )}
                      {(group.dars_vaqti_boshlanish || group.dars_vaqti_tugash) && (
                        <span>
                          🕐 {group.dars_vaqti_boshlanish ?? '?'} – {group.dars_vaqti_tugash ?? '?'}
                        </span>
                      )}
                      {(group.sigim_min || group.sigim_max) && (
                        <span>👤 {group.sigim_min ?? '?'}–{group.sigim_max ?? '?'} o'quvchi</span>
                      )}
                    </div>

                    {/* Dars kunlari */}
                    {sortedDays.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {sortedDays.map(d => (
                          <span
                            key={d.kun}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {DAY_SHORT[d.kun] ?? d.kun}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>

                  {/* Amallar tugmalari — alohida, kartochkani bosishni to'xtatadi */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); openEditModal(group) }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors text-gray-500"
                      title="Tahrirlash"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteTarget(group) }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors text-gray-500"
                      title="O'chirish"
                    >
                      🗑️
                    </button>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Guruh qo'shish/tahrirlash modali */}
      {showModal && (
        <GroupModal
          group={editingGroup}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* O'chirish tasdiqlash modali */}
      {deleteTarget && (
        <ConfirmModal
          message={`"${deleteTarget.nomi}" guruhini o'chirsangiz, uning barcha o'quvchilari ham o'chib ketadi. Rostdan ham o'chirmoqchimisiz?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

    </div>
  )
}
