'use client'

/**
 * DESIGN MOCKUP — READ ONLY, NO PRODUCTION FILES CHANGED
 *
 * This page is a static visual preview of the proposed redesign.
 * Visit /mockup to see it. Toggle between Login / Dashboard views
 * and Light / Dark modes with the controls at the top.
 *
 * Nothing here touches any real app file. Once approved, the
 * real files will be updated to match.
 */

import { useState } from 'react'

// ─── Design tokens ────────────────────────────────────────────
// All values live in the component so this file is self-contained.

const TOKENS = {
  light: {
    canvas:      '#f4f6fb',
    surface:     '#ffffff',
    surfaceHover: '#fafbff',
    edge:        '#dae1f0',
    edgeSoft:    '#e8edf8',
    wash:        '#edf1fa',
    ink:         '#0b162e',
    ink2:        '#4a608a',
    ink3:        '#94a6c8',
    brand:       '#0b2d69',
    brandMid:    '#1442a0',
    brandSoft:   '#ebf0fc',
    accent:      '#f5a717',
    accentSoft:  '#fdf3d5',
    accentText:  '#9a6400',
    green:       '#16a34a',
    greenSoft:   '#dcfce7',
    red:         '#dc2626',
    redSoft:     '#fee2e2',
  },
  dark: {
    canvas:      '#070e1e',
    surface:     '#0b152c',
    surfaceHover: '#0f1c3a',
    edge:        '#1c305a',
    edgeSoft:    '#142448',
    wash:        '#132244',
    ink:         '#dee8fa',
    ink2:        '#7894c8',
    ink3:        '#3c5480',
    brand:       '#4a7ae4',
    brandMid:    '#6494f8',
    brandSoft:   '#0b193c',
    accent:      '#f5a717',
    accentSoft:  '#281e03',
    accentText:  '#f5a717',
    green:       '#4ade80',
    greenSoft:   '#14532d',
    red:         '#f87171',
    redSoft:     '#450a0a',
  },
  sidebar: {
    bg:     '#0b1c42',
    border: '#132c5e',
    ink:    '#d2dcf2',
    ink2:   '#7894c8',
    ink3:   '#405a94',
    wash:   '#143064',
    active: '#f5a717',
  },
}

// ─── Mock data ────────────────────────────────────────────────

const KPI_CARDS = [
  { title: 'Total Spend',  value: '$24,180', delta: '+12.4%', dir: 'up',   icon: 'spend', lowerIsBetter: false },
  { title: 'Total Leads',  value: '1,042',   delta: '+8.7%',  dir: 'up',   icon: 'leads', lowerIsBetter: false },
  { title: 'Blended CPL',  value: '$23.21',  delta: '-5.2%',  dir: 'down', icon: 'cpl',   lowerIsBetter: true  },
  { title: 'Blended CTR',  value: '4.18%',   delta: null,     dir: null,   icon: 'ctr',   lowerIsBetter: false },
]

const PLATFORMS = [
  { name: 'Google', spend: '$14,320', pct: 59, leads: 612, cpl: '$23.40', clicks: '18.4k', ctr: '3.9%',  deltaDir: 'up',   delta: '+14%', color: '#4a7ae4', barColor: '#4a7ae4' },
  { name: 'Meta',   spend: '$7,260',  pct: 30, leads: 351, cpl: '$20.68', clicks: '9.1k',  ctr: '4.6%',  deltaDir: 'up',   delta: '+6%',  color: '#f5a717', barColor: '#f5a717' },
  { name: 'TikTok', spend: '$2,600',  pct: 11, leads: 79,  cpl: '$32.91', clicks: '4.2k',  ctr: '5.1%',  deltaDir: 'down', delta: '-3%',  color: '#ec4899', barColor: '#ec4899' },
]

const CAMPAIGNS = [
  { platform: 'google', name: 'Search — Braces | [Location] - Exact', spend: '$8,120', leads: 342, cpl: '$23.74', ctr: '3.8%' },
  { platform: 'meta',   name: 'Meta — Retargeting Warm Audiences Q2',  spend: '$4,840', leads: 218, cpl: '$22.20', ctr: '4.9%' },
  { platform: 'tiktok', name: 'TikTok — Teen Braces Awareness Jun',    spend: '$2,600', leads: 79,  cpl: '$32.91', ctr: '5.1%' },
]

const NAV_LINKS = [
  { label: 'Executive Overview', active: false },
  { label: 'Austin — Main',      active: true  },
  { label: 'San Antonio',        active: false  },
  { label: 'Houston',            active: false  },
]

const CHART_BARS = [38, 55, 42, 70, 88, 62, 75, 91, 66, 82, 95, 78]
const CHART_LABELS = ['Jan 1','Jan 8','Jan 15','Jan 22','Jan 29','Feb 5','Feb 12','Feb 19','Feb 26','Mar 5','Mar 12','Mar 19']

// ─── Icons ────────────────────────────────────────────────────

function Icon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  const s = { width: size, height: size, display: 'block', color: color ?? 'currentColor' }
  if (name === 'spend') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
  if (name === 'leads') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
  if (name === 'cpl') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  )
  if (name === 'ctr') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
    </svg>
  )
  if (name === 'sun') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  )
  if (name === 'moon') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
  if (name === 'chart') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )
  if (name === 'logout') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
  if (name === 'mail') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  )
  return null
}

function PlatformLogo({ name, size = 14 }: { name: string; size?: number }) {
  const s = { width: size, height: size, display: 'block' }
  if (name === 'google') return (
    <svg style={s} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
  if (name === 'meta') return (
    <svg style={s} viewBox="0 0 24 24">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
  if (name === 'tiktok') return (
    <svg style={s} viewBox="0 0 24 24">
      <path fill="#000" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z"/>
    </svg>
  )
  return <div style={{ ...s, borderRadius: 3, background: '#cbd5e1' }} />
}

// ─── Main mockup page ─────────────────────────────────────────

export default function MockupPage() {
  const [view, setView] = useState<'login' | 'dashboard'>('login')
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const T = TOKENS[mode]
  const S = TOKENS.sidebar

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#111', minHeight: '100vh' }}>

      {/* ── Mockup controls bar ─────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#18181b', borderBottom: '1px solid #27272a',
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
      }}>
        <span style={{ color: '#71717a', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Design Mockup
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {(['login', 'dashboard'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '5px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              background: view === v ? '#f5a717' : '#27272a',
              color: view === v ? '#0b1c42' : '#a1a1aa',
              transition: 'all 0.15s',
            }}>
              {v === 'login' ? 'Login Page' : 'Dashboard'}
            </button>
          ))}
          <div style={{ width: 1, background: '#3f3f46', margin: '0 4px' }} />
          {(['light', 'dark'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '5px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              background: mode === m ? '#3f3f46' : 'transparent',
              color: mode === m ? '#fafafa' : '#71717a',
              transition: 'all 0.15s',
            }}>
              {m === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Preview frame ───────────────────────────────────── */}
      <div style={{ padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
        {view === 'login'
          ? <LoginMockup T={T} mode={mode} />
          : <DashboardMockup T={T} S={S} mode={mode} />
        }
      </div>
    </div>
  )
}

// ─── Login mockup ─────────────────────────────────────────────

function LoginMockup({ T, mode }: { T: typeof TOKENS['light']; mode: string }) {
  return (
    <div style={{
      width: '100%', maxWidth: 1100, minHeight: 600,
      borderRadius: 16, overflow: 'hidden',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
    }}>
      {/* Left — brand panel */}
      <div style={{
        background: '#0b1c42',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '52px 48px',
      }}>
        {/* Logo */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Celebrate Analytics" style={{ width: 'auto', height: 52, objectFit: 'contain' }} />
        </div>

        {/* Feature callouts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: 'spend', text: 'Real-time ad spend across Google, Meta & TikTok' },
            { icon: 'leads', text: 'Lead attribution and CPL tracking per location' },
            { icon: 'chart', text: 'Trend analysis with prior-period comparisons' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(245,167,23,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name={icon} size={16} color="#f5a717" />
              </div>
              <p style={{ color: '#7894c8', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ color: '#405a94', fontSize: 11, margin: 0 }}>
          Celebrate Dental & Braces — Internal Analytics
        </p>
      </div>

      {/* Right — login form */}
      <div style={{
        background: T.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '52px 48px',
      }}>
        <div style={{ width: '100%', maxWidth: 340 }}>
          <h1 style={{
            fontSize: 22, fontWeight: 700, color: T.ink,
            margin: '0 0 6px', letterSpacing: '-0.02em',
          }}>
            Sign in
          </h1>
          <p style={{ fontSize: 13, color: T.ink2, margin: '0 0 32px' }}>
            Enter your work email to receive a one-time code.
          </p>

          {/* Email field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: T.ink3, display: 'flex', alignItems: 'center',
              }}>
                <Icon name="mail" size={14} color={T.ink3} />
              </div>
              <div style={{
                width: '100%', padding: '10px 14px 10px 36px',
                border: `1.5px solid ${T.accent}`,
                borderRadius: 10, background: T.brandSoft,
                color: T.ink, fontSize: 13,
                boxSizing: 'border-box',
              }}>
                you@celebratedental.com
              </div>
            </div>
          </div>

          {/* CTA button */}
          <button style={{
            width: '100%', padding: '11px 0',
            background: T.brand, color: '#fff',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            fontSize: 13, fontWeight: 700, letterSpacing: '0.01em',
            boxShadow: `0 4px 16px ${T.brand}40`,
          }}>
            Send verification code
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: T.edge }} />
            <span style={{ fontSize: 11, color: T.ink3, whiteSpace: 'nowrap' }}>
              Secure · Code expires in 10 min
            </span>
            <div style={{ flex: 1, height: 1, background: T.edge }} />
          </div>

          <p style={{ fontSize: 11, color: T.ink3, textAlign: 'center', margin: 0 }}>
            Access is managed by your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard mockup ─────────────────────────────────────────

function DashboardMockup({ T, S, mode }: { T: typeof TOKENS['light']; S: typeof TOKENS['sidebar']; mode: string }) {
  return (
    <div style={{
      width: '100%', maxWidth: 1300,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      display: 'flex', height: 820,
    }}>
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: S.bg,
        borderRight: `1px solid ${S.border}`,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Celebrate Analytics" style={{ width: 'auto', height: 44, objectFit: 'contain' }} />
        </div>
        <div style={{ height: 1, background: S.border, margin: '0 16px' }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          <p style={{
            padding: '0 20px 8px', fontSize: 10, fontWeight: 700,
            color: S.ink3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
          }}>
            Dashboards
          </p>
          {NAV_LINKS.map(({ label, active }) => (
            <div key={label} style={{
              margin: '2px 10px',
              padding: '8px 12px',
              borderRadius: 8,
              background: active ? S.wash : 'transparent',
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: active ? S.active : `${S.wash}99`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'all 0.15s',
              }}>
                <Icon name="chart" size={13} color={active ? '#0b1c42' : S.ink3} />
              </div>
              <span style={{
                fontSize: 12.5, fontWeight: active ? 600 : 500,
                color: active ? S.ink : S.ink2,
                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
              {active && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: S.active, flexShrink: 0 }} />
              )}
            </div>
          ))}
        </nav>

        {/* Bottom — theme + user */}
        <div style={{ borderTop: `1px solid ${S.border}` }}>
          {/* Theme toggle */}
          <div style={{
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, color: S.ink3, fontWeight: 500 }}>
              {mode === 'dark' ? 'Dark' : 'Light'} mode
            </span>
            <div style={{
              width: 38, height: 22, borderRadius: 11,
              background: mode === 'dark' ? S.wash : `${S.active}33`,
              border: `1px solid ${mode === 'dark' ? S.border : `${S.active}55`}`,
              position: 'relative', cursor: 'pointer',
            }}>
              <div style={{
                position: 'absolute', top: 3,
                left: mode === 'dark' ? 3 : 17,
                width: 14, height: 14, borderRadius: '50%',
                background: mode === 'dark' ? S.ink2 : S.active,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'left 0.2s',
              }}>
                <Icon name={mode === 'dark' ? 'moon' : 'sun'} size={9} color={mode === 'dark' ? '#0b152c' : '#0b1c42'} />
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: S.border, margin: '0 16px' }} />
          {/* User */}
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: `${S.active}22`, border: `1.5px solid ${S.active}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: S.active }}>A</span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: S.ink, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                admin@celebrate.com
              </p>
              <p style={{ fontSize: 10, color: S.ink3, margin: '1px 0 0', textTransform: 'capitalize' }}>Admin</p>
            </div>
            <Icon name="logout" size={13} color={S.ink3} />
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <main style={{
        flex: 1, overflowY: 'auto',
        background: T.canvas,
        padding: '32px 32px 48px',
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 5px' }}>
              Location Dashboard
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.ink, margin: '0 0 5px', letterSpacing: '-0.025em' }}>
              Austin — Main
            </h1>
            <p style={{ fontSize: 12, color: T.ink3, margin: 0 }}>Jan 1, 2025 – Mar 31, 2025</p>
          </div>
          {/* Date picker mockup */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 9,
            background: T.surface, border: `1px solid ${T.edge}`,
            fontSize: 12, fontWeight: 500, color: T.ink2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Jan 1 – Mar 31, 2025
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        {/* ── KPI band ────────────────────────────────────── */}
        <div style={{
          background: T.surface,
          border: `1px solid ${T.edge}`,
          borderRadius: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 1px 6px rgba(11,45,105,0.06)',
        }}>
          <>
            {KPI_CARDS.map((card, i) => {
              const isUp = card.dir === 'up'
              const isGood = card.lowerIsBetter ? !isUp : isUp
              const deltaColor = isGood ? T.green : T.red
              const deltaBg = isGood ? T.greenSoft : T.redSoft

              return (
                <div key={card.title} style={{
                  padding: '20px 22px',
                  borderRight: i < 3 ? `1px solid ${T.edgeSoft}` : 'none',
                  borderTop: `3px solid ${i === 0 ? T.accent : i === 1 ? T.brand : i === 2 ? '#16a34a' : T.ink3}`,
                }}>
                  {/* Label + icon */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {card.title}
                    </span>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: T.brandSoft,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={card.icon} size={14} color={T.brand} />
                    </div>
                  </div>

                  {/* Value */}
                  <p style={{
                    fontSize: 28, fontWeight: 800, color: T.ink, margin: '0 0 12px',
                    letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {card.value}
                  </p>

                  {/* Delta */}
                  {card.delta ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        fontSize: 11, fontWeight: 700,
                        padding: '2px 7px', borderRadius: 6,
                        background: deltaBg, color: deltaColor,
                      }}>
                        {isUp ? '↑' : '↓'} {card.delta}
                      </span>
                      <span style={{ fontSize: 10, color: T.ink3 }}>vs prior period</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 10, color: T.ink3 }}>No prior period data</span>
                  )}
                </div>
              )
            })}
          </>
        </div>

        {/* ── Platform breakdown ───────────────────────────── */}
        <div>
          <SectionHeader T={T}>Platform Breakdown</SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {PLATFORMS.map((p) => (
              <div key={p.name} style={{
                background: T.surface, borderRadius: 14,
                border: `1px solid ${T.edge}`,
                borderTop: `3px solid ${p.color}`,
                padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
                boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 1px 4px rgba(11,45,105,0.05)',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: T.wash, border: `1px solid ${T.edgeSoft}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <PlatformLogo name={p.name.toLowerCase()} size={16} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.ink, flex: 1 }}>{p.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: `${p.color}18`, color: p.color,
                  }}>
                    {p.pct}%
                  </span>
                </div>

                {/* Spend + delta */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                      {p.spend}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                      background: p.deltaDir === 'up' ? T.greenSoft : T.redSoft,
                      color: p.deltaDir === 'up' ? T.green : T.red,
                    }}>
                      {p.deltaDir === 'up' ? '↑' : '↓'} {p.delta}
                    </span>
                  </div>
                  {/* Spend bar */}
                  <div style={{ height: 4, background: T.edgeSoft, borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${p.pct}%`,
                      background: p.barColor, borderRadius: 9999,
                    }} />
                  </div>
                </div>

                {/* Metrics grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px',
                  paddingTop: 12, borderTop: `1px solid ${T.edgeSoft}`,
                }}>
                  {[['Leads', p.leads], ['CPL', p.cpl], ['Clicks', p.clicks], ['CTR', p.ctr]].map(([label, value]) => (
                    <div key={String(label)}>
                      <p style={{ fontSize: 9.5, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.ink, margin: 0, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Spend trend (bar chart visual) ───────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <SectionHeader T={T} noMargin>Weekly Spend Trend</SectionHeader>
            <span style={{ fontSize: 11, color: T.ink3 }}>Jan 1 – Mar 31, 2025</span>
          </div>
          <div style={{
            background: T.surface, borderRadius: 14,
            border: `1px solid ${T.edge}`, padding: '20px 20px 16px',
            boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 1px 4px rgba(11,45,105,0.05)',
          }}>
            {/* Chart legend */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              {[['Google', '#4a7ae4'], ['Meta', '#f5a717'], ['TikTok', '#ec4899']].map(([name, color]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color as string }} />
                  <span style={{ fontSize: 11, color: T.ink2, fontWeight: 500 }}>{name}</span>
                </div>
              ))}
            </div>
            {/* Chart bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140, paddingBottom: 0 }}>
              {CHART_BARS.map((h, i) => (
                <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{
                    width: '100%',
                    height: `${h}%`,
                    borderRadius: '3px 3px 0 0',
                    background: i % 3 === 0 ? '#4a7ae4' : i % 3 === 1 ? '#f5a717' : '#ec4899',
                    opacity: 0.85,
                    minHeight: 4,
                  }} />
                </div>
              ))}
            </div>
            {/* X axis labels */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {CHART_LABELS.map((l, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: T.ink3 }}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Top campaigns table ──────────────────────────── */}
        <div>
          <SectionHeader T={T}>Top Campaign per Platform</SectionHeader>
          <div style={{
            background: T.surface, borderRadius: 14,
            border: `1px solid ${T.edge}`, padding: '0 20px',
            boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 1px 4px rgba(11,45,105,0.05)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.edgeSoft}` }}>
                  {['Campaign', 'Spend', 'Leads', 'CPL', 'CTR'].map((h, i) => (
                    <th key={h} style={{
                      padding: '14px 0', paddingRight: i < 4 ? 16 : 0,
                      textAlign: i === 0 ? 'left' : 'right',
                      fontSize: 10, fontWeight: 700, color: T.ink3,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAMPAIGNS.map((c, i) => (
                  <tr key={c.name} style={{
                    borderBottom: i < CAMPAIGNS.length - 1 ? `1px solid ${T.edgeSoft}80` : 'none',
                  }}>
                    <td style={{ padding: '13px 0', paddingRight: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6,
                          background: T.wash, border: `1px solid ${T.edgeSoft}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <PlatformLogo name={c.platform} size={12} />
                        </div>
                        <span style={{ color: T.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 16, color: T.ink, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{c.spend}</td>
                    <td style={{ textAlign: 'right', paddingRight: 16, color: T.ink2, fontVariantNumeric: 'tabular-nums' }}>{c.leads}</td>
                    <td style={{ textAlign: 'right', paddingRight: 16, color: T.ink2, fontVariantNumeric: 'tabular-nums' }}>{c.cpl}</td>
                    <td style={{ textAlign: 'right', color: T.ink2, fontVariantNumeric: 'tabular-nums' }}>{c.ctr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}

function SectionHeader({ T, children, noMargin }: { T: typeof TOKENS['light']; children: React.ReactNode; noMargin?: boolean }) {
  return (
    <h2 style={{
      fontSize: 13, fontWeight: 700, color: T.ink,
      margin: noMargin ? 0 : '0 0 14px',
      letterSpacing: '-0.01em',
    }}>
      {children}
    </h2>
  )
}
