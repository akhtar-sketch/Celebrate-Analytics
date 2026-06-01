import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSessionUser } from '@/lib/auth'
import PendingSignOut from './sign-out'

export default async function PendingPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Celebrate Analytics"
            width={0}
            height={0}
            sizes="200px"
            style={{ width: 'auto', height: '88px' }}
            className="mx-auto mb-6"
            priority
          />
          <div className="w-12 h-12 rounded-2xl bg-surface border border-edge flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg className="w-6 h-6 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-ink tracking-tight mb-2">Access Pending</h1>
          <p className="text-sm text-ink-2 leading-relaxed">
            Your account is verified. An administrator will assign your dashboard permissions.
          </p>
        </div>

        <div className="bg-surface border border-edge rounded-2xl p-5 mb-6 shadow-sm">
          <p className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest mb-1">Signed in as</p>
          <p className="text-sm font-medium text-ink">{user.email}</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard/executive"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Check dashboard access
          </Link>
          <div className="text-center">
            <PendingSignOut />
          </div>
        </div>

        <p className="text-center text-xs text-ink-3 mt-8 leading-relaxed">
          Once access is granted, click &ldquo;Check dashboard access&rdquo; above.
        </p>

      </div>
    </div>
  )
}
