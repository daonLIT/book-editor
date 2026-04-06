import { useState, useEffect } from 'react';
import type { Book, Chapter } from '../types/document';

const STORAGE_KEY = 'book-editor-data';

function createDefaultBook(): Book {
  return {
    id: crypto.randomUUID(),
    title: '제목 없는 책',
    chapters: [
      {
        id: crypto.randomUUID(),
        title: '1장',
        content: '',
      },
    ],
  };
}

function loadFromStorage(): Book {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Book;
  } catch {
    // 저장 데이터 파싱 실패 시 기본값 사용
  }
  return createDefaultBook();
}

export function useDocument() {
  const [book, setBook] = useState<Book>(loadFromStorage);
  const [activeChapterId, setActiveChapterId] = useState<string>(
    () => loadFromStorage().chapters[0]?.id ?? ''
  );

  // 변경 시 localStorage 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
  }, [book]);

  const activeChapter = book.chapters.find((c) => c.id === activeChapterId) ?? null;

  function updateChapterContent(chapterId: string, content: string) {
    setBook((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) =>
        c.id === chapterId ? { ...c, content } : c
      ),
    }));
  }

  function addChapter() {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: `${book.chapters.length + 1}장`,
      content: '',
    };
    setBook((prev) => ({ ...prev, chapters: [...prev.chapters, newChapter] }));
    setActiveChapterId(newChapter.id);
  }

  function updateBookTitle(title: string) {
    setBook((prev) => ({ ...prev, title }));
  }

  function updateChapterTitle(chapterId: string, title: string) {
    setBook((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) =>
        c.id === chapterId ? { ...c, title } : c
      ),
    }));
  }

  return {
    book,
    activeChapter,
    activeChapterId,
    setActiveChapterId,
    updateChapterContent,
    updateChapterTitle,
    updateBookTitle,
    addChapter,
  };
}
