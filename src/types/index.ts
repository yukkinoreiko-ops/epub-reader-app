// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type ThemeMode = 'light' | 'sepia' | 'dark' | 'oled' | 'emerald';
export type FontFamily = 'Inter' | 'Merriweather' | 'Georgia' | 'Fira Code' | 'Open Sans';
export type TextAlignment = 'left' | 'justify';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

// ==========================================
// BOOK & CONTENT
// ==========================================

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  addedAt: number;
  lastReadAt: number;
  progress: number; // 0-100
  totalChapters: number;
  currentChapter: number;
  currentCfi?: string;
  fileData?: ArrayBuffer;
  fileSize: number; // in bytes
  tags: string[];
  content: Chapter[];
  ratings?: number; // 1-5
  review?: string;
  collections?: string[]; // collection IDs
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  title: string;
  text: string;
  chapterIndex: number;
  wordCount: number;
  cfi?: string; // Canonical Fragment Identifier
}

// ==========================================
// HIGHLIGHTS & ANNOTATIONS
// ==========================================

export interface Highlight {
  id: string;
  bookId: string;
  bookTitle: string;
  chapterIndex: number;
  chapterTitle?: string;
  cfi: string;
  selectedText: string;
  note?: string;
  color: HighlightColor;
  createdAt: number;
  updatedAt: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  bookTitle: string;
  chapterTitle: string;
  chapterIndex: number;
  cfi: string;
  progress: number;
  createdAt: number;
  label?: string;
}

export interface Note {
  id: string;
  bookId: string;
  bookTitle: string;
  chapterIndex: number;
  cfi?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
}

// ==========================================
// READING SESSION & ANALYTICS
// ==========================================

export interface ReadingSession {
  id: string;
  bookId: string;
  bookTitle: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  pagesRead: number;
  wordsRead: number;
  startChapter: number;
  endChapter: number;
  wpm: number; // words per minute
  device?: string;
}

export interface ReadingStats {
  bookId: string;
  totalTimeSpent: number; // in minutes
  totalSessions: number;
  averageSessionDuration: number;
  averageWPM: number;
  totalWordsRead: number;
  lastReadDate: number;
  readStreak: number;
  completionDate?: number;
}

export interface Achievement {
  id: string;
  userId?: string;
  type: 'milestone' | 'streak' | 'challenge';
  title: string;
  description: string;
  icon: string;
  earnedAt: number;
  progress?: number;
  target?: number;
}

// ==========================================
// COLLECTIONS & LISTS
// ==========================================

export interface Collection {
  id: string;
  name: string;
  description?: string;
  bookIds: string[];
  color?: string;
  icon?: string;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  coverImage?: string;
}

export interface ReadingGoal {
  id: string;
  title: string;
  description?: string;
  goalType: 'books' | 'hours' | 'pages' | 'days';
  targetValue: number;
  currentValue: number;
  deadline?: number;
  createdAt: number;
  completedAt?: number;
  isActive: boolean;
}

export interface ReadingChallenge {
  id: string;
  name: string;
  description: string;
  type: 'books' | 'genre' | 'author' | 'pages';
  target: number;
  current: number;
  reward?: string;
  startDate: number;
  endDate?: number;
  participants?: string[];
}

// ==========================================
// SETTINGS & PREFERENCES
// ==========================================

export interface ReaderSettings {
  theme: ThemeMode;
  fontFamily: FontFamily;
  fontSize: number; // 12 to 36
  lineHeight: number; // 1.2 to 2.2
  margin: number; // 8 to 48
  textAlign: TextAlignment;
  dualPage: boolean;
  ttsRate: number; // 0.5 to 2.0
  ttsVoiceIndex: number;
  autoScroll: boolean;
  autoScrollSpeed: number;
  enableNotifications: boolean;
  enableSync: boolean;
  autoBackup: boolean;
}

export interface AppPreferences {
  theme: ThemeMode;
  language: string;
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  defaultLibraryView: 'grid' | 'list';
  itemsPerPage: number;
  enableDarkMode: boolean;
}

// ==========================================
// CACHE & SYNC
// ==========================================

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt: number;
  size: number; // in bytes
}

export interface SyncMetadata {
  bookId: string;
  lastSyncedAt: number;
  isConflicted: boolean;
  localVersion: number;
  remoteVersion: number;
}

export interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'book' | 'highlight' | 'bookmark' | 'note';
  entityId: string;
  data: any;
  timestamp: number;
  isSynced: boolean;
}

// ==========================================
// DATABASE
// ==========================================

export interface DBSchema {
  books: Book;
  chapters: Chapter;
  highlights: Highlight;
  bookmarks: Bookmark;
  notes: Note;
  sessions: ReadingSession;
  stats: ReadingStats;
  collections: Collection;
  goals: ReadingGoal;
  challenges: ReadingChallenge;
  settings: ReaderSettings;
  syncQueue: SyncQueue;
  syncMetadata: SyncMetadata;
  achievements: Achievement;
}

// ==========================================
// API & EXPORT
// ==========================================

export interface ExportOptions {
  format: 'markdown' | 'json' | 'pdf' | 'epub';
  includeNotes: boolean;
  includeHighlights: boolean;
  includeMetadata: boolean;
  fileName?: string;
}

export interface ImportOptions {
  file: File;
  autoTag?: boolean;
  addToCollection?: string;
}

export interface SearchOptions {
  query: string;
  searchIn: 'title' | 'content' | 'all';
  filterByTag?: string[];
  filterByCollection?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  bookId: string;
  bookTitle: string;
  chapterIndex: number;
  chapterTitle: string;
  snippet: string;
  matchType: 'title' | 'content' | 'note';
}
