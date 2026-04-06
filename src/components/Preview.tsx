import { useState, useMemo } from 'react';
import type { Chapter, ChapterLayout, Annotation, ImageInsertion } from '../types/document';
import { buildLayoutItems, computePages } from '../utils/layout';
import type { Page, PageItem } from '../utils/layout';
import PreviewToolbar from './PreviewToolbar';

// A5 페이지를 화면에 표시할 스케일
const PAGE_SCALE = 0.48;
const PAGE_W_PX = Math.round(148 * (96 / 25.4) * PAGE_SCALE);
const PAGE_H_PX = Math.round(210 * (96 / 25.4) * PAGE_SCALE);
const PADDING_H = Math.round(18 * (96 / 25.4) * PAGE_SCALE);
const PADDING_V = Math.round(15 * (96 / 25.4) * PAGE_SCALE);
const FONT_SIZE = Math.round(10 * PAGE_SCALE * 1.65);

const pageStyle: React.CSSProperties = {
  width: PAGE_W_PX,
  height: PAGE_H_PX,
  padding: `${PADDING_V}px ${PADDING_H}px`,
  boxSizing: 'border-box',
  fontSize: FONT_SIZE,
  lineHeight: 1.75,
  fontFamily: '"Malgun Gothic", serif',
  position: 'relative',
  overflow: 'hidden',
  background: '#fff',
};

const contentStyle = `
  b, strong { font-weight: bold; }
  i, em { font-style: italic; }
  u { text-decoration: underline; }
`;

interface BookPageProps {
  items: PageItem[];
  pageNumber: number;
  bookTitle: string;
  chapterTitle?: string;
  isLeft: boolean;
  selectedParagraphIdx: number | null;
  onSelectParagraph: (idx: number) => void;
  onRemoveImage: (id: string) => void;
}

function BookPage({
  items,
  pageNumber,
  bookTitle,
  chapterTitle,
  isLeft,
  selectedParagraphIdx,
  onSelectParagraph,
  onRemoveImage,
}: BookPageProps) {
  return (
    <div
      className="print-page flex-shrink-0"
      style={{
        ...pageStyle,
        boxShadow: isLeft ? '4px 0 8px rgba(0,0,0,0.12)' : '-4px 0 8px rgba(0,0,0,0.12)',
      }}
    >
      <style>{contentStyle}</style>

      {/* 머리글 */}
      <div style={{ textAlign: 'center', fontSize: 7, color: '#ccc', marginBottom: 6, letterSpacing: '0.05em' }}>
        {bookTitle}
      </div>

      {/* 챕터 제목 (첫 페이지) */}
      {chapterTitle && (
        <div style={{ fontWeight: 'bold', fontSize: FONT_SIZE + 3, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #eee' }}>
          {chapterTitle}
        </div>
      )}

      {/* 페이지 아이템 */}
      {items.map((item, i) => {
        if (item.type === 'image') {
          return (
            <div key={i} style={{ textAlign: 'center', margin: '6px 0', position: 'relative' }}>
              <img
                src={item.image.src}
                alt={item.image.caption ?? '삽화'}
                style={{ maxWidth: '100%', maxHeight: 80, objectFit: 'contain' }}
              />
              {item.image.caption && (
                <div style={{ fontSize: 7, color: '#999', marginTop: 2 }}>{item.image.caption}</div>
              )}
              <button
                onClick={() => onRemoveImage(item.image.id)}
                title="이미지 삭제"
                style={{
                  position: 'absolute', top: 0, right: 0,
                  background: '#f87171', color: '#fff',
                  border: 'none', borderRadius: 3, fontSize: 8,
                  padding: '1px 4px', cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          );
        }

        const isSelected = item.paragraphIndex === selectedParagraphIdx;
        return (
          <p
            key={i}
            data-para-idx={item.paragraphIndex}
            onClick={() => onSelectParagraph(item.paragraphIndex)}
            style={{
              margin: '2px 0',
              cursor: 'pointer',
              padding: '1px 2px',
              borderRadius: 2,
              outline: isSelected ? '1px solid #3b82f6' : 'none',
              backgroundColor: isSelected ? '#eff6ff' : 'transparent',
            }}
            dangerouslySetInnerHTML={{ __html: item.html }}
          />
        );
      })}

      {/* 페이지 번호 */}
      <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#aaa' }}>
        {pageNumber}
      </div>
    </div>
  );
}

function BlankPage({ isLeft }: { isLeft: boolean }) {
  return (
    <div
      style={{
        ...pageStyle,
        background: '#f5f0eb',
        boxShadow: isLeft ? '4px 0 8px rgba(0,0,0,0.08)' : '-4px 0 8px rgba(0,0,0,0.08)',
      }}
    />
  );
}

interface Props {
  chapter: Chapter;
  layout: ChapterLayout;
  bookTitle: string;
  onAddAnnotation: (chapterId: string, ann: Annotation) => void;
  onAddImage: (chapterId: string, img: ImageInsertion) => void;
  onRemoveImage: (chapterId: string, imageId: string) => void;
}

export default function Preview({
  chapter,
  layout,
  bookTitle,
  onAddAnnotation,
  onAddImage,
  onRemoveImage,
}: Props) {
  const [selectedParagraphIdx, setSelectedParagraphIdx] = useState<number | null>(null);

  // 미리보기 버튼 클릭 시 1회 계산된 레이아웃 사용
  const pages: Page[] = useMemo(() => {
    const items = buildLayoutItems(chapter.content, layout.annotations, layout.images);
    return computePages(items);
  }, [chapter.content, layout]);

  // spread 생성: [빈칸, p0], [p1, p2], ...
  type SpreadItem = { page: Page; pageNum: number } | null;
  const spreads: [SpreadItem, SpreadItem][] = [];

  if (pages.length > 0) {
    spreads.push([null, { page: pages[0], pageNum: 1 }]);
    for (let i = 1; i < pages.length; i += 2) {
      spreads.push([
        { page: pages[i], pageNum: i + 1 },
        pages[i + 1] !== undefined ? { page: pages[i + 1], pageNum: i + 2 } : null,
      ]);
    }
  }

  const SPINE_W = 6;

  return (
    <div className="flex-1 flex flex-col bg-[#c8bfb0] h-screen overflow-hidden">
      {/* 주석 툴바 */}
      <PreviewToolbar
        chapterId={chapter.id}
        onAddAnnotation={onAddAnnotation}
        onAddImage={onAddImage}
        selectedParagraphIdx={selectedParagraphIdx}
      />

      {/* 책 spread 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center py-8 gap-8">
        {spreads.map((spread, si) => (
          <div key={si} className="flex flex-col items-center gap-2">
            <div style={{ filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.28))', display: 'flex' }}>
              {/* 왼쪽 페이지 */}
              {spread[0] ? (
                <BookPage
                  items={spread[0].page}
                  pageNumber={spread[0].pageNum}
                  bookTitle={bookTitle}
                  isLeft={true}
                  selectedParagraphIdx={selectedParagraphIdx}
                  onSelectParagraph={setSelectedParagraphIdx}
                  onRemoveImage={(id) => onRemoveImage(chapter.id, id)}
                />
              ) : (
                <BlankPage isLeft={true} />
              )}

              {/* 책등 */}
              <div style={{
                width: SPINE_W,
                height: PAGE_H_PX,
                background: 'linear-gradient(to right, #b0a090, #d4c8ba, #b0a090)',
                flexShrink: 0,
              }} />

              {/* 오른쪽 페이지 */}
              {spread[1] ? (
                <BookPage
                  items={spread[1].page}
                  pageNumber={spread[1].pageNum}
                  bookTitle={bookTitle}
                  chapterTitle={spread[1].pageNum === 1 ? chapter.title : undefined}
                  isLeft={false}
                  selectedParagraphIdx={selectedParagraphIdx}
                  onSelectParagraph={setSelectedParagraphIdx}
                  onRemoveImage={(id) => onRemoveImage(chapter.id, id)}
                />
              ) : (
                <BlankPage isLeft={false} />
              )}
            </div>
            <p className="text-[10px] text-[#8a7f74]">
              {spread[0] && spread[1]
                ? `${spread[0].pageNum}–${spread[1].pageNum}p`
                : spread[1]
                ? `${spread[1].pageNum}p`
                : `${spread[0]!.pageNum}p`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
