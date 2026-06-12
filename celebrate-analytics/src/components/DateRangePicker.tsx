'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PRESETS, formatDateRange } from '@/lib/dateUtils'
import type { DateRange } from '@/types'

function getActivePresetKey(range: DateRange): string | null {
  for (const p of PRESETS) {
    const pr = p.getRange()
    if (pr.from === range.from && pr.to === range.to) return p.key
  }
  return null
}

function ChevronIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export default function DateRangePicker({ current }: { current: DateRange }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState(current.from)
  const [customTo, setCustomTo] = useState(current.to)
  const ref = useRef<HTMLDivElement>(null)

  const activeKey = getActivePresetKey(current)
  const label = activeKey
    ? PRESETS.find((p) => p.key === activeKey)!.label
    : formatDateRange(current)

  useEffect(() => {
    setCustomFrom(current.from)
    setCustomTo(current.to)
  }, [current.from, current.to])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function navigate(range: DateRange) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', range.from)
    params.set('to', range.to)
    router.push(`?${params.toString()}`)
    setOpen(false)
  }

  function applyCustom() {
    if (customFrom && customTo && customFrom <= customTo) {
      navigate({ from: customFrom, to: customTo })
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-2 bg-surface border border-edge rounded-xl text-sm text-ink hover:bg-wash transition-colors min-w-[160px] justify-between shadow-sm"
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon />
          <span className="truncate text-[13px] font-medium">{label}</span>
        </div>
        <ChevronIcon />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-raised border border-edge rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="p-1.5">
            {PRESETS.map((p) => {
              const pr = p.getRange()
              return (
                <button
                  key={p.key}
                  onClick={() => navigate(pr)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    p.key === activeKey
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                      : 'text-ink-2 hover:bg-wash hover:text-ink'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          <div className="border-t border-edge-soft p-3 space-y-2.5">
            <p className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
              Custom range
            </p>
            <div className="space-y-1.5">
              <div>
                <p className="text-[10px] text-ink-3 mb-1">From</p>
                <input
                  type="date"
                  value={customFrom}
                  max={customTo}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full bg-surface border border-edge rounded-lg text-xs text-ink px-2.5 py-1.5 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <p className="text-[10px] text-ink-3 mb-1">To</p>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full bg-surface border border-edge rounded-lg text-xs text-ink px-2.5 py-1.5 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={applyCustom}
              className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
