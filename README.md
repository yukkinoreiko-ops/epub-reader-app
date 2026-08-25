# 📚 EPUB Reader Plus

Advanced EPUB reader application with optimized data management, rich features, and offline support.

## ✨ Features

### Core Reading Features
- 📖 EPUB file rendering with proper chapter navigation
- 🎨 5 reading themes (Light, Sepia, Dark, OLED, Emerald)
- 🔤 Customizable typography (fonts, sizes, line height, margins)
- 🎤 Text-to-Speech (TTS) support with rate control
- 🔍 Full-text search within books
- 🏷️ Bookmark and highlight system with color coding

### Data Management & Optimization
- ⚡ Intelligent caching with LRU strategy
- 🗜️ Gzip compression for large files
- 💾 IndexedDB with advanced indexing
- 🔄 Batch operations for efficient updates
- 📊 Data synchronization and versioning
- 🚀 Lazy loading for chapter content

### Reading Analytics
- 📈 Reading progress tracking (time spent, words per minute)
- 📊 Reading statistics dashboard
- 🎯 Reading goals and challenges
- 📉 Per-book analytics
- 🏆 Achievement system

### Annotations & Notes
- ✍️ Rich text note-taking
- 🎨 Color-coded highlights (5 colors)
- 📌 Bookmark system with quick jump
- 📥 Export annotations to Markdown, PDF, or JSON
- 🔗 Cross-book highlight linking

### Collections & Organization
- 📂 Create custom book collections/playlists
- 🏷️ Advanced tagging system
- ⭐ Book ratings and reviews
- 🔍 Smart search with filters
- 📋 Reading lists and wishlists

### Sync & Offline
- 📱 Offline-first architecture
- 🔄 Cloud sync ready (Firebase/backend integration)
- 🔌 Service Worker support
- 🌐 Works seamlessly online and offline

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Library/
│   ├── Reader/
│   ├── Annotations/
│   └── Settings/
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── services/           # Business logic
│   ├── database/
│   ├── cache/
│   ├── compression/
│   └── sync/
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── styles/             # Global styles
├── constants/          # Application constants
└── App.tsx            # Root component
```

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB with IDB wrapper
- **Compression**: LZ-String for data compression
- **Build Tool**: Vite

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.
