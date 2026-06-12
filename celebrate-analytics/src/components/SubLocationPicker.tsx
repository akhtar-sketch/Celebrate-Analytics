'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { SubLocation } from '@/types'

interface Props {
  subLocations: SubLocation[]
  current: string | null // active sublocation id, or null = "all"
  locationName: string
}

export default function SubLocationPicker({ subLocations, current, locationName }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function select(id: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (id) {
      params.set('sublocation', id)
    } else {
      params.delete('sublocation')
    }
    router.push(`?${params.toString()}`)
  }

  const options: { id: string | null; label: string }[] = [
    { id: null, label: `All ${locationName}` },
    ...subLocations.map((s) => ({ id: s.id, label: s.name })),
  ]

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map((opt) => {
        const active = opt.id === current
        return (
          <button
            key={opt.id ?? '__all__'}
            onClick={() => select(opt.id)}
            className={[
              'px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors duration-150',
              active
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                : 'text-ink-2 hover:bg-wash hover:text-ink',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
