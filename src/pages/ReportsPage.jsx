import { useEffect, useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import {
  Download, ArrowUpDown, ArrowUp, ArrowDown,
  Users, TrendingUp, AlertTriangle, BarChart3,
} from 'lucide-react'
import { getGroups } from '../lib/groupsApi'
import { getReportData } from '../lib/reportsApi'
import Loading from '../components/Loading'

// ── Sana yordamchi funksiyalari ───────────────────────────────────────────────
function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}
function getDateNDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}
// "2025-06-20" → "20.06.2025"
function fmtDate(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}.${m}.${y}`
}

// ── Har bir o'quvchi uchun statistikani hisoblash ─────────────────────────────
function calcStudentStats(students, logs) {
  return students.map(student => {
    const sl       = logs.filter(l => l.student_id === student.id)
    const keldi    = sl.filter(l => l.holat === 'keldi').length
    const kech     = sl.filter(l => l.holat === 'kech_keldi').length
    const kelmadi  = sl.filter(l => l.holat === 'kelmadi').length
    const marked   = keldi + kech + kelmadi  // belgilangan darslar

    // Davomat foizi: (keldi + kech) / belgilangan × 100
    const percentage = marked > 0 ? Math.round(((keldi + kech) / marked) * 100) : null

    return {
      id:         student.id,
      ism:        student.ism,
      groupNomi:  student.groups?.nomi ?? '—',
      keldi,
      kech,
      kelmadi,
      marked,
      percentage,
    }
  })
}

// Davomat foizi bo'yicha rang belgisi
function pctColor(pct) {
  if (pct === null)  return 'text-[#A8A29E]'
  if (pct < 70)      return 'text-[#DC2626] font-semibold'
  if (pct < 85)      return 'text-[#CA8A04] font-semibold'
  return 'text-[#16A34A] font-semibold'
}
function pctRowBg(pct) {
  if (pct === null) return ''
  if (pct < 70)     return 'bg-[#FFF5F5]'
  return ''
}

// Saralanadigan ustun sarlavhasi
function SortHeader({ label, col, sortCol, sortDir, onSort }) {
  const active = sortCol === col
  return (
    <th
      onClick={() => onSort(col)}
      className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide cursor-pointer select-none hover:text-[#1C1917] transition-colors"
    >
      <span className="flex items-center gap-1">
        {label}
        {active
          ? (sortDir === 'asc'
              ? <ArrowUp size={11} strokeWidth={2} />
              : <ArrowDown size={11} strokeWidth={2} />)
          : <ArrowUpDown size={11} className="text-[#D4D4D0]" strokeWidth={2} />}
      </span>
    </th>
  )
}

// Umumiy statistika kartochkasi
function StatCard({ label, value, sub, Icon, warning }) {
  return (
    <div className={`bg-white border rounded-lg p-4 ${warning ? 'border-[#FECACA]' : 'border-[#E7E5E4]'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${warning ? 'bg-[#FEF2F2]' : 'bg-[#F5F5F4]'}`}>
          <Icon size={15} className={warning ? 'text-[#DC2626]' : 'text-[#78716C]'} strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#1C1917] tabular-nums">{value}</p>
      <p className="text-xs text-[#78716C] mt-0.5">{label}</p>
      {sub && <p className="text-xs text-[#A8A29E] mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Asosiy komponent ──────────────────────────────────────────────────────────
export default function ReportsPage() {
  // Filtrlar
  const [allGroups,      setAllGroups]      = useState([])
  const [selectedGroup,  setSelectedGroup]  = useState('all')
  const [startDate,      setStartDate]      = useState(getDateNDaysAgo(30))
  const [endDate,        setEndDate]        = useState(getTodayStr())
  const [preset,         setPreset]         = useState(30)   // 7 | 30 | null (custom)

  // Natija
  const [studentStats,   setStudentStats]   = useState([])
  const [hasLoaded,      setHasLoaded]      = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')

  // Saralash
  const [sortCol, setSortCol] = useState('percentage')
  const [sortDir, setSortDir] = useState('asc')

  // Sahifa ochilganda guruhlarni yuklaymiz
  useEffect(() => {
    getGroups()
      .then(setAllGroups)
      .catch(() => {})
  }, [])

  // Preset bosılganda sanalarni yangilaymiz
  function applyPreset(days) {
    setPreset(days)
    setStartDate(getDateNDaysAgo(days))
    setEndDate(getTodayStr())
  }

  // Hisobotni yuklash
  async function handleLoad() {
    if (!startDate || !endDate) { setError("Boshlanish va tugash sanasini kiriting."); return }
    if (startDate > endDate)    { setError("Boshlanish sanasi tugash sanasidan oldin bo'lishi kerak."); return }

    setLoading(true)
    setError('')
    try {
      const gid = selectedGroup === 'all' ? null : selectedGroup
      const { students, logs } = await getReportData(startDate, endDate, gid)
      setStudentStats(calcStudentStats(students, logs))
      setHasLoaded(true)
    } catch {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  // Saralanadigan ustun bosilganda
  function handleSort(col) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  // Saralangan natija
  const sortedStats = useMemo(() => {
    return [...studentStats].sort((a, b) => {
      let vA, vB
      if (sortCol === 'ism') {
        vA = a.ism ?? ''
        vB = b.ism ?? ''
        return sortDir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA)
      }
      // percentage: null eng pastga
      vA = a.percentage ?? -1
      vB = b.percentage ?? -1
      return sortDir === 'asc' ? vA - vB : vB - vA
    })
  }, [studentStats, sortCol, sortDir])

  // Umumiy statistika
  const summary = useMemo(() => {
    const withData = studentStats.filter(s => s.marked > 0)
    const avgPct   = withData.length > 0
      ? Math.round(withData.reduce((acc, s) => acc + s.percentage, 0) / withData.length)
      : null
    const lowCount = studentStats.filter(s => s.percentage !== null && s.percentage < 70).length
    const totalMarked = studentStats.reduce((acc, s) => acc + s.marked, 0)
    return { avgPct, lowCount, totalMarked }
  }, [studentStats])

  // Excel eksport
  function handleExport() {
    if (sortedStats.length === 0) return

    const rows = sortedStats.map((s, i) => ({
      '№':           i + 1,
      'Ism':         s.ism,
      'Guruh':       s.groupNomi,
      'Keldi':       s.keldi,
      'Kech qoldi':  s.kech,
      'Kelmadi':     s.kelmadi,
      'Jami':        s.marked,
      'Davomat %':   s.percentage !== null ? `${s.percentage}%` : '—',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)

    // Ustun kengliklarini moslash
    ws['!cols'] = [
      { wch: 4 }, { wch: 24 }, { wch: 20 },
      { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 12 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Davomat hisoboti')

    const fileName = `davomat_${fmtDate(startDate)}_${fmtDate(endDate)}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* Sarlavha */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-[#1C1917]">Hisobotlar</h1>
        <p className="text-sm text-[#78716C] mt-0.5">Davomat statistikasi va tahlili</p>
      </div>

      {/* ── Filtrlar paneli ── */}
      <div className="bg-white border border-[#E7E5E4] rounded-lg p-4 mb-5 space-y-4">

        {/* Guruh tanlash */}
        <div>
          <label className="block text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-1.5">
            Guruh
          </label>
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-[#E7E5E4] rounded bg-white text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
          >
            <option value="all">Barcha guruhlar</option>
            {allGroups.map(g => (
              <option key={g.id} value={g.id}>{g.nomi}</option>
            ))}
          </select>
        </div>

        {/* Sana oralig'i */}
        <div>
          <label className="block text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-1.5">
            Sana oralig'i
          </label>

          {/* Tez tanlash preset tugmalari */}
          <div className="flex gap-2 mb-2">
            {[
              { label: 'Oxirgi 7 kun',  days: 7 },
              { label: 'Oxirgi 30 kun', days: 30 },
            ].map(p => (
              <button
                key={p.days}
                onClick={() => applyPreset(p.days)}
                className={`px-3 py-1.5 text-xs font-medium border rounded transition-colors
                  ${preset === p.days
                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                    : 'bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#2563EB]/40'}`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setPreset(null)}
              className={`px-3 py-1.5 text-xs font-medium border rounded transition-colors
                ${preset === null
                  ? 'bg-[#2563EB] border-[#2563EB] text-white'
                  : 'bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#2563EB]/40'}`}
            >
              O'zim tanlayman
            </button>
          </div>

          {/* Sana inputlari */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={e => { setStartDate(e.target.value); setPreset(null) }}
              className="px-3 py-2 border border-[#E7E5E4] rounded bg-white text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
            />
            <span className="text-sm text-[#78716C]">—</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={getTodayStr()}
              onChange={e => { setEndDate(e.target.value); setPreset(null) }}
              className="px-3 py-2 border border-[#E7E5E4] rounded bg-white text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Ko'rish tugmasi */}
        <button
          onClick={handleLoad}
          disabled={loading}
          className="px-5 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
        >
          {loading ? 'Yuklanmoqda...' : 'Hisobotni ko\'rish'}
        </button>
      </div>

      {/* Xatolik */}
      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3.5 py-2.5 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Yuklanmoqda */}
      {loading && <Loading text="Hisobot tayyorlanmoqda..." />}

      {/* Natijalar */}
      {!loading && hasLoaded && (
        <>
          {studentStats.length === 0 ? (
            <div className="bg-white border border-[#E7E5E4] rounded-lg text-center py-14 px-6">
              <div className="w-10 h-10 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 size={18} className="text-[#A8A29E]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-[#1C1917] mb-1">Ma'lumot topilmadi</p>
              <p className="text-sm text-[#78716C]">
                Tanlangan filtr uchun davomat yozuvlari yo'q
              </p>
            </div>
          ) : (
            <>
              {/* ── Umumiy statistika kartochkalari ── */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <StatCard
                  label="Jami belgilangan"
                  value={summary.totalMarked}
                  sub="dars yozuvi"
                  Icon={Users}
                />
                <StatCard
                  label="O'rtacha davomat"
                  value={summary.avgPct !== null ? `${summary.avgPct}%` : '—'}
                  sub="barcha o'quvchilar"
                  Icon={TrendingUp}
                />
                <StatCard
                  label="Kam davomat"
                  value={summary.lowCount}
                  sub="70% dan past"
                  Icon={AlertTriangle}
                  warning={summary.lowCount > 0}
                />
              </div>

              {/* ── Jadval sarlavhasi + eksport ── */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                    O'quvchilar bo'yicha
                  </p>
                  <p className="text-xs text-[#A8A29E] mt-0.5">
                    {fmtDate(startDate)} — {fmtDate(endDate)}
                    &nbsp;·&nbsp; {studentStats.length} ta o'quvchi
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#E7E5E4] text-sm font-medium text-[#1C1917] bg-white hover:bg-[#F5F5F4] transition-colors rounded"
                >
                  <Download size={14} strokeWidth={1.75} />
                  Excel
                </button>
              </div>

              {/* ── Jadval (gorizontal scroll kichik ekranda) ── */}
              <div className="bg-white border border-[#E7E5E4] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px]">
                    <thead>
                      <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide w-10">#</th>
                        <SortHeader label="Ism"     col="ism"        sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wide">Guruh</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-[#78716C] uppercase tracking-wide">Keldi</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-[#78716C] uppercase tracking-wide">Kech</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-[#78716C] uppercase tracking-wide">Kelmadi</th>
                        <SortHeader label="Foiz %"  col="percentage" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E5E4]">
                      {sortedStats.map((s, i) => (
                        <tr
                          key={s.id}
                          className={`transition-colors hover:bg-[#FAFAF9] ${pctRowBg(s.percentage)}`}
                        >
                          <td className="px-4 py-3 text-sm text-[#A8A29E] tabular-nums">{i + 1}</td>

                          {/* Ism + avatar */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full flex items-center justify-center text-xs font-semibold text-[#78716C] shrink-0">
                                {s.ism?.charAt(0)?.toUpperCase() ?? '?'}
                              </div>
                              <span className="text-sm font-medium text-[#1C1917]">{s.ism}</span>
                            </div>
                          </td>

                          {/* Guruh */}
                          <td className="px-4 py-3">
                            <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded font-medium">
                              {s.groupNomi}
                            </span>
                          </td>

                          {/* Keldi */}
                          <td className="px-4 py-3 text-center text-sm text-[#16A34A] font-medium tabular-nums">
                            {s.keldi > 0 ? s.keldi : <span className="text-[#D4D4D0]">0</span>}
                          </td>

                          {/* Kech */}
                          <td className="px-4 py-3 text-center text-sm text-[#CA8A04] font-medium tabular-nums">
                            {s.kech > 0 ? s.kech : <span className="text-[#D4D4D0]">0</span>}
                          </td>

                          {/* Kelmadi */}
                          <td className="px-4 py-3 text-center text-sm text-[#DC2626] font-medium tabular-nums">
                            {s.kelmadi > 0 ? s.kelmadi : <span className="text-[#D4D4D0]">0</span>}
                          </td>

                          {/* Davomat foizi */}
                          <td className="px-4 py-3">
                            {s.percentage !== null ? (
                              <div className="flex items-center gap-2">
                                {/* Mini progress bar */}
                                <div className="w-16 h-1.5 bg-[#E7E5E4] rounded-full overflow-hidden shrink-0">
                                  <div
                                    className={`h-full rounded-full ${
                                      s.percentage < 70 ? 'bg-[#DC2626]' :
                                      s.percentage < 85 ? 'bg-[#CA8A04]' : 'bg-[#16A34A]'
                                    }`}
                                    style={{ width: `${s.percentage}%` }}
                                  />
                                </div>
                                <span className={`text-sm tabular-nums ${pctColor(s.percentage)}`}>
                                  {s.percentage}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-[#A8A29E]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Jadval izoh */}
                <div className="px-4 py-3 border-t border-[#E7E5E4] bg-[#FAFAF9] flex flex-wrap gap-4 text-xs text-[#78716C]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
                    70% dan past — diqqat talab qiladi
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#CA8A04]"></span>
                    70–85% — o'rtacha
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                    85%+ — yaxshi
                  </span>
                </div>
              </div>
            </>
          )}
        </>
      )}

    </div>
  )
}
