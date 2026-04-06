import type { Book } from '../types/document';

interface Props {
  book: Book;
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onAddChapter: () => void;
  onUpdateBookTitle: (title: string) => void;
}

export default function Sidebar({
  book,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
  onUpdateBookTitle,
}: Props) {
  return (
    <aside className="no-print w-56 flex-shrink-0 bg-gray-900 text-gray-100 flex flex-col h-screen">
      {/* 책 제목 */}
      <div className="p-4 border-b border-gray-700">
        <input
          className="w-full bg-transparent text-sm font-semibold text-white placeholder-gray-500 focus:outline-none"
          value={book.title}
          onChange={(e) => onUpdateBookTitle(e.target.value)}
          placeholder="책 제목"
        />
      </div>

      {/* 챕터 목록 */}
      <nav className="flex-1 overflow-y-auto p-2">
        <p className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wider">챕터</p>
        {book.chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => onSelectChapter(chapter.id)}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              chapter.id === activeChapterId
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {chapter.title}
          </button>
        ))}
      </nav>

      {/* 챕터 추가 */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={onAddChapter}
          className="w-full py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded transition-colors"
        >
          + 챕터 추가
        </button>
      </div>
    </aside>
  );
}
