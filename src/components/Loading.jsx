import { Loader2 } from 'lucide-react'

export default function Loading({ text = 'Yuklanmoqda...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] gap-3">
      <Loader2 size={24} className="text-[#2563EB] animate-spin" strokeWidth={1.75} />
      <p className="text-sm text-[#78716C]">{text}</p>
    </div>
  )
}
