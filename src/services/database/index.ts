import { openDB, DBSchema as IDBSchema } from 'idb';
import { Book, Chapter, Highlight, Bookmark, Note, ReadingSession, ReadingStats, Collection, ReadingGoal, ReadingChallenge, ReaderSettings, SyncQueue, SyncMetadata, Achievement, DBSchema } from '@/types';
import { DATABASE_CONFIG } from '@/constants';
import { chapterCache } from '@/services/cache';

/**
 * Database Service using IndexedDB
 * Handles all persistent storage with proper indexing and batch operations
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private dbInstance: any = null;
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database with proper schema
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.dbInstance = await openDB<DBSchema>(DATABASE_CONFIG.name, DATABASE_CONFIG.version, {
        upgrade(db) {
          // Books store
          if (!db.objectStoreNames.contains('books')) {
            const booksStore = db.createObjectStore('books', { keyPath: 'id' });
            booksStore.createIndex('title', 'title', { unique: false });
            booksStore.createIndex('author', 'author', { unique: false });
            booksStore.createIndex('addedAt', 'addedAt', { unique: false });
            booksStore.createIndex('lastReadAt', 'lastReadAt', { unique: false });
          }

          // Chapters store
          if (!db.objectStoreNames.contains('chapters')) {
            const chaptersStore = db.createObjectStore('chapters', { keyPath: 'id' });
            chaptersStore.createIndex('bookId', 'bookId', { unique: false });
            chaptersStore.createIndex('chapterIndex', 'chapterIndex', { unique: false });
          }

          // Highlights store
          if (!db.objectStoreNames.contains('highlights')) {
            const hlStore = db.createObjectStore('highlights', { keyPath: 'id' });
            hlStore.createIndex('bookId', 'bookId', { unique: false });
            hlStore.createIndex('chapterIndex', 'chapterIndex', { unique: false });
            hlStore.createIndex('color', 'color', { unique: false });
            hlStore.createIndex('createdAt', 'createdAt', { unique: false });
          }

          // Bookmarks store
          if (!db.objectStoreNames.contains('bookmarks')) {
            const bmStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
            bmStore.createIndex('bookId', 'bookId', { unique: false });
            bmStore.createIndex('chapterIndex', 'chapterIndex', { unique: false });
            bmStore.createIndex('createdAt', 'createdAt', { unique: false });
          }

          // Notes store
          if (!db.objectStoreNames.contains('notes')) {
            const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
            notesStore.createIndex('bookId', 'bookId', { unique: false });
            notesStore.createIndex('chapterIndex', 'chapterIndex', { unique: false });
            notesStore.createIndex('isPinned', 'isPinned', { unique: false });
          }

          // Sessions store
          if (!db.objectStoreNames.contains('sessions')) {
            const sessStore = db.createObjectStore('sessions', { keyPath: 'id' });
            sessStore.createIndex('bookId', 'bookId', { unique: false });
            sessStore.createIndex('startTime', 'startTime', { unique: false });
            sessStore.createIndex('endTime', 'endTime', { unique: false });
          }

          // Stats store
          if (!db.objectStoreNames.contains('stats')) {
            db.createObjectStore('stats', { keyPath: 'bookId' });
          }

          // Collections store
          if (!db.objectStoreNames.contains('collections')) {
            const collStore = db.createObjectStore('collections', { keyPath: 'id' });
            collStore.createIndex('name', 'name', { unique: false });
            collStore.createIndex('createdAt', 'createdAt', { unique: false });
          }

          // Goals store
          if (!db.objectStoreNames.contains('goals')) {
            const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
            goalStore.createIndex('goalType', 'goalType', { unique: false });
            goalStore.createIndex('isActive', 'isActive', { unique: false });
          }

          // Challenges store
          if (!db.objectStoreNames.contains('challenges')) {
            const chalStore = db.createObjectStore('challenges', { keyPath: 'id' });
            chalStore.createIndex('type', 'type', { unique: false });
            chalStore.createIndex('startDate', 'startDate', { unique: false });
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncStore.createIndex('entityType', 'entityType', { unique: false });
            syncStore.createIndex('isSynced', 'isSynced', { unique: false });
          }

          // Sync metadata store
          if (!db.objectStoreNames.contains('syncMetadata')) {
            db.createObjectStore('syncMetadata', { keyPath: 'bookId' });
          }

          // Achievements store
          if (!db.objectStoreNames.contains('achievements')) {
            const achStore = db.createObjectStore('achievements', { keyPath: 'id' });
            achStore.createIndex('type', 'type', { unique: false });
            achStore.createIndex('earnedAt', 'earnedAt', { unique: false });
          }
        },
      });

      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // ==========================================
  // GENERIC CRUD OPERATIONS
  // ==========================================

  async getAll<K extends keyof DBSchema>(store: K): Promise<DBSchema[K][]> {
    if (!this.dbInstance) throw new Error('Database not initialized');
    try {
      return await this.dbInstance.getAll(store);
    } catch (error) {
      console.error(`Error getting all from ${String(store)}:`, error);
      return [];
    }
  }

  async get<K extends keyof DBSchema>(store: K, key: any): Promise<DBSchema[K] | undefined> {
    if (!this.dbInstance) throw new Error('Database not initialized');
    try {
      return await this.dbInstance.get(store, key);
    } catch (error) {
      console.error(`Error getting from ${String(store)}:`, error);
      return undefined;
    }
  }

  async put<K extends keyof DBSchema>(store: K, value: DBSchema[K]): Promise<any> {
    if (!this.dbInstance) throw new Error('Database not initialized');
    try {
      return await this.dbInstance.put(store, value);
    } catch (error) {
      console.error(`Error putting to ${String(store)}:`, error);
      throw error;
    }
  }

  async delete<K extends keyof DBSchema>(store: K, key: any): Promise<void> {
    if (!this.dbInstance) throw new Error('Database not initialized');
    try {
      await this.dbInstance.delete(store, key);
    } catch (error) {
      console.error(`Error deleting from ${String(store)}:`, error);
      throw error;
    }
  }

  async clear<K extends keyof DBSchema>(store: K): Promise<void> {
    if (!this.dbInstance) throw new Error('Database not initialized');
    try {
      await this.dbInstance.clear(store);
    } catch (error) {
      console.error(`Error clearing ${String(store)}:`, error);
      throw error;
    }
  }

  // ==========================================
  // BATCH OPERATIONS
  // ==========================================

  async batchPut<K extends keyof DBSchema>(store: K, values: DBSchema[K][]): Promise<void> {
    if (!this.dbInstance) throw new Error('Database not initialized');
    try {
      const tx = this.dbInstance.transaction(store, 'readwrite');
      for (const value of values) {
        tx.store.put(value);
      }
      await tx.done;
    } catch (error) {
      console.error(`Error batch putting to ${String(store)}:`, error);
      throw error;
    }
  }

  async batchDelete<K extends keyof DBSchema>(store: K, keys: any[]): Promise<void> {
    if (!this.dbInstance) throw new Error('Database not initialized');
    try {
      const tx = this.dbInstance.transaction(store, 'readwrite');
      for (const key of keys) {
        tx.store.delete(key);
      }
      await tx.done;
    } catch (error) {
      console.error(`Error batch deleting from ${String(store)}:`, error);
      throw error;
    }
  }

  // ==========================================
  // QUERY OPERATIONS
  // ==========================================

  async getByIndex<K extends keyof DBSchema>(store: K, indexName: string, value: any): Promise<DBSchema[K][]> {
    if (!this.dbInstance) throw new Error('Database not initialized');
    try {
      const tx = this.dbInstance.transaction(store, 'readonly');
      return await tx.store.index(indexName).getAll(value);
    } catch (error) {
      console.error(`Error querying index ${indexName}:`, error);
      return [];
    }
  }

  async getByIndexRange<K extends keyof DBSchema>(
    store: K,
    indexName: string,
    lower: any,
    upper: any,
    reverse: boolean = false
  ): Promise<DBSchema[K][]> {
    if (!this.dbInstance) throw new Error('Database not initialized');
    try {
      const range = IDBKeyRange.bound(lower, upper);
      const tx = this.dbInstance.transaction(store, 'readonly');
      const index = tx.store.index(indexName);
      return reverse ? await index.getAll(range, 'prev') : await index.getAll(range);
    } catch (error) {
      console.error(`Error querying index range:`, error);
      return [];
    }
  }

  // ==========================================
  // STORAGE QUOTA
  // ==========================================

  async getStorageInfo(): Promise<{ usage: number; quota: number; percentage: number }> {
    try {
      if (!navigator.storage?.estimate) {
        return { usage: 0, quota: 0, percentage: 0 };
      }
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      return {
        usage,
        quota,
        percentage: quota > 0 ? (usage / quota) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { usage: 0, quota: 0, percentage: 0 };
    }
  }

  // ==========================================
  // CLEANUP & MAINTENANCE
  // ==========================================

  async clearAllData(): Promise<void> {
    if (!this.dbInstance) throw new Error('Database not initialized');
    try {
      const stores = Object.keys(DATABASE_CONFIG.stores);
      for (const store of stores) {
        await this.clear(store as keyof DBSchema);
      }
      chapterCache.clear();
      console.log('✅ All data cleared successfully');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async exportData(): Promise<string> {
    try {
      const stores = Object.keys(DATABASE_CONFIG.stores);
      const data: any = {};

      for (const store of stores) {
        data[store] = await this.getAll(store as keyof DBSchema);
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      const stores = Object.keys(data);

      for (const store of stores) {
        if (Array.isArray(data[store])) {
          await this.batchPut(store as keyof DBSchema, data[store]);
        }
      }

      console.log('✅ Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();
