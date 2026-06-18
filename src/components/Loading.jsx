// Yuklanish ko'rsatkichi — ma'lumotlar bazadan kelayotganda ko'rsatiladi
export default function Loading({ text = 'Yuklanmoqda...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
      {/* Aylanuvchi doira */}
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  )
}
