import { useRef, useEffect, useState } from 'react';
import type { Chapter } from '../types/document';

interface Props {
  chapter: Chapter;
  onUpdateContent: (content: string) => void;
  onUpdateTitle: (title: string) => void;
}

export default function Editor({ chapter, onUpdateContent, onUpdateTitle }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pendingCursor, setPendingCursor] = useState<number | null>(null);

  // 렌더 후 커서 위치 복원
  useEffect(() => {
    if (pendingCursor !== null && textareaRef.current) {
      textareaRef.current.selectionStart = pendingCursor;
      textareaRef.current.selectionEnd = pendingCursor;
      setPendingCursor(null);
    }
  });

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = e.currentTarget;
    const { selectionStart: ss, selectionEnd: se, value } = textarea;

    // Ctrl+' → 큰따옴표 감싸기
    if (e.ctrlKey && e.key === "'") {
      e.preventDefault();

      if (ss !== se) {
        // 선택된 텍스트를 따옴표로 감싸기
        const selected = value.slice(ss, se);
        onUpdateContent(value.slice(0, ss) + '"' + selected + '"' + value.slice(se));
        setPendingCursor(se + 2); // 닫는 따옴표 뒤
      } else {
        // 선택 없음: "" 삽입 후 커서를 사이에
        onUpdateContent(value.slice(0, ss) + '""' + value.slice(se));
        setPendingCursor(ss + 1);
      }
      return;
    }

    // Enter → 닫는 따옴표 바로 앞에 커서가 있으면 따옴표 밖으로 탈출
    if (e.key === 'Enter' && !e.shiftKey) {
      if (value[ss] === '"') {
        e.preventDefault();
        setPendingCursor(ss + 1);
      }
    }
  }

  return (
    <section className="flex-1 flex flex-col bg-white h-screen">
      {/* 챕터 제목 */}
      <div className="px-10 pt-10 pb-4 border-b border-gray-100">
        <input
          className="w-full text-2xl font-bold text-gray-800 bg-transparent focus:outline-none placeholder-gray-300"
          value={chapter.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="챕터 제목"
        />
      </div>

      {/* 본문 입력 */}
      <textarea
        ref={textareaRef}
        className="flex-1 w-full px-10 py-8 text-gray-700 text-base leading-relaxed resize-none focus:outline-none"
        style={{ fontFamily: '"Malgun Gothic", sans-serif' }}
        value={chapter.content}
        onChange={(e) => onUpdateContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`여기에 원고를 입력하세요.\n\n문단은 빈 줄(엔터 두 번)로 구분합니다.`}
      />

      {/* 글자 수 */}
      <div className="px-10 py-2 text-xs text-gray-400 border-t border-gray-100">
        {chapter.content.length.toLocaleString()}자 ·{' '}
        {chapter.content.split(/\n\n+/).filter((p) => p.trim()).length}개 문단
      </div>
    </section>
  );
}
