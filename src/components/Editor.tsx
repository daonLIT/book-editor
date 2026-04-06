import { useRef, useEffect } from 'react';
import type { Chapter } from '../types/document';
import Toolbar from './Toolbar';

interface Props {
  chapter: Chapter;
  onUpdateContent: (content: string) => void;
  onUpdateTitle: (title: string) => void;
}

export default function Editor({ chapter, onUpdateContent, onUpdateTitle }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  // 챕터가 바뀔 때만 innerHTML 동기화 (입력 중에는 건드리지 않음)
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = chapter.content;
    }
  }, [chapter.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleInput() {
    if (editorRef.current) {
      onUpdateContent(editorRef.current.innerHTML);
    }
  }

  // 텍스트만 추출해서 글자 수 계산
  const charCount = editorRef.current?.textContent?.length
    ?? chapter.content.replace(/<[^>]*>/g, '').length;

  return (
    <section className="no-print flex-1 flex flex-col bg-gray-50 h-screen">
      {/* 챕터 제목 */}
      <div className="px-8 pt-8 pb-4 border-b border-gray-200 bg-white">
        <input
          className="w-full text-2xl font-bold text-gray-800 bg-transparent focus:outline-none placeholder-gray-400"
          value={chapter.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="챕터 제목"
        />
      </div>

      {/* 서식 툴바 */}
      <Toolbar />

      {/* 본문 입력 (contenteditable) */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="flex-1 w-full px-8 py-6 text-gray-700 text-base leading-relaxed focus:outline-none overflow-y-auto"
        style={{ fontFamily: '"Malgun Gothic", sans-serif' }}
        data-placeholder="여기에 원고를 입력하세요."
      />

      {/* 글자 수 */}
      <div className="px-8 py-2 text-xs text-gray-400 border-t border-gray-200 bg-white">
        {charCount.toLocaleString()}자
      </div>
    </section>
  );
}
