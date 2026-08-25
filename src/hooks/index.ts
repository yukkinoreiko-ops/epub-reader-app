import { useEffect, useState } from 'react';
import { ReaderSettings } from '@/types';
import { db } from '@/services/database';
import { DEFAULT_SETTINGS } from '@/constants';

/**
 * Hook to manage reader settings
 */
export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await db.get('settings', 'reader');
      if (stored) {
        setSettings(stored);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<ReaderSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await db.put('settings', updated);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return { settings, loading, updateSettings };
}

/**
 * Hook to track reading session
 */
export function useReadingSession(bookId: string) {
  const [startTime] = useState(Date.now());
  const [wordsRead, setWordsRead] = useState(0);

  const endSession = async () => {
    const duration = (Date.now() - startTime) / (1000 * 60); // in minutes
    const wpm = wordsRead > 0 ? Math.round(wordsRead / duration) : 0;
    return { duration, wordsRead, wpm };
  };

  return { wordsRead, setWordsRead, endSession };
}

/**
 * Hook for text-to-speech
 */
export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const speak = (text: string, voiceIndex: number = 0) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    if (voices[voiceIndex]) {
      utterance.voice = voices[voiceIndex];
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return { speaking, speak, stop, rate, setRate, voices };
}

/**
 * Hook for full-text search
 */
export function useBookSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const search = async (bookId: string, query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const chapters = await db.getByIndex('chapters', 'bookId', bookId);
      const matches = chapters.filter((ch) => ch.text.toLowerCase().includes(query.toLowerCase()));
      setResults(matches);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  return { results, searching, search };
}

/**
 * Hook for managing highlights
 */
export function useHighlights(bookId: string) {
  const [highlights, setHighlights] = useState<any[]>([]);

  const loadHighlights = async () => {
    try {
      const items = await db.getByIndex('highlights', 'bookId', bookId);
      setHighlights(items);
    } catch (error) {
      console.error('Failed to load highlights:', error);
    }
  };

  const addHighlight = async (highlight: any) => {
    try {
      await db.put('highlights', highlight);
      setHighlights((prev) => [...prev, highlight]);
    } catch (error) {
      console.error('Failed to add highlight:', error);
    }
  };

  const deleteHighlight = async (id: string) => {
    try {
      await db.delete('highlights', id);
      setHighlights((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Failed to delete highlight:', error);
    }
  };

  return { highlights, loadHighlights, addHighlight, deleteHighlight };
}

/**
 * Hook for managing bookmarks
 */
export function useBookmarks(bookId: string) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  const loadBookmarks = async () => {
    try {
      const items = await db.getByIndex('bookmarks', 'bookId', bookId);
      setBookmarks(items.sort((a, b) => a.chapterIndex - b.chapterIndex));
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  };

  const addBookmark = async (bookmark: any) => {
    try {
      await db.put('bookmarks', bookmark);
      setBookmarks((prev) => [...prev, bookmark].sort((a, b) => a.chapterIndex - b.chapterIndex));
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      await db.delete('bookmarks', id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
    }
  };

  return { bookmarks, loadBookmarks, addBookmark, deleteBookmark };
}

/**
 * Hook for managing notes
 */
export function useNotes(bookId: string) {
  const [notes, setNotes] = useState<any[]>([]);

  const loadNotes = async () => {
    try {
      const items = await db.getByIndex('notes', 'bookId', bookId);
      setNotes(items.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const addNote = async (note: any) => {
    try {
      await db.put('notes', note);
      setNotes((prev) => [note, ...prev]);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const updateNote = async (id: string, updates: any) => {
    try {
      const note = await db.get('notes', id);
      if (note) {
        const updated = { ...note, ...updates, updatedAt: Date.now() };
        await db.put('notes', updated);
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await db.delete('notes', id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return { notes, loadNotes, addNote, updateNote, deleteNote };
}

/**
 * Hook for async operations with loading state
 */
export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { loading, error, data, execute };
}
