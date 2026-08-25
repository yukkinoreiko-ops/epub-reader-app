import { SyncQueue, SyncMetadata } from '@/types';
import { db } from '@/services/database';
import { SYNC_CONFIG } from '@/constants';

/**
 * Sync Service
 * Handles data synchronization with backend and conflict resolution
 */
export class SyncService {
  private static instance: SyncService;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    if (!SYNC_CONFIG.enabled) return;

    // Start auto sync
    if (SYNC_CONFIG.autoSync) {
      this.startAutoSync();
    }

    // Listen for online/offline events
    window.addEventListener('online', () => this.onOnline());
    window.addEventListener('offline', () => this.onOffline());
  }

  /**
   * Start automatic sync
   */
  private startAutoSync(): void {
    this.syncInterval = setInterval(async () => {
      await this.sync();
    }, SYNC_CONFIG.syncInterval);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Handle online event
   */
  private async onOnline(): Promise<void> {
    console.log('🌐 Back online, syncing...');
    await this.sync();
  }

  /**
   * Handle offline event
   */
  private onOffline(): void {
    console.log('📴 Offline, queuing changes...');
  }

  /**
   * Add item to sync queue
   */
  async queueChange(
    action: 'create' | 'update' | 'delete',
    entityType: 'book' | 'highlight' | 'bookmark' | 'note',
    entityId: string,
    data?: any
  ): Promise<void> {
    const queueItem: SyncQueue = {
      id: `${entityType}-${entityId}-${Date.now()}`,
      action,
      entityType,
      entityId,
      data,
      timestamp: Date.now(),
      isSynced: false,
    };

    await db.put('syncQueue', queueItem);
  }

  /**
   * Main sync function
   */
  async sync(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    try {
      const queuedItems = await db.getAll('syncQueue');
      const unsyncedItems = queuedItems.filter((item) => !item.isSynced);

      if (unsyncedItems.length === 0) {
        console.log('✅ All data synced');
        return;
      }

      // Process in batches
      for (let i = 0; i < unsyncedItems.length; i += SYNC_CONFIG.batchSize) {
        const batch = unsyncedItems.slice(i, i + SYNC_CONFIG.batchSize);
        await this.processBatch(batch);
      }

      console.log(`✅ Synced ${unsyncedItems.length} items`);
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a batch of sync items
   */
  private async processBatch(items: SyncQueue[]): Promise<void> {
    for (const item of items) {
      let retries = 0;
      let success = false;

      while (retries < SYNC_CONFIG.maxRetries && !success) {
        try {
          // Here you would call your backend API
          // await this.uploadToServer(item);

          // For now, just mark as synced
          await db.put('syncQueue', { ...item, isSynced: true });
          success = true;
        } catch (error) {
          retries++;
          if (retries < SYNC_CONFIG.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, SYNC_CONFIG.retryDelay));
          }
        }
      }

      if (!success) {
        console.error(`Failed to sync ${item.entityType} ${item.entityId} after ${SYNC_CONFIG.maxRetries} retries`);
      }
    }
  }

  /**
   * Check for conflicts
   */
  async checkConflicts(bookId: string): Promise<boolean> {
    const metadata = await db.get('syncMetadata', bookId);
    return metadata?.isConflicted || false;
  }

  /**
   * Resolve conflict (local version wins)
   */
  async resolveConflict(bookId: string): Promise<void> {
    const metadata = await db.get('syncMetadata', bookId);
    if (metadata) {
      await db.put('syncMetadata', {
        ...metadata,
        isConflicted: false,
        localVersion: (metadata.localVersion || 0) + 1,
      });
    }
  }

  /**
   * Get sync queue status
   */
  async getSyncStatus(): Promise<{ total: number; synced: number; pending: number }> {
    const items = await db.getAll('syncQueue');
    const synced = items.filter((i) => i.isSynced).length;
    return {
      total: items.length,
      synced,
      pending: items.length - synced,
    };
  }
}

export const syncService = SyncService.getInstance();
