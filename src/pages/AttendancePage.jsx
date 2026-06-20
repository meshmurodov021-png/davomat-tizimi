import { useEffect, useState } from 'react'
import { Check, Clock, X, CheckCircle2, BookOpen } from 'lucide-react'
import { getGroups } from '../lib/groupsApi'
import { getStudentsByGroup } from '../lib/studentsApi'
import { getAttendanceByGroup, saveAttendance } from '../lib/attendanceApi'
import Loading from '../components/Loading'

// O'zbek tili: hafta kunlari (JS getDay() → 0=yakshanba)
const UZBEK_DAYS = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba']
const DAY_LABELS  = {
  dushanba: 'Dushanba', seshanba: 'Seshanba', chorshanba: 'Chorshanba',
  payshanba: 'Payshanba', juma: 'Juma', shanba: 'Shanba', yakshanba: 'Yakshanba',
}
const MONTH_NAMES = [
  'yanvar','fevral','mart','aprel','may','iyun',
  'iyul','avgust','sentabr','oktabr','noyabr','dekabr',
]

// Davomat holatlari: DB qiymati + UI ko'rinishi
const STATUSES = [
  { value: 'keldi',      label: 'Keldi',      Icon: Check,  activeClass: 'bg-[#DCFCE7] border-[#16A34A] text-[#16A34A]' },
  { value: 'kech_keldi', label: 'Kech qoldi', Icon: Clock,  activeClass: 'bg-[#FEF9C3] border-[#CA8A04] text-[#854D0E]' },
  { value: 'kelmadi',    label: 'Kelmadi',    Icon: X,      activeClass: 'bg-[#FEE2E2] border-[#DC2626] text-[#DC2626]' },
]

// Bugungi sanani formatlash: "19-iyun, Juma"
function formatToday(date) {
  return `${date.getDate()}-${MONTH_NAMES[date.getMonth()]}, ${DAY_LABELS[UZBEK_DAYS[date.getDay()]]}`
}

// Hozirgi vaqtni HH:MM formatida olish
function getCurrentTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
}

export default function AttendancePage() {
  const today       = new Date()
  const dateStr     = today.toISOString().split('T')[0]          // YYYY-MM-DD (DB uchun)
  const todayName   = UZBEK_DAYS[today.getDay()]                  // bugungi kun nomi

  const [todayGroups,    setTodayGroups]    = useState([])
  const [selectedGroup,  setSelectedGroup]  = useState(null)
  const [students,       setStudents]       = useState([])
  // attendance: { [student_id]: 'keldi' | 'kelmadi' | 'kech_keldi' | null }
  const [attendance,     setAttendance]     = useState({})
  const [hasExisting,    setHasExisting]    = useState(false)  // bugun allaqachon saqlangan?

  const [loadingGroups,   setLoadingGroups]   = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [successMsg,      setSuccessMsg]      = useState('')
  const [error,           setError]           = useState('')

  // Sahifa ochilganda bugungi guruhlarni yuklaymiz
  useEffect(() => {
    async function loadGroups() {
      try {
        const all = await getGroups()
        // Faqat bugun dars bor guruhlarni filtrlaymiz
        const filtered = all.filter(g =>
          g.group_days?.some(d => d.kun === todayName)
        )
        setTodayGroups(filtered)
        // Agar faqat bitta guruh bo'lsa — avtomatik tanlaymiz
        if (filtered.length === 1) setSelectedGroup(filtered[0])
      } catch {
        setError("Guruhlarni yuklashda xatolik yuz berdi.")
      } finally {
        setLoadingGroups(false)
      }
    }
    loadGroups()
  }, [])

  // Guruh o'zgarganda o'quvchilar va mavjud davomatni yuklaymiz
  useEffect(() => {
    if (!selectedGroup) return
    loadStudentsAndAttendance()
  }, [selectedGroup])

  async function loadStudentsAndAttendance() {
    setLoadingStudents(true)
    setAttendance({})
    setHasExisting(false)
    setSuccessMsg('')
    setError('')
    try {
      const studentsData = await getStudentsByGroup(selectedGroup.id)
      setStudents(studentsData)

      const studentIds   = studentsData.map(s => s.id)
      const existingLogs = await getAttendanceByGroup(studentIds, dateStr)

      // Mavjud davomat bo'lsa — xaritaga joylashtiramiz (teacher ko'ra olsin)
      if (existingLogs.length > 0) {
        setHasExisting(true)
        const map = {}
        existingLogs.forEach(log => { map[log.student_id] = log.holat })
        setAttendance(map)
      }
    } catch {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.")
    } finally {
      setLoadingStudents(false)
    }
  }

  // O'quvchi holatini o'zgartirish; qayta bosilsa — olib tashlanadi
  function toggleStatus(studentId, holat) {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === holat ? null : holat,
    }))
  }

  // Hammani bir holatga belgilash (tez belgilash uchun)
  function markAll(holat) {
    const map = {}
    students.forEach(s => { map[s.id] = holat })
    setAttendance(map)
  }

  // Davomatni saqlash
  async function handleSave() {
    const markedCount = students.filter(s => attendance[s.id]).length
    if (markedCount === 0) {
      setError("Hech bir o'quvchi uchun davomat belgilanmagan.")
      return
    }

    const timeNow = getCurrentTime()
    const records = students
      .filter(s => attendance[s.id])
      .map(s => ({
        student_id:  s.id,
        sana:        dateStr,
        vaqt:        timeNow,
        holat:       attendance[s.id],
        tugri_kunmi: true,
      }))

    setSaving(true)
    setError('')
    try {
      await saveAttendance(students.map(s => s.id), dateStr, records)
      setHasExisting(true)
      const msg = hasExisting ? "Davomat yangilandi." : "Davomat saqlandi."
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch {
      setError("Saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring.")
    } finally {
      setSaving(false)
    }
  }

  // Belgilangan o'quvchilar soni
  const markedCount = students.filter(s => attendance[s.id]).length

  // ── RENDER ──────────────────────────────────────────────────────────────────

  if (loadingGroups) return <Loading text="Yuklanmoqda..." />

  return (
    <div>

      {/* Sarlavha */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-[#1C1917]">Davomat belgilash</h1>
        <p className="text-sm text-[#78716C] mt-0.5">{formatToday(today)}</p>
      </div>

      {/* Xatolik */}
      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3.5 py-2.5 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Muvaffaqiyat xabari */}
      {successMsg && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] rounded px-3.5 py-2.5 mb-4 text-sm flex items-center gap-2">
          <CheckCircle2 size={15} strokeWidth={1.75} />
          {successMsg}
        </div>
      )}

      {/* Bugun dars yo'q */}
      {todayGroups.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-14 px-6">
          <div className="w-10 h-10 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg flex items-center justify-center mx-auto mb-3">
            <BookOpen size={18} className="text-[#A8A29E]" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-[#1C1917] mb-1">Bugun dars yo'q</p>
          <p className="text-sm text-[#78716C]">
            {DAY_LABELS[todayName]} kuni uchun hech qaysi guruhda dars belgilanmagan.
          </p>
        </div>

      ) : (
        <>
          {/* Guruh tanlash — bir nechta guruh bo'lganda tabs ko'rinishida */}
          {todayGroups.length > 1 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2">
                Bugungi guruhlar
              </p>
              <div className="flex flex-wrap gap-2">
                {todayGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`px-3 py-1.5 text-sm font-medium border transition-colors rounded
                      ${selectedGroup?.id === group.id
                        ? 'bg-[#2563EB] border-[#2563EB] text-white'
                        : 'bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#2563EB]/40 hover:text-[#1C1917]'}`}
                  >
                    {group.nomi}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guruh tanlanmagan */}
          {!selectedGroup && (
            <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-10 px-6">
              <p className="text-sm text-[#78716C]">Davomatni belgilash uchun guruhni tanlang</p>
            </div>
          )}

          {/* O'quvchilar ro'yxati */}
          {selectedGroup && (
            <>
              {loadingStudents ? (
                <Loading text="O'quvchilar yuklanmoqda..." />
              ) : students.length === 0 ? (
                <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-10 px-6">
                  <p className="text-sm font-medium text-[#1C1917] mb-1">Bu guruhda o'quvchi yo'q</p>
                  <p className="text-sm text-[#78716C]">Avval o'quvchilarni qo'shing</p>
                </div>
              ) : (
                <>
                  {/* Guruh nomi + progress + tez belgilash */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-[#1C1917]">{selectedGroup.nomi}</p>
                      <p className="text-xs text-[#78716C] mt-0.5">
                        {markedCount} / {students.length} belgilandi
                        {hasExisting && (
                          <span className="ml-2 text-[#2563EB]">· Saqlangan</span>
                        )}
                      </p>
                    </div>

                    {/* Hammani bir holatga belgilash */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => markAll('keldi')}
                        className="px-2.5 py-1 text-xs font-medium border border-[#16A34A] text-[#16A34A] bg-[#F0FDF4] hover:bg-[#DCFCE7] rounded transition-colors"
                      >
                        Hammasi keldi
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-[#E7E5E4] rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                      style={{ width: students.length > 0 ? `${(markedCount / students.length) * 100}%` : '0%' }}
                    />
                  </div>

                  {/* O'quvchilar jadvali */}
                  <div className="bg-white border border-[#E7E5E4] rounded-lg divide-y divide-[#E7E5E4] mb-4">
                    {students.map((student, i) => {
                      const current = attendance[student.id] ?? null

                      return (
                        <div
                          key={student.id}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors
                            ${i === 0 ? 'rounded-t-lg' : ''}
                            ${i === students.length - 1 ? 'rounded-b-lg' : ''}
                            ${current === 'keldi'      ? 'bg-[#F0FDF4]' : ''}
                            ${current === 'kech_keldi' ? 'bg-[#FEFCE8]' : ''}
                            ${current === 'kelmadi'    ? 'bg-[#FFF5F5]' : ''}`}
                        >
                          {/* Tartib raqami + avatar */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-[#A8A29E] w-5 text-right tabular-nums">
                              {i + 1}
                            </span>
                            <div className="w-8 h-8 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full flex items-center justify-center text-xs font-semibold text-[#78716C]">
                              {student.ism?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>
                          </div>

                          {/* Ism */}
                          <p className="flex-1 text-sm font-medium text-[#1C1917] min-w-0 truncate">
                            {student.ism}
                          </p>

                          {/* Holat tugmalari */}
                          <div className="flex gap-1 shrink-0">
                            {STATUSES.map(({ value, label, Icon, activeClass }) => (
                              <button
                                key={value}
                                onClick={() => toggleStatus(student.id, value)}
                                title={label}
                                className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium border transition-colors rounded
                                  ${current === value
                                    ? activeClass
                                    : 'bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#D4D4D0]'}`}
                              >
                                <Icon size={11} strokeWidth={2} />
                                <span className="hidden sm:inline">{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Saqlash tugmasi */}
                  <div className="sticky bottom-20 md:bottom-6">
                    <button
                      onClick={handleSave}
                      disabled={saving || markedCount === 0}
                      className="w-full py-3 bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                    >
                      {saving
                        ? 'Saqlanmoqda...'
                        : hasExisting
                          ? `Davomatni yangilash (${markedCount} ta)`
                          : `Davomatni saqlash (${markedCount} ta)`}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

    </div>
  )
}
