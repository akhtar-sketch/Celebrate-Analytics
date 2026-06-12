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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function BarChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

export default function Sidebar({ links, user }: SidebarProps) {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col z-20 bg-sidebar-bg border-r border-sidebar-border">

      {/* Brand area */}
      <div className="px-5 pt-6 pb-5">
        {user.role === 'admin' ? (
          <Link
            href="/dashboard/executive"
            className="inline-block transition-opacity duration-200 hover:opacity-80"
          >
            <Image
              src="/logo.png"
              alt="Celebrate Analytics"
              width={0}
              height={0}
              sizes="160px"
              style={{ width: 'auto', height: '52px' }}
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
            style={{ width: 'auto', height: '52px' }}
            priority
          />
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-sidebar-border mx-4" />

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <p className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-ink-3">
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
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100',
                    active
                      ? 'bg-sidebar-wash text-sidebar-ink'
                      : 'text-sidebar-ink-2 hover:text-sidebar-ink hover:bg-sidebar-wash/60'
                  )}
                >
                  <span className={clsx(
                    'flex items-center justify-center w-6 h-6 rounded-md shrink-0 transition-colors',
                    active
                      ? 'bg-accent text-[#0b1c42]'
                      : 'bg-sidebar-wash/60 text-sidebar-ink-3'
                  )}>
                    <BarChartIcon />
                  </span>
                  <span className="truncate">{link.label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom: theme toggle + user */}
      <div className="border-t border-sidebar-border">
        {/* Theme toggle pill */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] text-sidebar-ink-3 font-medium tracking-wide">
            {theme === 'dark' ? 'Dark' : 'Light'} mode
          </span>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={clsx(
              'relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none',
              theme === 'dark'
                ? 'bg-sidebar-wash border border-sidebar-border'
                : 'bg-accent/20 border border-accent/30'
            )}
          >
            <span className={clsx(
              'absolute top-0.5 flex items-center justify-center w-4 h-4 rounded-full shadow transition-all duration-200',
              theme === 'dark'
                ? 'left-0.5 bg-sidebar-ink-2 text-[#070e1e]'
                : 'left-[18px] bg-accent text-[#0b1c42]'
            )}>
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </span>
          </button>
        </div>
        <div className="h-px bg-sidebar-border mx-4" />
        <UserMenu email={user.email} role={user.role} />
      </div>

    </aside>
  )
}
