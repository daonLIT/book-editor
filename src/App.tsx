import { useState } from 'react';
import { useDocument } from './hooks/useDocument';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Preview from './components/Preview';

type Mode = 'editor' | 'preview';

export default function App() {
  const [mode, setMode] = useState<Mode>('editor');
  const {
    book,
    activeChapter,
    activeChapterId,
    activeLayout,
    setActiveChapterId,
    updateChapterContent,
    updateChapterTitle,
    updateBookTitle,
    addChapter,
    addAnnotation,
    removeAnnotation,
    addImage,
    removeImage,
  } = useDocument();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-6 py-2 bg-gray-900 text-white text-sm flex-shrink-0">
        <span className="font-semibold tracking-wide">{book.title}</span>

        <div className="flex items-center gap-3">
          {mode === 'editor' ? (
            <button
              onClick={() => setMode('preview')}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
            >
              미리보기
            </button>
          ) : (
            <button
              onClick={() => setMode('editor')}
              className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
            >
              ← 편집으로 돌아가기
            </button>
          )}
        </div>
      </header>

      {/* 본문 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 (항상 표시) */}
        <Sidebar
          book={book}
          activeChapterId={activeChapterId}
          onSelectChapter={(id) => {
            setActiveChapterId(id);
            setMode('editor'); // 챕터 전환 시 에디터로
          }}
          onAddChapter={addChapter}
          onUpdateBookTitle={updateBookTitle}
        />

        {/* 메인 콘텐츠 */}
        {activeChapter ? (
          mode === 'editor' ? (
            <Editor
              chapter={activeChapter}
              onUpdateContent={(content) => updateChapterContent(activeChapter.id, content)}
              onUpdateTitle={(title) => updateChapterTitle(activeChapter.id, title)}
            />
          ) : (
            <Preview
              chapter={activeChapter}
              layout={activeLayout}
              bookTitle={book.title}
              onAddAnnotation={addAnnotation}
              onAddImage={addImage}
              onRemoveImage={removeImage}
              onRemoveAnnotation={removeAnnotation}
            />
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            챕터를 선택하거나 추가하세요.
          </div>
        )}
      </div>
    </div>
  );
}
