import { useDocument } from './hooks/useDocument';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Preview from './components/Preview';

export default function App() {
  const {
    book,
    activeChapter,
    activeChapterId,
    setActiveChapterId,
    updateChapterContent,
    updateChapterTitle,
    updateBookTitle,
    addChapter,
  } = useDocument();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        book={book}
        activeChapterId={activeChapterId}
        onSelectChapter={setActiveChapterId}
        onAddChapter={addChapter}
        onUpdateBookTitle={updateBookTitle}
      />

      {activeChapter ? (
        <>
          <Editor
            chapter={activeChapter}
            onUpdateContent={(content) => updateChapterContent(activeChapter.id, content)}
            onUpdateTitle={(title) => updateChapterTitle(activeChapter.id, title)}
          />
          <Preview chapter={activeChapter} bookTitle={book.title} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          챕터를 선택하거나 추가하세요.
        </div>
      )}
    </div>
  );
}
