import { useEffect, useState, useCallback } from 'react'
import { Check, Clock, X, CheckCircle2, BookOpen, QrCode, ClipboardList, History, StopCircle } from 'lucide-react'
import { getGroups } from '../lib/groupsApi'
import { getStudentsByGroup } from '../lib/studentsApi'
import { getAttendanceByGroup, saveAttendance } from '../lib/attendanceApi'
import { getStudentById, saveQRAttendance, getWrongDayLogs } from '../lib/qrApi'
import Loading from '../components/Loading'
import QRScanner from '../components/QRScanner'

// ── Umumiy yordamchi ma'lumotlar ──────────────────────────────────────────────
const UZBEK_DAYS  = ['yakshanba','dushanba','seshanba','chorshanba','payshanba','juma','shanba']
const DAY_LABELS  = { dushanba:'Dushanba', seshanba:'Seshanba', chorshanba:'Chorshanba', payshanba:'Payshanba', juma:'Juma', shanba:'Shanba', yakshanba:'Yakshanba' }
const MONTH_NAMES = ['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr']
const STATUSES    = [
  { value:'keldi',      label:'Keldi',      Icon:Check,  activeClass:'bg-[#DCFCE7] border-[#16A34A] text-[#16A34A]' },
  { value:'kech_keldi', label:'Kech qoldi', Icon:Clock,  activeClass:'bg-[#FEF9C3] border-[#CA8A04] text-[#854D0E]' },
  { value:'kelmadi',    label:'Kelmadi',    Icon:X,      activeClass:'bg-[#FEE2E2] border-[#DC2626] text-[#DC2626]' },
]

function formatToday(d) {
  return `${d.getDate()}-${MONTH_NAMES[d.getMonth()]}, ${DAY_LABELS[UZBEK_DAYS[d.getDay()]]}`
}
function fmtDate(str) {
  if (!str) return ''
  const [y,m,d] = str.split('-')
  return `${d}.${m}.${y}`
}
function getCurrentTime() {
  const n = new Date()
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
}

// ── Asosiy komponent ──────────────────────────────────────────────────────────
export default function AttendancePage() {
  const today     = new Date()
  const dateStr   = today.toISOString().split('T')[0]
  const todayName = UZBEK_DAYS[today.getDay()]

  // Umumiy
  const [mode, setMode] = useState('manual')   // 'manual' | 'qr' | 'logs'

  // ─── Qo'lda belgilash holatlari ────────────────────────────────────────────
  const [todayGroups,     setTodayGroups]     = useState([])
  const [selectedGroup,   setSelectedGroup]   = useState(null)
  const [students,        setStudents]        = useState([])
  const [attendance,      setAttendance]      = useState({})
  const [hasExisting,     setHasExisting]     = useState(false)
  const [loadingGroups,   setLoadingGroups]   = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [successMsg,      setSuccessMsg]      = useState('')
  const [manualError,     setManualError]     = useState('')

  // ─── QR skanerlash holatlari ───────────────────────────────────────────────
  const [qrScanning,  setQrScanning]  = useState(false)   // kamera ochiq/yopiq
  const [qrResults,   setQrResults]   = useState([])      // oxirgi skanerlashlar ro'yxati
  const [qrError,     setQrError]     = useState('')

  // ─── Loglar holatlari ──────────────────────────────────────────────────────
  const [logs,        setLogs]        = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [logsError,   setLogsError]   = useState('')

  // Sahifa ochilganda guruhlarni yuklaymiz
  useEffect(() => {
    async function load() {
      try {
        const all = await getGroups()
        const filtered = all.filter(g => g.group_days?.some(d => d.kun === todayName))
        setTodayGroups(filtered)
        if (filtered.length === 1) setSelectedGroup(filtered[0])
      } catch { setManualError("Guruhlarni yuklashda xatolik.") }
      finally  { setLoadingGroups(false) }
    }
    load()
  }, [])

  // Guruh o'zgarganda — o'quvchilar va mavjud davomatni yuklaymiz
  useEffect(() => {
    if (!selectedGroup) return
    loadStudentsAndAttendance()
  }, [selectedGroup])

  // Loglar tabiga o'tilganda yuklaymiz
  useEffect(() => {
    if (mode !== 'logs') return
    if (logs.length > 0) return  // allaqachon yuklangan
    loadLogs()
  }, [mode])

  async function loadStudentsAndAttendance() {
    setLoadingStudents(true)
    setAttendance({})
    setHasExisting(false)
    setSuccessMsg('')
    setManualError('')
    try {
      const studentsData = await getStudentsByGroup(selectedGroup.id)
      setStudents(studentsData)
      const ids      = studentsData.map(s => s.id)
      const existing = await getAttendanceByGroup(ids, dateStr)
      if (existing.length > 0) {
        setHasExisting(true)
        const map = {}
        existing.forEach(l => { map[l.student_id] = l.holat })
        setAttendance(map)
      }
    } catch { setManualError("Ma'lumotlarni yuklashda xatolik.") }
    finally  { setLoadingStudents(false) }
  }

  function toggleStatus(studentId, holat) {
    setAttendance(prev => ({ ...prev, [studentId]: prev[studentId] === holat ? null : holat }))
  }
  function markAll(holat) {
    const map = {}
    students.forEach(s => { map[s.id] = holat })
    setAttendance(map)
  }

  async function handleManualSave() {
    const marked = students.filter(s => attendance[s.id])
    if (marked.length === 0) { setManualError("Hech bir o'quvchi belgilanmagan."); return }
    const timeNow = getCurrentTime()
    const records = marked.map(s => ({
      student_id: s.id, sana: dateStr, vaqt: timeNow,
      holat: attendance[s.id], tugri_kunmi: true,
    }))
    setSaving(true)
    setManualError('')
    try {
      await saveAttendance(students.map(s => s.id), dateStr, records)
      setHasExisting(true)
      setSuccessMsg(hasExisting ? 'Davomat yangilandi.' : 'Davomat saqlandi.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch { setManualError("Saqlashda xatolik. Qaytadan urining.") }
    finally  { setSaving(false) }
  }

  // ── QR skanerlash ──────────────────────────────────────────────────────────
  // Har bir muvaffaqiyatli skanerlashda chaqiriladi
  const handleQRScan = useCallback(async (rawText) => {
    setQrError('')
    try {
      // O'quvchini UUID bo'yicha bazadan topamiz
      const student = await getStudentById(rawText)

      // Bugun to'g'ri kun ekanligini tekshiramiz
      const grupDays  = student.groups?.group_days ?? []
      const tugriKun  = grupDays.some(d => d.kun === todayName)

      // Davomatni saqlaymiz
      await saveQRAttendance(student.id, tugriKun)

      // Natijani ekranda ko'rsatamiz
      const newEntry = {
        id:       Date.now(),
        ism:      student.ism,
        group:    student.groups?.nomi ?? '',
        tugriKun,
        vaqt:     getCurrentTime(),
      }
      setQrResults(prev => [newEntry, ...prev.slice(0, 19)]) // oxirgi 20 ta

    } catch {
      setQrError("QR kod tanilmadi yoki o'quvchi topilmadi.")
      setTimeout(() => setQrError(''), 3000)
    }
  }, [todayName])

  // Loglarni yuklash
  async function loadLogs() {
    setLoadingLogs(true)
    setLogsError('')
    try {
      setLogs(await getWrongDayLogs())
    } catch { setLogsError("Loglarni yuklashda xatolik.") }
    finally  { setLoadingLogs(false) }
  }

  const markedCount = students.filter(s => attendance[s.id]).length

  // ── RENDER ──────────────────────────────────────────────────────────────────
  if (loadingGroups) return <Loading text="Yuklanmoqda..." />

  const tabClass = (key) =>
    `flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded transition-colors
    ${mode === key
      ? 'bg-[#2563EB] border-[#2563EB] text-white'
      : 'bg-white border-[#E7E5E4] text-[#78716C] hover:text-[#1C1917] hover:border-[#D4D4D0]'}`

  return (
    <div>
      {/* Sarlavha */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-[#1C1917]">Davomat belgilash</h1>
        <p className="text-sm text-[#78716C] mt-0.5">{formatToday(today)}</p>
      </div>

      {/* Rejim tanlash tablar */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setMode('manual')} className={tabClass('manual')}>
          <ClipboardList size={13} strokeWidth={1.75} />
          Qo'lda
        </button>
        <button onClick={() => setMode('qr')} className={tabClass('qr')}>
          <QrCode size={13} strokeWidth={1.75} />
          QR skanerlash
        </button>
        <button onClick={() => setMode('logs')} className={tabClass('logs')}>
          <History size={13} strokeWidth={1.75} />
          Loglar
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          1. QO'LDA BELGILASH
          ══════════════════════════════════════════════════════════════════ */}
      {mode === 'manual' && (
        <>
          {manualError && !successMsg && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3.5 py-2.5 mb-4 text-sm">
              {manualError}
            </div>
          )}
          {successMsg && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] rounded px-3.5 py-2.5 mb-4 text-sm flex items-center gap-2">
              <CheckCircle2 size={15} strokeWidth={1.75} />
              {successMsg}
            </div>
          )}

          {todayGroups.length === 0 ? (
            <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-14 px-6">
              <div className="w-10 h-10 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen size={18} className="text-[#A8A29E]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-[#1C1917] mb-1">Bugun dars yo'q</p>
              <p className="text-sm text-[#78716C]">{DAY_LABELS[todayName]} kuni uchun hech qaysi guruhda dars belgilanmagan.</p>
            </div>
          ) : (
            <>
              {/* Guruh tablar */}
              {todayGroups.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {todayGroups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroup(g)}
                      className={`px-3 py-1.5 text-sm font-medium border rounded transition-colors
                        ${selectedGroup?.id === g.id
                          ? 'bg-[#2563EB] border-[#2563EB] text-white'
                          : 'bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#2563EB]/40'}`}
                    >
                      {g.nomi}
                    </button>
                  ))}
                </div>
              )}

              {!selectedGroup ? (
                <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-10">
                  <p className="text-sm text-[#78716C]">Guruhni tanlang</p>
                </div>
              ) : loadingStudents ? (
                <Loading text="O'quvchilar yuklanmoqda..." />
              ) : students.length === 0 ? (
                <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-10">
                  <p className="text-sm font-medium text-[#1C1917] mb-1">Bu guruhda o'quvchi yo'q</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#78716C]">
                      <span className="font-medium text-[#1C1917]">{selectedGroup.nomi}</span>
                      &nbsp;·&nbsp;{markedCount}/{students.length} belgilandi
                      {hasExisting && <span className="text-[#2563EB] ml-2">· Saqlangan</span>}
                    </p>
                    <button
                      onClick={() => markAll('keldi')}
                      className="px-2.5 py-1 text-xs font-medium border border-[#16A34A] text-[#16A34A] bg-[#F0FDF4] hover:bg-[#DCFCE7] rounded transition-colors"
                    >
                      Hammasi keldi
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="h-1 bg-[#E7E5E4] rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                      style={{ width: `${students.length > 0 ? (markedCount/students.length)*100 : 0}%` }} />
                  </div>

                  {/* O'quvchilar */}
                  <div className="bg-white border border-[#E7E5E4] rounded-lg divide-y divide-[#E7E5E4] mb-4">
                    {students.map((student, i) => {
                      const cur = attendance[student.id] ?? null
                      return (
                        <div key={student.id}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors
                            ${i===0?'rounded-t-lg':''} ${i===students.length-1?'rounded-b-lg':''}
                            ${cur==='keldi'?'bg-[#F0FDF4]':cur==='kech_keldi'?'bg-[#FEFCE8]':cur==='kelmadi'?'bg-[#FFF5F5]':''}`}
                        >
                          <span className="text-xs text-[#A8A29E] w-5 text-right tabular-nums shrink-0">{i+1}</span>
                          <div className="w-8 h-8 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full flex items-center justify-center text-xs font-semibold text-[#78716C] shrink-0">
                            {student.ism?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <p className="flex-1 text-sm font-medium text-[#1C1917] min-w-0 truncate">{student.ism}</p>
                          <div className="flex gap-1 shrink-0">
                            {STATUSES.map(({ value, label, Icon, activeClass }) => (
                              <button key={value} onClick={() => toggleStatus(student.id, value)} title={label}
                                className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium border rounded transition-colors
                                  ${cur === value ? activeClass : 'bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#D4D4D0]'}`}>
                                <Icon size={11} strokeWidth={2} />
                                <span className="hidden sm:inline">{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Saqlash */}
                  <div className="sticky bottom-20 md:bottom-6">
                    <button onClick={handleManualSave} disabled={saving || markedCount === 0}
                      className="w-full py-3 bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors rounded disabled:opacity-40 shadow-lg">
                      {saving ? 'Saqlanmoqda...'
                        : hasExisting ? `Yangilash (${markedCount} ta)`
                        : `Saqlash (${markedCount} ta)`}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          2. QR SKANERLASH
          ══════════════════════════════════════════════════════════════════ */}
      {mode === 'qr' && (
        <div>
          {/* Kamera boshqaruv */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
              Kamera
            </p>
            {qrScanning ? (
              <button
                onClick={() => setQrScanning(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E7E5E4] text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
              >
                <StopCircle size={13} strokeWidth={1.75} />
                To'xtatish
              </button>
            ) : (
              <button
                onClick={() => setQrScanning(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-xs font-medium text-white hover:bg-[#1D4ED8] rounded transition-colors"
              >
                <QrCode size={13} strokeWidth={1.75} />
                Kamerani yoqish
              </button>
            )}
          </div>

          {/* QR Scanner */}
          {qrScanning ? (
            <div className="mb-4">
              <QRScanner onScan={handleQRScan} />
              <p className="text-xs text-[#78716C] text-center mt-2">
                QR kodni kamera oynasiga tutib turing — avtomatik o'qiydi
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-10 px-6 mb-4">
              <div className="w-10 h-10 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg flex items-center justify-center mx-auto mb-3">
                <QrCode size={18} className="text-[#A8A29E]" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-[#78716C]">Skanerlash uchun kamerani yoqing</p>
            </div>
          )}

          {/* QR xatolik xabari */}
          {qrError && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3.5 py-2.5 mb-3 text-sm">
              {qrError}
            </div>
          )}

          {/* Skanerlash natijalari */}
          {qrResults.length > 0 && (
            <>
              <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2">
                Skanerlashlar tarixi
              </p>
              <div className="bg-white border border-[#E7E5E4] rounded-lg divide-y divide-[#E7E5E4]">
                {qrResults.map((r, i) => (
                  <div key={r.id}
                    className={`flex items-center gap-3 px-4 py-3
                      ${i===0?'rounded-t-lg':''} ${i===qrResults.length-1?'rounded-b-lg':''}
                      ${r.tugriKun ? 'bg-[#F0FDF4]' : ''}`}
                  >
                    {/* Holat belgisi */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                      ${r.tugriKun ? 'bg-[#DCFCE7]' : 'bg-[#F5F5F4]'}`}>
                      {r.tugriKun
                        ? <CheckCircle2 size={14} className="text-[#16A34A]" strokeWidth={2} />
                        : <Check size={14} className="text-[#78716C]" strokeWidth={2} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1917] truncate">{r.ism}</p>
                      <p className="text-xs text-[#78716C]">
                        {r.group && <span>{r.group} · </span>}
                        {r.tugriKun ? 'Keldi' : 'Qayd etildi'}
                      </p>
                    </div>
                    <span className="text-xs text-[#A8A29E] tabular-nums shrink-0">{r.vaqt}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          3. LOGLAR (noto'g'ri kun yozuvlari)
          ══════════════════════════════════════════════════════════════════ */}
      {mode === 'logs' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                Noto'g'ri kun yozuvlari
              </p>
              <p className="text-xs text-[#A8A29E] mt-0.5">
                Dars bo'lmagan kunda skanerlangan o'quvchilar
              </p>
            </div>
            <button onClick={loadLogs}
              className="px-3 py-1.5 border border-[#E7E5E4] text-xs font-medium text-[#78716C] hover:bg-[#F5F5F4] rounded transition-colors">
              Yangilash
            </button>
          </div>

          {logsError && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3.5 py-2.5 mb-3 text-sm">
              {logsError}
            </div>
          )}

          {loadingLogs ? (
            <Loading text="Yuklanmoqda..." />
          ) : logs.length === 0 ? (
            <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-12 px-6">
              <p className="text-sm font-medium text-[#1C1917] mb-1">Loglar yo'q</p>
              <p className="text-sm text-[#78716C]">Hech kimda noto'g'ri kun yozuvi topilmadi</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E7E5E4] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead>
                    <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide">Ism</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide">Guruh</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide">Sana</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide">Vaqt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5E4]">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-[#FAFAF9] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-[#1C1917]">
                          {log.students?.ism ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-[#F5F5F4] text-[#78716C] px-2 py-0.5 rounded">
                            {log.students?.groups?.nomi ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#78716C] tabular-nums">
                          {fmtDate(log.sana)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#78716C] tabular-nums">
                          {log.vaqt ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-[#E7E5E4] bg-[#FAFAF9]">
                <p className="text-xs text-[#A8A29E]">Jami {logs.length} ta yozuv · Oxirgi 100 ta ko'rsatilmoqda</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
