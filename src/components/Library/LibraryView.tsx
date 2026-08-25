import React, { useState } from 'react';
import { Book } from '@/types';
import { useLibrary } from '@/context/LibraryContext';
import { useToast } from '@/context/ToastContext';
import { generateId, formatDate } from '@/utils';
import './LibraryView.css';

interface LibraryViewProps {
  viewMode: 'grid' | 'list';
  onSelectBook: (book: Book) => void;
}

export function LibraryView({ viewMode, onSelectBook }: LibraryViewProps) {
  const { books, loading, removeBook } = useLibrary();
  const { addToast } = useToast();
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const filteredBooks = filterTag
    ? books.filter((book) => book.tags.includes(filterTag))
    : books;

  const handleDelete = async (bookId: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        await removeBook(bookId);
        addToast('Book deleted successfully', 'success');
      } catch (error) {
        addToast('Failed to delete book', 'error');
      }
    }
  };

  const allTags = Array.from(new Set(books.flatMap((b) => b.tags)));

  if (loading) {
    return <div className="library-loading">Loading library...</div>;
  }

  return (
    <div className="library-view">
      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="tags-filter">
          <button
            className={`tag-filter ${filterTag === null ? 'active' : ''}`}
            onClick={() => setFilterTag(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`tag-filter ${filterTag === tag ? 'active' : ''}`}
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Books Display */}
      {filteredBooks.length === 0 ? (
        <div className="library-empty">
          <p>📚 No books in your library</p>
          <p>Add an EPUB file to get started</p>
        </div>
      ) : (
        <div className={`books-${viewMode}`}>
          {filteredBooks.map((book) => (
            <div key={book.id} className="book-card">
              {book.coverUrl && <img src={book.coverUrl} alt={book.title} className="book-cover" />}
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <div className="book-meta">
                  <span className="progress">{book.progress}%</span>
                  <span className="last-read">{formatDate(book.lastReadAt)}</span>
                </div>
                <div className="book-actions">
                  <button onClick={() => onSelectBook(book)} className="btn-read">
                    📖 Read
                  </button>
                  <button onClick={() => handleDelete(book.id)} className="btn-delete">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
