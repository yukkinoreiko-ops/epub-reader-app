import LZ from 'lz-string';
import { CACHE_CONFIG } from '@/constants';

/**
 * Compression Service
 * Handles gzip-like compression using LZ-String for efficient storage
 */
export class CompressionService {
  /**
   * Compress data if it exceeds threshold
   */
  static compress(data: string): string {
    if (data.length < CACHE_CONFIG.compressionThreshold) {
      return data;
    }
    try {
      return LZ.compressToUTF16(data);
    } catch (error) {
      console.error('Compression failed:', error);
      return data;
    }
  }

  /**
   * Decompress data
   */
  static decompress(compressedData: string): string {
    try {
      const decompressed = LZ.decompressFromUTF16(compressedData);
      return decompressed || '';
    } catch (error) {
      console.error('Decompression failed:', error);
      return compressedData;
    }
  }

  /**
   * Calculate size in bytes
   */
  static getSize(data: string): number {
    return new Blob([data]).size;
  }

  /**
   * Estimate compression ratio
   */
  static getCompressionRatio(original: string, compressed: string): number {
    const originalSize = this.getSize(original);
    const compressedSize = this.getSize(compressed);
    return ((1 - compressedSize / originalSize) * 100).toFixed(2);
  }
}
