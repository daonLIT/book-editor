import { useState, useEffect } from 'react';
import type { Book, Chapter, ChapterLayout, Annotation, ImageInsertion } from '../types/document';

const STORAGE_KEY = 'book-editor-data';

function emptyLayout(): ChapterLayout {
  return { annotations: [], images: [] };
}

function createDefaultBook(): Book {
  return {
    id: crypto.randomUUID(),
    title: '제목 없는 책',
    chapters: [{ id: crypto.randomUUID(), title: '1장', content: '' }],
    layouts: {},
  };
}

function loadFromStorage(): Book {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const book = JSON.parse(saved) as Book;
      // 구버전 데이터에 layouts 없을 경우 보완
      if (!book.layouts) book.layouts = {};
      return book;
    }
  } catch {
    // 파싱 실패 시 기본값
  }
  return createDefaultBook();
}

export function useDocument() {
  const [book, setBook] = useState<Book>(loadFromStorage);
  const [activeChapterId, setActiveChapterId] = useState<string>(
    () => loadFromStorage().chapters[0]?.id ?? ''
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
  }, [book]);

  const activeChapter = book.chapters.find((c) => c.id === activeChapterId) ?? null;
  const activeLayout: ChapterLayout =
    book.layouts[activeChapterId] ?? emptyLayout();

  // ── 챕터 ──
  function updateChapterContent(chapterId: string, content: string) {
    setBook((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) =>
        c.id === chapterId ? { ...c, content } : c
      ),
    }));
  }

  function updateChapterTitle(chapterId: string, title: string) {
    setBook((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) =>
        c.id === chapterId ? { ...c, title } : c
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

  // ── 주석 ──
  function addAnnotation(chapterId: string, annotation: Annotation) {
    setBook((prev) => {
      const layout = prev.layouts[chapterId] ?? emptyLayout();
      return {
        ...prev,
        layouts: {
          ...prev.layouts,
          [chapterId]: {
            ...layout,
            annotations: [...layout.annotations, annotation],
          },
        },
      };
    });
  }

  function removeAnnotation(chapterId: string, annotationId: string) {
    setBook((prev) => {
      const layout = prev.layouts[chapterId] ?? emptyLayout();
      return {
        ...prev,
        layouts: {
          ...prev.layouts,
          [chapterId]: {
            ...layout,
            annotations: layout.annotations.filter((a) => a.id !== annotationId),
          },
        },
      };
    });
  }

  // ── 이미지 ──
  function addImage(chapterId: string, image: ImageInsertion) {
    setBook((prev) => {
      const layout = prev.layouts[chapterId] ?? emptyLayout();
      return {
        ...prev,
        layouts: {
          ...prev.layouts,
          [chapterId]: {
            ...layout,
            images: [...layout.images, image],
          },
        },
      };
    });
  }

  function removeImage(chapterId: string, imageId: string) {
    setBook((prev) => {
      const layout = prev.layouts[chapterId] ?? emptyLayout();
      return {
        ...prev,
        layouts: {
          ...prev.layouts,
          [chapterId]: {
            ...layout,
            images: layout.images.filter((img) => img.id !== imageId),
          },
        },
      };
    });
  }

  return {
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
  };
}
