import { paginateHtml } from '../utils/pagination';
import type { Chapter } from '../types/document';

interface Props {
  chapter: Chapter;
  bookTitle: string;
}

// 미리보기 페이지 내 HTML 서식 스타일
const previewContentStyle = `
  h1 { font-size: 1.3em; font-weight: bold; margin: 0.6em 0 0.3em; }
  h2 { font-size: 1.1em; font-weight: bold; margin: 0.5em 0 0.3em; }
  h3 { font-size: 1em; font-weight: bold; margin: 0.4em 0 0.2em; }
  p  { margin: 0.3em 0; }
  b, strong { font-weight: bold; }
  i, em { font-style: italic; }
  u { text-decoration: underline; }
`;

export default function Preview({ chapter, bookTitle }: Props) {
  const pages = paginateHtml(chapter.content);

  return (
    <aside className="no-print w-80 flex-shrink-0 bg-gray-200 h-screen overflow-y-auto flex flex-col items-center py-6 gap-6">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">미리보기</p>

      {pages.map((pageHtml, index) => (
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
            fontFamily: '"Malgun Gothic", serif',
            position: 'relative',
          }}
        >
          {/* 머리글 (책 제목) */}
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

          {/* 본문 HTML 렌더링 */}
          <style>{previewContentStyle}</style>
          <div
            dangerouslySetInnerHTML={{ __html: pageHtml }}
            style={{ wordBreak: 'break-word' }}
          />

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
        </div>
      ))}
    </aside>
  );
}
