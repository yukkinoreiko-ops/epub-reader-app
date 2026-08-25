/**
 * Export utilities for common patterns
 */

import { Book, Highlight, Bookmark, Note, ReadingSession } from '@/types';

/**
 * Export data to Markdown
 */
export async function exportToMarkdown(
  books: Book[],
  highlights: Highlight[],
  bookmarks: Bookmark[],
  notes: Note[]
): Promise<string> {
  let markdown = '# EPUB Reader Export\n\n';
  markdown += `Generated: ${new Date().toLocaleString()}\n\n`;

  // Books section
  markdown += '## 📚 Books\n\n';
  for (const book of books) {
    markdown += `### ${book.title}\n`;
    markdown += `- Author: ${book.author}\n`;
    markdown += `- Progress: ${book.progress}%\n`;
    markdown += `- Added: ${new Date(book.addedAt).toLocaleDateString()}\n\n`;
  }

  // Highlights section
  markdown += '## 📝 Highlights\n\n';
  for (const hl of highlights) {
    markdown += `### ${hl.bookTitle} (Chapter ${hl.chapterIndex + 1})\n`;
    markdown += `> ${hl.selectedText}\n\n`;
    if (hl.note) {
      markdown += `**Note:** ${hl.note}\n\n`;
    }
  }

  // Bookmarks section
  markdown += '## 🔖 Bookmarks\n\n';
  for (const bm of bookmarks) {
    markdown += `- ${bm.bookTitle}: ${bm.chapterTitle}\n`;
  }

  // Notes section
  markdown += '## ✍️ Notes\n\n';
  for (const note of notes) {
    markdown += `### ${note.title}\n`;
    markdown += `${note.content}\n\n`;
  }

  return markdown;
}

/**
 * Export data to JSON
 */
export async function exportToJSON(
  books: Book[],
  highlights: Highlight[],
  bookmarks: Bookmark[],
  notes: Note[]
): Promise<string> {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    data: {
      books,
      highlights,
      bookmarks,
      notes,
    },
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Download file
 */
export function downloadFile(content: string, fileName: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import JSON data
 */
export async function importFromJSON(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
