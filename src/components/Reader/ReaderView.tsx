import React, { useEffect, useState } from 'react';
import { Chapter, ReaderSettings } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import { useTextToSpeech } from '@/hooks';
import './ReaderView.css';

interface ReaderViewProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  onProgressChange: (progress: number) => void;
  onChapterChange: (index: number) => void;
}

export function ReaderView({ chapters, currentChapterIndex, onProgressChange, onChapterChange }: ReaderViewProps) {
  const { settings, updateSettings } = useSettings();
  const { speaking, speak, stop, rate, setRate, voices } = useTextToSpeech();
  const [selectedText, setSelectedText] = useState<string>('');

  const currentChapter = chapters[currentChapterIndex];

  useEffect(() => {
    // Track scroll position for progress
    const handleScroll = () => {
      const element = document.querySelector('.reader-content');
      if (element) {
        const scrollPercentage = (element.scrollLeft / (element.scrollWidth - element.clientWidth)) * 100;
        onProgressChange(Math.min(scrollPercentage, 100));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onProgressChange]);

  const handleTextSelection = () => {
    const selected = window.getSelection()?.toString();
    if (selected) {
      setSelectedText(selected);
    }
  };

  const getReaderStyles = () => {
    const themeColors: Record<string, any> = {
      light: { bg: '#FBFBFC', text: '#1E293B' },
      sepia: { bg: '#FBF0D9', text: '#4A3B32' },
      dark: { bg: '#18181B', text: '#E4E4E7' },
      oled: { bg: '#000000', text: '#F4F4F5' },
      emerald: { bg: '#E8F5E9', text: '#1B4332' },
    };

    const theme = themeColors[settings.theme];
    return {
      backgroundColor: theme.bg,
      color: theme.text,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineHeight,
      margin: `${settings.margin}px`,
    };
  };

  if (!currentChapter) {
    return <div className="reader-empty">No chapters available</div>;
  }

  return (
    <div className="reader-view">
      {/* Toolbar */}
      <div className="reader-toolbar">
        <div className="toolbar-controls">
          <button onClick={() => onChapterChange(Math.max(0, currentChapterIndex - 1))} disabled={currentChapterIndex === 0}>
            ← Previous
          </button>

          {speaking ? (
            <button onClick={stop} className="btn-tts-active">
              ⏸ Stop TTS
            </button>
          ) : (
            <button onClick={() => speak(currentChapter.text)}>
              🔊 Read Aloud
            </button>
          )}

          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            title={`TTS Rate: ${rate.toFixed(1)}x`}
            className="tts-rate-slider"
          />

          <button onClick={() => onChapterChange(Math.min(chapters.length - 1, currentChapterIndex + 1))} disabled={currentChapterIndex === chapters.length - 1}>
            Next →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="reader-content" style={getReaderStyles()} onMouseUp={handleTextSelection}>
        <h2 className="chapter-title">{currentChapter.title}</h2>
        <div className="chapter-text">{currentChapter.text}</div>
      </div>

      {/* Context Menu for Selection */}
      {selectedText && (
        <div className="selection-menu">
          <button onClick={() => speak(selectedText)} className="menu-item">
            🔊 Read Selection
          </button>
          <button className="menu-item" onClick={() => console.log('Highlight:', selectedText)}>
            🖍 Highlight
          </button>
          <button className="menu-item" onClick={() => navigator.clipboard.writeText(selectedText)}>
            📋 Copy
          </button>
        </div>
      )}

      {/* Chapter Navigation */}
      <div className="chapter-nav">
        <span className="chapter-info">
          Chapter {currentChapterIndex + 1} of {chapters.length}
        </span>
        <input
          type="range"
          min="0"
          max={chapters.length - 1}
          value={currentChapterIndex}
          onChange={(e) => onChapterChange(parseInt(e.target.value))}
          className="chapter-slider"
        />
      </div>
    </div>
  );
}
