'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const YEARS = [2024, 2025, 2026]

interface QuarterSelectorProps {
  currentQuarter: string
  currentYear: number
}

export default function QuarterSelector({ currentQuarter, currentYear }: QuarterSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(q: string, y: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', q)
    params.set('y', y.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {QUARTERS.map((q) => (
          <button
            key={q}
            onClick={() => update(q, currentYear)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              q === currentQuarter
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {q}
          </button>
        ))}
      </div>
      <select
        value={currentYear}
        onChange={(e) => update(currentQuarter, Number(e.target.value))}
        className="px-3 py-1.5 rounded-md text-sm bg-zinc-800 text-zinc-300 border border-zinc-700 focus:outline-none focus:border-blue-500"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}
