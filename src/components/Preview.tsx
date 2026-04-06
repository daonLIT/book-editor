import { paginateText } from '../utils/pagination';
import type { Chapter } from '../types/document';

interface Props {
  chapter: Chapter;
  bookTitle: string;
}

export default function Preview({ chapter, bookTitle }: Props) {
  const pages = paginateText(chapter.content);

  return (
    <aside className="no-print w-80 flex-shrink-0 bg-gray-200 h-screen overflow-y-auto flex flex-col items-center py-6 gap-6">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">미리보기</p>

      {pages.map((pageText, index) => (
        <div
          key={index}
          className="print-page bg-white shadow-md"
          style={{
            width: '148mm',
            minHeight: '210mm',
            padding: '15mm 20mm',
            boxSizing: 'border-box',
            fontSize: '10pt',
            lineHeight: 1.8,
            fontFamily: '"Noto Serif KR", "Malgun Gothic", serif',
            position: 'relative',
          }}
        >
          {/* 첫 페이지 챕터 제목 */}
          {index === 0 && (
            <h2
              style={{
                fontSize: '14pt',
                fontWeight: 'bold',
                marginBottom: '8mm',
                paddingBottom: '4mm',
                borderBottom: '1px solid #ddd',
              }}
            >
              {chapter.title}
            </h2>
          )}

          {/* 본문 */}
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {pageText}
          </div>

          {/* 페이지 번호 */}
          <div
            style={{
              position: 'absolute',
              bottom: '8mm',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '8pt',
              color: '#999',
            }}
          >
            {index + 1}
          </div>

          {/* 책 제목 (머리글) */}
          <div
            style={{
              position: 'absolute',
              top: '6mm',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '7pt',
              color: '#bbb',
              letterSpacing: '0.05em',
            }}
          >
            {bookTitle}
          </div>
        </div>
      ))}
    </aside>
  );
}
