import { createSupabaseServerClient } from './supabase-server'
import { getSupabaseClient } from './supabase'
import { LOCATIONS } from '@/config/locations'
import type { UserAccess } from '@/types'

export type { UserAccess }

// Returns the authenticated Supabase user, or null if not logged in.
// Uses getUser() (network-validated) rather than getSession() (JWT-only).
export async function getSessionUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Looks up the user's role + allowed locations from the database.
// Returns null if the user has no role assigned (e.g. newly invited user).
export async function getUserAccess(userId: string): Promise<UserAccess | null> {
  const db = getSupabaseClient() // service role — bypasses RLS

  // Fetch role + location access in parallel. Keep them separate (not Promise.all
  // destructuring) so TypeScript can infer each result's shape independently.
  // Cast via `unknown` after await — without generated Supabase types the
  // client cannot infer table row shapes and types them as `never`.
  const { data: roleRow, error: roleError } = await db
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (roleError || !roleRow) return null

  const role = (roleRow as unknown as { role: string }).role as 'admin' | 'viewer'

  if (role === 'admin') {
    return { userId, role, allowedLocations: [] }
  }

  const { data: locRows } = await db
    .from('user_location_access')
    .select('location_id')
    .eq('user_id', userId)

  const locations = (locRows as unknown as { location_id: string }[] | null) ?? []
  return { userId, role, allowedLocations: locations.map((r) => r.location_id) }
}

export function canAccessLocation(access: UserAccess, locationId: string): boolean {
  if (access.role === 'admin') return true
  return access.allowedLocations.includes(locationId)
}

export function canAccessExecutive(access: UserAccess): boolean {
  return access.role === 'admin'
}

// Returns nav links the user is permitted to see.
export function getAccessibleNavLinks(
  access: UserAccess
): { href: string; label: string }[] {
  const locationLinks = LOCATIONS.filter((loc) =>
    canAccessLocation(access, loc.id)
  ).map((loc) => ({ href: `/dashboard/${loc.id}`, label: loc.name }))

  if (canAccessExecutive(access)) {
    return [{ href: '/dashboard/executive', label: 'Executive' }, ...locationLinks]
  }
  return locationLinks
}
