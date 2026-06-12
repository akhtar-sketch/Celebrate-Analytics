'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import clsx from 'clsx'

interface Props {
  email: string
  role: string
}

export default function UserMenu({ email, role }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = email.split('@')[0].slice(0, 2).toUpperCase()
  const isAdmin = role === 'admin'

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-[#0b1c42]">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-sidebar-ink truncate leading-none mb-0.5">{email}</p>
          <p className={clsx(
            'text-[10px] font-medium leading-none',
            isAdmin ? 'text-accent' : 'text-sidebar-ink-3'
          )}>
            {isAdmin ? 'Administrator' : 'Viewer'}
          </p>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="text-[11px] text-sidebar-ink-3 hover:text-sidebar-ink-2 disabled:opacity-40 transition-colors font-medium"
      >
        {loading ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
