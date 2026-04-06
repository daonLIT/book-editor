import { useRef } from 'react';
import type { Chapter } from '../types/document';

interface Props {
  chapter: Chapter;
  onUpdateContent: (content: string) => void;
  onUpdateTitle: (title: string) => void;
}

export default function Editor({ chapter, onUpdateContent, onUpdateTitle }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <section className="no-print flex-1 flex flex-col bg-gray-50 h-screen">
      {/* 챕터 제목 */}
      <div className="px-8 pt-8 pb-4 border-b border-gray-200">
        <input
          className="w-full text-2xl font-bold text-gray-800 bg-transparent focus:outline-none placeholder-gray-400"
          value={chapter.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="챕터 제목"
        />
      </div>

      {/* 본문 입력 */}
      <textarea
        ref={textareaRef}
        className="flex-1 w-full px-8 py-6 bg-transparent text-gray-700 text-base leading-relaxed resize-none focus:outline-none"
        value={chapter.content}
        onChange={(e) => onUpdateContent(e.target.value)}
        placeholder="여기에 원고를 입력하세요. 문단은 빈 줄로 구분합니다."
      />

      {/* 글자 수 */}
      <div className="px-8 py-2 text-xs text-gray-400 border-t border-gray-200">
        {chapter.content.length.toLocaleString()}자
      </div>
    </section>
  );
}
