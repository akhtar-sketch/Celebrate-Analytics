import type { LocationConfig } from '@/types'

export const LOCATIONS: LocationConfig[] = [
  {
    id: 'springfield',
    name: 'Springfield',
    googleLocationId: 'springfield',
    metaLocationIds: ['west-republic', 'north-glenstone', 'north-lindbergh', 'olathe'],
    subLocations: [
      { id: 'west-republic',   name: 'West Republic' },
      { id: 'north-glenstone', name: 'North Glenstone' },
      { id: 'north-lindbergh', name: 'North Lindbergh' },
    ],
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
    id: 'austin',
    name: 'Austin',
    googleLocationId: 'austin',
    metaLocationIds: ['austin'],
  },
  {
    id: 'new-mexico',
    name: 'New Mexico',
    googleLocationId: 'new-mexico',
    metaLocationIds: ['new-mexico'],
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
