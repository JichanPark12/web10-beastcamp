export const SITE_COLORS = {
  INTERPARK: {
    displayName: '인터파크',
    color: '#8b5cf6',
    backgroundColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    textColor: 'text-purple-600',
    key: 'interpark',
  },
  YES24: {
    displayName: 'YES24',
    color: '#3b82f6',
    backgroundColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    textColor: 'text-blue-600',
    key: 'yes24',
  },
  MELON_TICKET: {
    displayName: '멜론티켓',
    color: '#10b981',
    backgroundColor: 'bg-green-50',
    borderColor: 'border-green-100',
    textColor: 'text-green-600',
    key: 'melon',
  },
} as const;

export const ACTIVE_SITES = ['INTERPARK', 'YES24', 'MELON_TICKET'] as const;

export type SiteKey = (typeof ACTIVE_SITES)[number];
