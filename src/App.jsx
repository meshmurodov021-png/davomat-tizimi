// Asosiy ilova komponenti — hozircha faqat bosh sahifani ko'rsatadi
// Keyingi bosqichlarda bu yerga routing va sahifalar qo'shiladi

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">

        {/* Loyiha belgisi */}
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">📋</span>
        </div>

        {/* Sarlavha */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Davomat tizimi
        </h1>

        {/* Qisqa ma'lumot */}
        <p className="text-gray-500 text-lg mb-8">
          Loyiha tayyorlanmoqda
        </p>

        {/* Holat ko'rsatkichi */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
          <div className="flex items-center gap-2 justify-center">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Asos muvaffaqiyatli sozlandi</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App
