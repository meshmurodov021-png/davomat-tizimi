import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/authApi'

export default function LoginPage() {
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        setError("Email yoki parol noto'g'ri.")
      } else if (err.message.includes('Email not confirmed')) {
        setError("Email tasdiqlanmagan. Pochtangizni tekshiring.")
      } else {
        setError("Xatolik yuz berdi. Internetni tekshirib, qaytadan urinib ko'ring.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    /* fixed inset-0 — URL satri va quyi panel qanday bo'lishidan qat'i nazar, aniq ko'rinayotgan ekranni to'ldiradi */
    <div className="fixed inset-0 bg-[#FAFAF9] flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-[360px]">

        {/* Sarlavha */}
        <div className="mb-5">
          <div className="w-8 h-8 bg-[#2563EB] rounded flex items-center justify-center mb-4">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#1C1917] mb-1">Tizimga kirish</h1>
          <p className="text-sm text-[#78716C]">Davomat tizimi — o'qituvchi paneli</p>
        </div>

        {/* Xatolik */}
        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded px-3.5 py-2.5 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Forma */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
              Email manzil
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@manzil.com"
              required
              className="w-full px-3 py-2.5 border border-[#E7E5E4] rounded bg-white text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
              Parol
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 border border-[#E7E5E4] rounded bg-white text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>

      </div>
    </div>
  )
}
