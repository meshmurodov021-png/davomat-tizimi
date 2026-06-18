import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, ChevronRight, Clock, DoorOpen, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getGroups, createGroup, updateGroup, deleteGroup } from '../lib/groupsApi'
import Loading from '../components/Loading'
import ConfirmModal from '../components/ConfirmModal'
import GroupModal from '../components/GroupModal'

const DAY_SHORT = {
  dushanba: 'Du', seshanba: 'Se', chorshanba: 'Ch',
  payshanba: 'Pa', juma: 'Ju', shanba: 'Sh', yakshanba: 'Ya'
}
const DAY_ORDER = ['dushanba','seshanba','chorshanba','payshanba','juma','shanba','yakshanba']

export default function GroupsPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [groups,       setGroups]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [showModal,    setShowModal]    = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function loadGroups() {
    try {
      setError('')
      setGroups(await getGroups())
    } catch {
      setError("Guruhlarni yuklashda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadGroups() }, [])

  async function handleSave(groupData, days) {
    if (editingGroup) {
      await updateGroup(editingGroup.id, groupData, days)
    } else {
      await createGroup({ ...groupData, teacher_id: user.id }, days)
    }
    await loadGroups()
  }

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

  function openAddModal()       { setEditingGroup(null);  setShowModal(true) }
  function openEditModal(group) { setEditingGroup(group); setShowModal(true) }
  function closeModal()         { setShowModal(false);    setEditingGroup(null) }

  if (loading) return <Loading text="Yuklanmoqda..." />

  return (
    <div>
      {/* Sarlavha */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[#1C1917]">Guruhlar</h1>
          <p className="text-sm text-[#78716C] mt-0.5">{groups.length} ta guruh</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors rounded"
        >
          <Plus size={15} strokeWidth={2} />
          <span>Yangi guruh</span>
        </button>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3.5 py-2.5 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Bo'sh holat */}
      {groups.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-14 px-6">
          <div className="w-10 h-10 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users size={18} className="text-[#A8A29E]" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-[#1C1917] mb-1">Guruhlar yo'q</p>
          <p className="text-sm text-[#78716C] mb-4">Birinchi guruhni qo'shib boshlang</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors rounded"
          >
            Guruh qo'shish
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E7E5E4] rounded-lg divide-y divide-[#E7E5E4]">
          {groups.map((group, i) => {
            const sortedDays = [...(group.group_days ?? [])]
              .sort((a, b) => DAY_ORDER.indexOf(a.kun) - DAY_ORDER.indexOf(b.kun))

            return (
              <div
                key={group.id}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAF9] transition-colors
                  ${i === 0 ? 'rounded-t-lg' : ''} ${i === groups.length - 1 ? 'rounded-b-lg' : ''}`}
              >
                {/* Kliklanadigan qism */}
                <button
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-medium text-[#1C1917] truncate mb-1">{group.nomi}</p>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#78716C]">
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

                  {/* Kun taglari */}
                  {sortedDays.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {sortedDays.map(d => (
                        <span key={d.kun}
                          className="text-[11px] bg-[#EFF6FF] text-[#2563EB] px-1.5 py-0.5 rounded font-medium">
                          {DAY_SHORT[d.kun]}
                        </span>
                      ))}
                    </div>
                  )}
                </button>

                {/* Amallar */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); openEditModal(group) }}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917] transition-colors"
                    title="Tahrirlash"
                  >
                    <Pencil size={14} strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteTarget(group) }}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#78716C] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                  </button>
                  <ChevronRight size={14} className="text-[#D4D4D0] ml-1" strokeWidth={1.75} />
                </div>

              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <GroupModal group={editingGroup} onSave={handleSave} onClose={closeModal} />
      )}
      {deleteTarget && (
        <ConfirmModal
          message={`"${deleteTarget.nomi}" guruhini o'chirsangiz, uning barcha o'quvchilari ham o'chib ketadi.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
