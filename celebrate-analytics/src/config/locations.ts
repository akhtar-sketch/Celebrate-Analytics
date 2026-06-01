import type { LocationConfig } from '@/types'

export const LOCATIONS: LocationConfig[] = [
  {
    id: 'springfield',
    name: 'Springfield',
    googleLocationId: 'springfield',
    metaLocationIds: ['west-republic', 'north-glenstone', 'lindbergh'],
  },
  {
    id: 'san-antonio',
    name: 'San Antonio',
    googleLocationId: 'san-antonio',
    metaLocationIds: ['san-antonio'],
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas',
    googleLocationId: 'las-vegas',
    metaLocationIds: ['las-vegas'],
  },
  {
    id: 'chicago',
    name: 'Chicago',
    googleLocationId: 'chicago',
    metaLocationIds: [],
  },
  {
    id: 'austin-main',
    name: 'Austin Main',
    googleLocationId: 'austin-main',
    metaLocationIds: [],
  },
  {
    id: 'new-mexico',
    name: 'New Mexico',
    googleLocationId: 'new-mexico',
    metaLocationIds: ['new-mexico'],
  },
  {
    id: 'kansas-city',
    name: 'Kansas City',
    googleLocationId: 'kansas-city',
    metaLocationIds: ['olathe'],
  },
  {
    id: 'austin-ed',
    name: 'Austin ED',
    googleLocationId: 'austin-ed',
    metaLocationIds: [],
  },
]

export function getLocation(id: string): LocationConfig | undefined {
  return LOCATIONS.find((l) => l.id === id)
}

export function getAllLocationIds(loc: LocationConfig): string[] {
  const ids: string[] = []
  if (loc.googleLocationId) ids.push(loc.googleLocationId)
  ids.push(...loc.metaLocationIds)
  return ids
}
