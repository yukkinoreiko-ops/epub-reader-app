import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Book, ReaderSettings } from '@/types';
import { db } from '@/services/database';
import { DEFAULT_SETTINGS } from '@/constants';

interface LibraryContextType {
  books: Book[];
  loading: boolean;
  error: string | null;
  addBook: (book: Book) => Promise<void>;
  removeBook: (bookId: string) => Promise<void>;
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
  getBook: (bookId: string) => Book | undefined;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const allBooks = await db.getAll('books');
      setBooks(allBooks.sort((a, b) => b.lastReadAt - a.lastReadAt));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (book: Book) => {
    try {
      await db.put('books', book);
      setBooks((prev) => [book, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add book');
      throw err;
    }
  };

  const removeBook = async (bookId: string) => {
    try {
      await db.delete('books', bookId);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove book');
      throw err;
    }
  };

  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    try {
      const book = await db.get('books', bookId);
      if (book) {
        const updated = { ...book, ...updates, updatedAt: Date.now() };
        await db.put('books', updated);
        setBooks((prev) => prev.map((b) => (b.id === bookId ? updated : b)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update book');
      throw err;
    }
  };

  const getBook = (bookId: string) => books.find((b) => b.id === bookId);

  return (
    <LibraryContext.Provider value={{ books, loading, error, addBook, removeBook, updateBook, getBook }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
}
