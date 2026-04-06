import { useRef } from 'react';
import type { Annotation, ImageInsertion } from '../types/document';

export interface SelectionInfo {
  paragraphIndex: number;
  start: number;
  end: number;
}

function findParaElement(node: Node | null): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== document.body) {
    if (current instanceof HTMLElement && current.dataset.paraIdx !== undefined)
      return current;
    current = current.parentNode;
  }
  return null;
}

export function getSelectionInfo(): SelectionInfo | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const anchorPara = findParaElement(range.startContainer);
  const focusPara  = findParaElement(range.endContainer);
  if (!anchorPara || !focusPara || anchorPara.dataset.paraIdx !== focusPara.dataset.paraIdx)
    return null;
  const paraIdx = parseInt(anchorPara.dataset.paraIdx!, 10);
  const preStart = range.cloneRange();
  preStart.selectNodeContents(anchorPara);
  preStart.setEnd(range.startContainer, range.startOffset);
  const start = preStart.toString().length;
  const end = start + range.toString().length;
  if (start === end) return null;
  return { paragraphIndex: paraIdx, start, end };
}

const HIGHLIGHT_COLORS = [
  { label: '노랑', value: '#fef08a' },
  { label: '초록', value: '#bbf7d0' },
  { label: '파랑', value: '#bae6fd' },
  { label: '분홍', value: '#fecdd3' },
];

interface Props {
  chapterId: string;
  selectedParagraphIdx: number | null;
  zoom: number;
  onAddAnnotation: (chapterId: string, ann: Annotation) => void;
  onAddImage: (chapterId: string, img: ImageInsertion) => void;
  onRequestComment: (chapterId: string, info: SelectionInfo) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function PreviewToolbar({
  chapterId,
  selectedParagraphIdx,
  zoom,
  onAddAnnotation,
  onAddImage,
  onRequestComment,
  onZoomIn,
  onZoomOut,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applyFormat(type: Annotation['type'], extra?: Partial<Annotation>) {
    const info = getSelectionInfo();
    if (!info) return;
    onAddAnnotation(chapterId, {
      id: crypto.randomUUID(),
      type,
      range: { paragraphIndex: info.paragraphIndex, start: info.start, end: info.end },
      ...extra,
    });
    window.getSelection()?.removeAllRanges();
  }

  function handleComment() {
    const info = getSelectionInfo();
    if (!info) return;
    window.getSelection()?.removeAllRanges();
    onRequestComment(chapterId, info);
  }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || selectedParagraphIdx === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onAddImage(chapterId, {
        id: crypto.randomUUID(),
        afterParagraphIndex: selectedParagraphIdx,
        src: ev.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const btnBase = 'w-8 h-8 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center';

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-gray-200 shadow-sm flex-wrap">
      {/* 서식 */}
      <button title="굵게" onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
        className={`${btnBase} font-bold`}>B</button>
      <button title="기울임" onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}
        className={`${btnBase} italic`}>I</button>
      <button title="밑줄" onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}
        className={`${btnBase} underline`}>U</button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* 하이라이트 */}
      {HIGHLIGHT_COLORS.map((c) => (
        <button
          key={c.value}
          title={`하이라이트 (${c.label})`}
          onMouseDown={(e) => { e.preventDefault(); applyFormat('highlight', { color: c.value }); }}
          className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
          style={{ background: c.value }}
        />
      ))}

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* 메모/댓글 */}
      <button
        title="메모 추가 (텍스트 선택 후 클릭)"
        onMouseDown={(e) => { e.preventDefault(); handleComment(); }}
        className={`${btnBase} gap-1 px-2 w-auto text-amber-600 hover:bg-amber-50`}
      >
        💬 메모
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* 삽화 */}
      <button
        title={selectedParagraphIdx !== null ? `${selectedParagraphIdx + 1}번 문단 아래에 삽화 삽입` : '문단을 먼저 클릭하세요'}
        onClick={() => selectedParagraphIdx !== null && fileInputRef.current?.click()}
        className={`${btnBase} px-2 w-auto text-xs ${selectedParagraphIdx !== null ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
      >
        🖼 삽화
        {selectedParagraphIdx !== null && <span className="text-gray-400 ml-1">({selectedParagraphIdx + 1}번↓)</span>}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

      {/* 줌 */}
      <div className="ml-auto flex items-center gap-2">
        <button onClick={onZoomOut} className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center">−</button>
        <span className="text-xs text-gray-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center">+</button>
      </div>
    </div>
  );
}
