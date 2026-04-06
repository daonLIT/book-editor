import { useRef } from 'react';
import type { Annotation, ImageInsertion } from '../types/document';

interface SelectionInfo {
  paragraphIndex: number;
  start: number;
  end: number;
  text: string;
}

/** data-para-idx attribute를 가진 상위 DOM 요소를 탐색 */
function findParaElement(node: Node | null): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== document.body) {
    if (
      current instanceof HTMLElement &&
      current.dataset.paraIdx !== undefined
    ) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
}

/** 현재 텍스트 selection을 paragraphIndex + offset으로 변환 */
function getSelectionInfo(): SelectionInfo | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null;

  const range = sel.getRangeAt(0);
  const anchorPara = findParaElement(range.startContainer);
  const focusPara = findParaElement(range.endContainer);

  // 두 끝점이 같은 문단 내에 있어야 함 (단순화)
  if (
    !anchorPara ||
    !focusPara ||
    anchorPara.dataset.paraIdx !== focusPara.dataset.paraIdx
  ) {
    return null;
  }

  const paraIdx = parseInt(anchorPara.dataset.paraIdx!, 10);
  // textContent 기준 offset 계산
  const paraText = anchorPara.textContent ?? '';
  const preStart = range.cloneRange();
  preStart.selectNodeContents(anchorPara);
  preStart.setEnd(range.startContainer, range.startOffset);
  const start = preStart.toString().length;
  const end = start + range.toString().length;

  if (start === end) return null;

  return { paragraphIndex: paraIdx, start, end, text: paraText.slice(start, end) };
}

interface Props {
  chapterId: string;
  onAddAnnotation: (chapterId: string, ann: Annotation) => void;
  onAddImage: (chapterId: string, img: ImageInsertion) => void;
  /** 이미지 삽입할 문단 인덱스 (사용자가 클릭해서 선택) */
  selectedParagraphIdx: number | null;
}

export default function PreviewToolbar({
  chapterId,
  onAddAnnotation,
  onAddImage,
  selectedParagraphIdx,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applyFormat(type: Annotation['type']) {
    const info = getSelectionInfo();
    if (!info) return;
    onAddAnnotation(chapterId, {
      id: crypto.randomUUID(),
      type,
      range: {
        paragraphIndex: info.paragraphIndex,
        start: info.start,
        end: info.end,
      },
    });
    window.getSelection()?.removeAllRanges();
  }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || selectedParagraphIdx === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      onAddImage(chapterId, {
        id: crypto.randomUUID(),
        afterParagraphIndex: selectedParagraphIdx,
        src,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-white border-b border-gray-200 shadow-sm">
      <span className="text-xs text-gray-400 mr-2">서식</span>

      <button
        title="굵게 (텍스트 선택 후 클릭)"
        onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
        className="w-8 h-8 rounded font-bold text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        B
      </button>
      <button
        title="기울임 (텍스트 선택 후 클릭)"
        onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}
        className="w-8 h-8 rounded italic text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        I
      </button>
      <button
        title="밑줄 (텍스트 선택 후 클릭)"
        onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}
        className="w-8 h-8 rounded underline text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        U
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <button
        title={
          selectedParagraphIdx !== null
            ? `${selectedParagraphIdx + 1}번째 문단 아래에 이미지 삽입`
            : '미리보기에서 문단을 먼저 클릭하세요'
        }
        onClick={() => {
          if (selectedParagraphIdx === null) return;
          fileInputRef.current?.click();
        }}
        className={`flex items-center gap-1 px-3 h-8 rounded text-xs transition-colors ${
          selectedParagraphIdx !== null
            ? 'text-blue-600 hover:bg-blue-50 border border-blue-200'
            : 'text-gray-300 border border-gray-100 cursor-not-allowed'
        }`}
      >
        🖼 삽화 삽입
        {selectedParagraphIdx !== null && (
          <span className="text-gray-400">({selectedParagraphIdx + 1}번 문단 아래)</span>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />

      <div className="ml-auto text-xs text-gray-400">
        텍스트를 선택한 뒤 서식 버튼을 누르세요
      </div>
    </div>
  );
}
