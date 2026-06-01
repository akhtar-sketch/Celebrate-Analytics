import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { getSessionUser, getUserAccess, getAccessibleNavLinks } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const access = await getUserAccess(user.id)
  if (!access) redirect('/pending')

  const navLinks = getAccessibleNavLinks(access)

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar links={navLinks} user={{ email: user.email ?? '', role: access.role }} />
      <main className="ml-56 flex-1 min-w-0 p-8 max-w-[1400px]">
        {children}
      </main>
    </div>
  )
}
