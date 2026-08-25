// ==========================================
// APPLICATION CONSTANTS
// ==========================================

export const THEME_COLORS = {
  light: {
    bg: '#FBFBFC',
    text: '#1E293B',
    border: '#E2E8F0',
  },
  sepia: {
    bg: '#FBF0D9',
    text: '#4A3B32',
    border: '#D5C4A1',
  },
  dark: {
    bg: '#18181B',
    text: '#E4E4E7',
    border: '#3F3F46',
  },
  oled: {
    bg: '#000000',
    text: '#F4F4F5',
    border: '#222222',
  },
  emerald: {
    bg: '#E8F5E9',
    text: '#1B4332',
    border: '#A3D9A5',
  },
} as const;

export const HIGHLIGHT_COLORS = {
  yellow: '#fef08a',
  green: '#bbf7d0',
  blue: '#bfdbfe',
  pink: '#fbcfe8',
  purple: '#e9d5ff',
} as const;

export const FONT_FAMILIES = ['Inter', 'Merriweather', 'Georgia', 'Fira Code', 'Open Sans'] as const;

export const DEFAULT_SETTINGS = {
  theme: 'sepia' as const,
  fontFamily: 'Georgia' as const,
  fontSize: 18,
  lineHeight: 1.6,
  margin: 24,
  textAlign: 'left' as const,
  dualPage: false,
  ttsRate: 1.0,
  ttsVoiceIndex: 0,
  autoScroll: false,
  autoScrollSpeed: 1,
  enableNotifications: true,
  enableSync: true,
  autoBackup: true,
};

export const DEFAULT_PREFERENCES = {
  theme: 'sepia' as const,
  language: 'en',
  autoSave: true,
  autoSaveInterval: 30,
  defaultLibraryView: 'grid' as const,
  itemsPerPage: 20,
  enableDarkMode: false,
};

export const DATABASE_CONFIG = {
  name: 'EPUBReaderDB',
  version: 2,
  stores: {
    books: { keyPath: 'id', indexes: ['title', 'author', 'tags', 'addedAt', 'lastReadAt'] },
    chapters: { keyPath: 'id', indexes: ['bookId', 'chapterIndex'] },
    highlights: { keyPath: 'id', indexes: ['bookId', 'chapterIndex', 'color', 'createdAt'] },
    bookmarks: { keyPath: 'id', indexes: ['bookId', 'chapterIndex', 'createdAt'] },
    notes: { keyPath: 'id', indexes: ['bookId', 'chapterIndex', 'tags', 'isPinned'] },
    sessions: { keyPath: 'id', indexes: ['bookId', 'startTime', 'endTime'] },
    stats: { keyPath: 'bookId' },
    collections: { keyPath: 'id', indexes: ['name', 'createdAt'] },
    goals: { keyPath: 'id', indexes: ['goalType', 'isActive', 'createdAt'] },
    challenges: { keyPath: 'id', indexes: ['type', 'startDate'] },
    settings: { keyPath: 'key' },
    syncQueue: { keyPath: 'id', indexes: ['entityType', 'entityId', 'isSynced'] },
    syncMetadata: { keyPath: 'bookId' },
    achievements: { keyPath: 'id', indexes: ['type', 'earnedAt'] },
  } as const,
};

export const CACHE_CONFIG = {
  maxSize: 100 * 1024 * 1024, // 100MB
  maxEntries: 1000,
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  compressionThreshold: 1024, // compress files larger than 1KB
};

export const READING_GOALS = {
  daily: { books: 1, hours: 2, pages: 50, days: 1 },
  weekly: { books: 3, hours: 10, pages: 300, days: 7 },
  monthly: { books: 10, hours: 40, pages: 1200, days: 30 },
  yearly: { books: 52, hours: 500, pages: 15000, days: 365 },
} as const;

export const ACHIEVEMENTS = {
  firstBook: { title: 'Bookworm Debut', description: 'Complete your first book', icon: '📚' },
  fiveBooks: { title: 'Five Star Reader', description: 'Complete 5 books', icon: '⭐' },
  tenBooks: { title: 'Bibliophile', description: 'Complete 10 books', icon: '📖' },
  hundredHours: { title: 'Reading Marathon', description: 'Read for 100 hours', icon: '🏃' },
  streak7Days: { title: 'Consistent Reader', description: '7-day reading streak', icon: '🔥' },
  streak30Days: { title: 'Dedicated Reader', description: '30-day reading streak', icon: '🌟' },
} as const;

export const STORAGE_LIMITS = {
  warningThreshold: 0.8, // 80% of quota
  criticalThreshold: 0.95, // 95% of quota
  estimateCheckInterval: 60000, // check every minute
};

export const SYNC_CONFIG = {
  enabled: true,
  autoSync: true,
  syncInterval: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
  batchSize: 50,
};

export const ROUTES = {
  home: '#/',
  library: '#/library',
  reader: '#/reader/:id',
  annotations: '#/annotations',
  bookmarks: '#/bookmarks',
  stats: '#/stats',
  settings: '#/settings',
  collections: '#/collections',
  goals: '#/goals',
  challenges: '#/challenges',
  profile: '#/profile',
} as const;

export const ERROR_MESSAGES = {
  dbInitFailed: 'Failed to initialize database',
  bookNotFound: 'Book not found',
  importFailed: 'Failed to import book',
  exportFailed: 'Failed to export data',
  syncFailed: 'Sync failed, will retry automatically',
  storageQuotaExceeded: 'Storage quota exceeded',
  networkError: 'Network error occurred',
} as const;

export const SUCCESS_MESSAGES = {
  bookAdded: 'Book added successfully',
  bookDeleted: 'Book deleted successfully',
  exported: 'Data exported successfully',
  synced: 'Sync completed successfully',
  settingsSaved: 'Settings saved',
} as const;
