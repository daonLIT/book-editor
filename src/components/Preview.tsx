import { useState, useMemo } from 'react';
import type { Chapter, ChapterLayout, Annotation, ImageInsertion } from '../types/document';
import { buildLayoutItems, computePages } from '../utils/layout';
import type { Page, PageItem } from '../utils/layout';
import PreviewToolbar from './PreviewToolbar';
import type { SelectionInfo } from './PreviewToolbar';

// mm → px (96dpi)
const MM = 96 / 25.4;

function pageStyle(scale: number): React.CSSProperties {
  return {
    width:  Math.round(148 * MM * scale),
    height: Math.round(210 * MM * scale),
    padding: `${Math.round(15 * MM * scale)}px ${Math.round(18 * MM * scale)}px`,
    boxSizing: 'border-box',
    fontSize: Math.round(10 * MM * scale * 0.265), // pt → px
    lineHeight: 1.75,
    fontFamily: '"Malgun Gothic", serif',
    position: 'relative',
    overflow: 'hidden',
    background: '#fff',
  };
}

const contentCSS = `
  b, strong { font-weight: bold; }
  i, em { font-style: italic; }
  u { text-decoration: underline; }
  mark { padding: 0 1px; border-radius: 2px; }
  [data-comment-id] { border-bottom: 2px dotted #f59e0b; cursor: pointer; }
`;

// ── BookPage ────────────────────────────────────────────────
interface BookPageProps {
  items: PageItem[];
  pageNumber: number;
  bookTitle: string;
  chapterTitle?: string;
  isLeft: boolean;
  scale: number;
  selectedParagraphIdx: number | null;
  onSelectParagraph: (idx: number) => void;
  onRemoveImage: (id: string) => void;
  onCommentClick: (commentId: string) => void;
}

function BookPage({
  items, pageNumber, bookTitle, chapterTitle,
  isLeft, scale,
  selectedParagraphIdx, onSelectParagraph, onRemoveImage, onCommentClick,
}: BookPageProps) {
  const s = pageStyle(scale);
  const shadow = isLeft ? '4px 0 8px rgba(0,0,0,0.12)' : '-4px 0 8px rgba(0,0,0,0.12)';

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const commentId = target.closest('[data-comment-id]')?.getAttribute('data-comment-id');
    if (commentId) { onCommentClick(commentId); return; }
  }

  return (
    <div style={{ ...s, boxShadow: shadow }} className="print-page flex-shrink-0" onClick={handleClick}>
      <style>{contentCSS}</style>

      {/* 머리글 */}
      <div style={{ textAlign: 'center', fontSize: 7, color: '#ccc', marginBottom: 5, letterSpacing: '0.05em' }}>
        {bookTitle}
      </div>

      {/* 챕터 제목 (첫 페이지) */}
      {chapterTitle && (
        <div style={{ fontWeight: 'bold', fontSize: (s.fontSize as number) + 3, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #eee' }}>
          {chapterTitle}
        </div>
      )}

      {/* 아이템 */}
      {items.map((item, i) => {
        if (item.type === 'image') {
          return (
            <div key={i} style={{ textAlign: 'center', margin: '6px 0', position: 'relative' }}>
              <img src={item.image.src} alt={item.image.caption ?? '삽화'}
                style={{ maxWidth: '100%', maxHeight: Math.round(80 * scale / 0.48), objectFit: 'contain' }} />
              {item.image.caption && (
                <div style={{ fontSize: 7, color: '#999', marginTop: 2 }}>{item.image.caption}</div>
              )}
              <button onClick={() => onRemoveImage(item.image.id)}
                style={{ position: 'absolute', top: 0, right: 0, background: '#f87171', color: '#fff', border: 'none', borderRadius: 3, fontSize: 8, padding: '1px 4px', cursor: 'pointer' }}>✕</button>
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
              margin: '2px 0', cursor: 'pointer', padding: '1px 2px', borderRadius: 2,
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

function BlankPage({ scale, isLeft }: { scale: number; isLeft: boolean }) {
  const s = pageStyle(scale);
  return (
    <div style={{
      ...s, background: '#f5f0eb',
      boxShadow: isLeft ? '4px 0 8px rgba(0,0,0,0.08)' : '-4px 0 8px rgba(0,0,0,0.08)',
    }} />
  );
}

// ── 메모 입력 모달 ───────────────────────────────────────────
interface CommentModalProps {
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

function CommentModal({ onConfirm, onCancel }: CommentModalProps) {
  const [text, setText] = useState('');
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-xl p-5 w-80" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold text-gray-700 mb-3">메모 / 댓글 추가</p>
        <textarea
          autoFocus
          className="w-full h-24 border border-gray-200 rounded p-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-blue-400"
          placeholder="메모 내용을 입력하세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) onConfirm(text); }}
        />
        <p className="text-xs text-gray-400 mt-1">Ctrl+Enter로 확인</p>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded">취소</button>
          <button onClick={() => onConfirm(text)} disabled={!text.trim()}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-40">확인</button>
        </div>
      </div>
    </div>
  );
}

// ── 댓글/하이라이트 목록 패널 ────────────────────────────────
interface AnnotationPanelProps {
  annotations: Annotation[];
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
  onRemove: (chapterId: string, id: string) => void;
  chapterId: string;
}

function AnnotationPanel({ annotations, highlightedId, onHighlight, onRemove, chapterId }: AnnotationPanelProps) {
  const comments = annotations.filter((a) => a.type === 'comment');
  const highlights = annotations.filter((a) => a.type === 'highlight');

  if (!comments.length && !highlights.length) return null;

  return (
    <div className="border-t border-gray-300 bg-white/80 px-6 py-4 max-h-48 overflow-y-auto">
      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">주석 목록</p>
      <div className="flex flex-col gap-2">
        {comments.map((ann) => (
          <div key={ann.id}
            className={`flex items-start gap-2 p-2 rounded cursor-pointer text-sm transition-colors ${highlightedId === ann.id ? 'bg-amber-50 border border-amber-300' : 'bg-gray-50 hover:bg-amber-50'}`}
            onClick={() => onHighlight(highlightedId === ann.id ? null : ann.id)}>
            <span className="text-base">💬</span>
            <span className="flex-1 text-gray-700">{ann.commentText}</span>
            <button onClick={(e) => { e.stopPropagation(); onRemove(chapterId, ann.id); }}
              className="text-gray-300 hover:text-red-400 text-xs ml-1">✕</button>
          </div>
        ))}
        {highlights.map((ann) => (
          <div key={ann.id}
            className="flex items-center gap-2 p-2 rounded bg-gray-50 text-sm">
            <span className="w-4 h-4 rounded-sm flex-shrink-0" style={{ background: ann.color ?? '#fef08a', border: '1px solid #e5e7eb' }} />
            <span className="flex-1 text-gray-500 text-xs">
              {ann.range.paragraphIndex + 1}번 문단, {ann.range.start}–{ann.range.end}자
            </span>
            <button onClick={() => onRemove(chapterId, ann.id)}
              className="text-gray-300 hover:text-red-400 text-xs">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Preview (메인) ────────────────────────────────────────────
interface Props {
  chapter: Chapter;
  layout: ChapterLayout;
  bookTitle: string;
  onAddAnnotation: (chapterId: string, ann: Annotation) => void;
  onAddImage: (chapterId: string, img: ImageInsertion) => void;
  onRemoveImage: (chapterId: string, imageId: string) => void;
  onRemoveAnnotation: (chapterId: string, id: string) => void;
}

const ZOOM_MIN = 0.3;
const ZOOM_MAX = 0.9;
const ZOOM_STEP = 0.08;

export default function Preview({
  chapter, layout, bookTitle,
  onAddAnnotation, onAddImage, onRemoveImage, onRemoveAnnotation,
}: Props) {
  const [scale, setScale] = useState(0.48);
  const [selectedParagraphIdx, setSelectedParagraphIdx] = useState<number | null>(null);
  const [commentPending, setCommentPending] = useState<{ chapterId: string; info: SelectionInfo } | null>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

  const pages: Page[] = useMemo(
    () => computePages(buildLayoutItems(chapter.content, layout.annotations, layout.images)),
    [chapter.content, layout]
  );

  const SPINE_W = Math.round(6 * scale / 0.48);
  const PAGE_H  = Math.round(210 * MM * scale);

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

  function confirmComment(text: string) {
    if (!commentPending || !text.trim()) { setCommentPending(null); return; }
    onAddAnnotation(commentPending.chapterId, {
      id: crypto.randomUUID(),
      type: 'comment',
      range: commentPending.info,
      commentText: text.trim(),
    });
    setCommentPending(null);
  }

  return (
    <div className="flex-1 flex flex-col bg-[#c8bfb0] h-screen overflow-hidden">
      {/* 툴바 */}
      <PreviewToolbar
        chapterId={chapter.id}
        selectedParagraphIdx={selectedParagraphIdx}
        zoom={scale}
        onAddAnnotation={onAddAnnotation}
        onAddImage={onAddImage}
        onRequestComment={(cid, info) => setCommentPending({ chapterId: cid, info })}
        onZoomIn={() => setScale((s) => Math.min(ZOOM_MAX, +(s + ZOOM_STEP).toFixed(2)))}
        onZoomOut={() => setScale((s) => Math.max(ZOOM_MIN, +(s - ZOOM_STEP).toFixed(2)))}
      />

      {/* 책 스프레드 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center py-8 gap-8">
        {spreads.map((spread, si) => (
          <div key={si} className="flex flex-col items-center gap-2">
            <div style={{ filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.28))', display: 'flex' }}>
              {spread[0] ? (
                <BookPage
                  items={spread[0].page} pageNumber={spread[0].pageNum}
                  bookTitle={bookTitle} isLeft scale={scale}
                  selectedParagraphIdx={selectedParagraphIdx}
                  onSelectParagraph={setSelectedParagraphIdx}
                  onRemoveImage={(id) => onRemoveImage(chapter.id, id)}
                  onCommentClick={setHighlightedCommentId}
                />
              ) : <BlankPage scale={scale} isLeft />}

              <div style={{ width: SPINE_W, height: PAGE_H, background: 'linear-gradient(to right,#b0a090,#d4c8ba,#b0a090)', flexShrink: 0 }} />

              {spread[1] ? (
                <BookPage
                  items={spread[1].page} pageNumber={spread[1].pageNum}
                  bookTitle={bookTitle}
                  chapterTitle={spread[1].pageNum === 1 ? chapter.title : undefined}
                  isLeft={false} scale={scale}
                  selectedParagraphIdx={selectedParagraphIdx}
                  onSelectParagraph={setSelectedParagraphIdx}
                  onRemoveImage={(id) => onRemoveImage(chapter.id, id)}
                  onCommentClick={setHighlightedCommentId}
                />
              ) : <BlankPage scale={scale} isLeft={false} />}
            </div>
            <p className="text-[10px] text-[#8a7f74]">
              {spread[0] && spread[1] ? `${spread[0].pageNum}–${spread[1].pageNum}p`
                : spread[1] ? `${spread[1].pageNum}p`
                : `${spread[0]!.pageNum}p`}
            </p>
          </div>
        ))}
      </div>

      {/* 주석 목록 패널 */}
      <AnnotationPanel
        annotations={layout.annotations}
        highlightedId={highlightedCommentId}
        onHighlight={setHighlightedCommentId}
        onRemove={onRemoveAnnotation}
        chapterId={chapter.id}
      />

      {/* 메모 입력 모달 */}
      {commentPending && (
        <CommentModal
          onConfirm={confirmComment}
          onCancel={() => setCommentPending(null)}
        />
      )}
    </div>
  );
}
