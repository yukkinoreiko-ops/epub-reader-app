import React, { useEffect, useState } from 'react';
import { LibraryProvider } from '@/context/LibraryContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';
import { db } from '@/services/database';
import { syncService } from '@/services/sync';
import { LibraryView } from '@/components/Library/LibraryView';
import { ReaderView } from '@/components/Reader/ReaderView';
import { ToastContainer } from '@/components/UI/ToastContainer';
import { Loading } from '@/components/UI/Loading';
import { Book, Chapter } from '@/types';
import './App.css';

function AppContent() {
  const [currentView, setCurrentView] = useState<'library' | 'reader'>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [appLoading, setAppLoading] = useState(true);
  const { addToast } = useToast();
  const { isLoading } = useLoading();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await db.initialize();
      addToast('Database initialized', 'success');

      // Initialize sync service
      await syncService.initialize();
      addToast('Sync service started', 'success');

      // Request storage persistence if available
      if (navigator.storage?.persist) {
        const persistent = await navigator.storage.persist();
        if (persistent) {
          console.log('✅ Storage persisted');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize app';
      addToast(errorMessage, 'error');
      console.error('App initialization error:', error);
    } finally {
      setAppLoading(false);
    }
  };

  const handleSelectBook = async (book: Book) => {
    try {
      // Load chapters for the book
      const bookChapters = await db.getByIndex('chapters', 'bookId', book.id);
      setChapters(bookChapters.sort((a, b) => a.chapterIndex - b.chapterIndex));
      setSelectedBook(book);
      setCurrentChapterIndex(book.currentChapter || 0);
      setCurrentView('reader');
    } catch (error) {
      addToast('Failed to load book chapters', 'error');
    }
  };

  const handleProgressChange = async (progress: number) => {
    if (selectedBook) {
      try {
        await db.put('books', {
          ...selectedBook,
          progress: Math.round(progress),
          lastReadAt: Date.now(),
        });
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  const handleChapterChange = (index: number) => {
    setCurrentChapterIndex(index);
    if (selectedBook) {
      db.put('books', {
        ...selectedBook,
        currentChapter: index,
        lastReadAt: Date.now(),
      }).catch((error) => console.error('Failed to update chapter:', error));
    }
  };

  const handleBackToLibrary = () => {
    setCurrentView('library');
    setSelectedBook(null);
  };

  if (appLoading) {
    return <Loading message="Initializing EPUB Reader..." fullScreen />;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          {currentView === 'reader' && (
            <button className="btn-back" onClick={handleBackToLibrary}>
              ← Back to Library
            </button>
          )}
          <h1 className="app-title">📖 EPUB Reader</h1>
          <div className="header-actions">
            <a href="#settings" className="header-link">⚙️ Settings</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {isLoading && <Loading fullScreen />}

        {currentView === 'library' && <LibraryView viewMode="grid" onSelectBook={handleSelectBook} />}

        {currentView === 'reader' && selectedBook && chapters.length > 0 && (
          <ReaderView
            chapters={chapters}
            currentChapterIndex={currentChapterIndex}
            onProgressChange={handleProgressChange}
            onChapterChange={handleChapterChange}
          />
        )}
      </main>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export function App() {
  return (
    <LibraryProvider>
      <SettingsProvider>
        <ToastProvider>
          <LoadingProvider>
            <AppContent />
          </LoadingProvider>
        </ToastProvider>
      </SettingsProvider>
    </LibraryProvider>
  );
}

export default App;
