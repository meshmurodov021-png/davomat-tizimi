import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/authApi'

export default function LoginPage() {
  const navigate = useNavigate()

  // Forma maydonlari
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  // Yuklanish va xatolik holatlari
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault() // Sahifani qayta yuklashni oldini olamiz
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard') // Muvaffaqiyatli kirgach dashboard ga o'tamiz
    } catch (err) {
      // Supabase xato matnlarini o'zbekchaga tarjimon qilamiz
      if (err.message.includes('Invalid login credentials')) {
        setError("Login yoki parol noto'g'ri. Qaytadan urinib ko'ring.")
      } else if (err.message.includes('Email not confirmed')) {
        setError("Email tasdiqlanmagan. Pochtangizni tekshiring.")
      } else {
        setError("Xatolik yuz berdi. Internetni tekshiring va qaytadan urinib ko'ring.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">

        {/* Yuqori qism: logo va sarlavha */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Davomat tizimi</h1>
          <p className="text-gray-500 text-sm mt-1">O'qituvchi paneliga kirish</p>
        </div>

        {/* Xatolik xabari */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Login formasi */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email manzil
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="misol@email.com"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Parol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Parol
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Kirish tugmasi */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>

        </form>

      </div>
    </div>
  )
}
