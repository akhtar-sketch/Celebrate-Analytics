'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import UserMenu from './UserMenu'
import { useTheme } from './ThemeProvider'

export interface NavLink {
  href: string
  label: string
}

interface SidebarProps {
  links: NavLink[]
  user: { email: string; role: string }
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function Sidebar({ links, user }: SidebarProps) {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-surface border-r border-edge flex flex-col z-20">

      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        {user.role === 'admin' ? (
          <Link
            href="/dashboard/executive"
            className="inline-block transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-80"
          >
            <Image
              src="/logo.png"
              alt="Celebrate Analytics"
              width={0}
              height={0}
              sizes="160px"
              style={{ width: 'auto', height: '56px' }}
              priority
            />
          </Link>
        ) : (
          <Image
            src="/logo.png"
            alt="Celebrate Analytics"
            width={0}
            height={0}
            sizes="160px"
            style={{ width: 'auto', height: '56px' }}
            priority
          />
        )}
      </div>

      <div className="h-px bg-edge-soft mx-4" />

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <p className="px-5 mb-1.5 text-[10px] font-semibold text-ink-3 uppercase tracking-widest">
          Dashboards
        </p>
        <ul className="space-y-0.5 px-3">
          {links.map((link) => {
            const active = link.href === '/dashboard/executive'
              ? pathname === '/dashboard/executive'
              : pathname.startsWith(link.href)
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={clsx(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-100',
                    active
                      ? 'bg-blue-600/10 text-blue-500 dark:text-blue-400'
                      : 'text-ink-2 hover:text-ink hover:bg-wash'
                  )}
                >
                  <span
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full shrink-0 transition-colors',
                      active ? 'bg-blue-500' : 'bg-edge'
                    )}
                  />
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom: theme toggle + user menu */}
      <div className="border-t border-edge-soft">
        {/* Theme toggle */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <span className="text-[11px] text-ink-3 font-medium">
            {theme === 'dark' ? 'Dark mode' : 'Light mode'}
          </span>
          <button
            onClick={toggle}
            className="w-8 h-4.5 flex items-center justify-center rounded-md text-ink-3 hover:text-ink hover:bg-wash transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
        <div className="h-px bg-edge-soft mx-4" />
        <UserMenu email={user.email} role={user.role} />
      </div>

    </aside>
  )
}
