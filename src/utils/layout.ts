import type { Annotation, ImageInsertion } from '../types/document';

// ── 스마트 페이지 분할 ──────────────────────────────────────

const LINES_PER_PAGE = 26;
const CJK_CHARS_PER_LINE = 32;
// 이미지 1장이 차지하는 줄 수 (캡션 포함 추정)
const IMAGE_LINE_HEIGHT = 8;

function isCJK(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x1100 && code <= 0x11ff) || // 한글 자모
    (code >= 0x3130 && code <= 0x318f) || // 호환 자모
    (code >= 0xac00 && code <= 0xd7a3) || // 한글 음절
    (code >= 0x4e00 && code <= 0x9fff) || // CJK 통합 한자
    (code >= 0x3000 && code <= 0x303f)    // CJK 기호
  );
}

function estimateLines(text: string): number {
  let width = 0;
  for (const char of text) {
    width += isCJK(char) ? 1 : 0.5;
  }
  return Math.max(1, Math.ceil(width / CJK_CHARS_PER_LINE));
}

export interface LayoutItem {
  type: 'paragraph';
  paragraphIndex: number;
  text: string;
  html: string; // 주석 적용된 HTML
}

export interface ImageLayoutItem {
  type: 'image';
  image: ImageInsertion;
}

export type PageItem = LayoutItem | ImageLayoutItem;

export type Page = PageItem[];

/**
 * 문단 배열 + 이미지 삽입 목록 → 페이지 배열
 * orphan 방지: 남은 공간이 2줄 미만이면 해당 문단을 다음 페이지로
 */
export function computePages(
  items: (LayoutItem | ImageLayoutItem)[]
): Page[] {
  const pages: Page[] = [];
  let currentPage: Page = [];
  let usedLines = 0;

  function flush() {
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    currentPage = [];
    usedLines = 0;
  }

  for (const item of items) {
    if (item.type === 'image') {
      // 이미지: 남은 공간 부족하면 다음 페이지로
      if (usedLines + IMAGE_LINE_HEIGHT > LINES_PER_PAGE && currentPage.length > 0) {
        flush();
      }
      currentPage.push(item);
      usedLines += IMAGE_LINE_HEIGHT;
    } else {
      const lines = estimateLines(item.text);
      // orphan 방지: 남은 공간이 2줄 미만이면 다음 페이지
      const remaining = LINES_PER_PAGE - usedLines;
      if (remaining < 2 && currentPage.length > 0) {
        flush();
      }
      if (usedLines + lines > LINES_PER_PAGE && currentPage.length > 0) {
        flush();
      }
      currentPage.push(item);
      usedLines += lines;
    }

    if (usedLines >= LINES_PER_PAGE) {
      flush();
    }
  }

  flush();
  return pages.length ? pages : [[]];
}

// ── 주석 적용 ──────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * plain text 문단에 annotations 적용 → HTML 문자열
 */
export function applyAnnotations(
  text: string,
  annotations: Annotation[],
  paraIdx: number
): string {
  const relevant = annotations.filter((a) => a.range.paragraphIndex === paraIdx);
  if (!relevant.length) return escapeHtml(text);

  interface Event {
    pos: number;
    open: boolean;
    ann: Annotation;
  }
  const events: Event[] = [];
  for (const ann of relevant) {
    events.push({ pos: ann.range.start, open: true, ann });
    events.push({ pos: ann.range.end, open: false, ann });
  }
  events.sort((a, b) => a.pos - b.pos || (a.open ? -1 : 1));

  function openTag(ann: Annotation): string {
    switch (ann.type) {
      case 'bold':      return '<b>';
      case 'italic':    return '<i>';
      case 'underline': return '<u>';
      case 'highlight':
        return `<mark style="background:${ann.color ?? '#fef08a'};padding:0 1px;border-radius:2px;">`;
      case 'comment':
        return `<span data-comment-id="${ann.id}" style="border-bottom:2px dotted #f59e0b;cursor:pointer;">`;
    }
  }

  function closeTag(ann: Annotation): string {
    switch (ann.type) {
      case 'bold':      return '</b>';
      case 'italic':    return '</i>';
      case 'underline': return '</u>';
      case 'highlight': return '</mark>';
      case 'comment':   return '</span>';
    }
  }

  let result = '';
  let lastPos = 0;
  for (const ev of events) {
    result += escapeHtml(text.slice(lastPos, ev.pos));
    result += ev.open ? openTag(ev.ann) : closeTag(ev.ann);
    lastPos = ev.pos;
  }
  result += escapeHtml(text.slice(lastPos));
  return result;
}

/**
 * chapter content + layout → LayoutItem/ImageLayoutItem 배열
 */
export function buildLayoutItems(
  content: string,
  annotations: Annotation[],
  images: ImageInsertion[]
): (LayoutItem | ImageLayoutItem)[] {
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());
  const result: (LayoutItem | ImageLayoutItem)[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i];
    result.push({
      type: 'paragraph',
      paragraphIndex: i,
      text,
      html: applyAnnotations(text, annotations, i),
    });

    // 이 문단 다음에 삽입할 이미지
    const afterImages = images.filter((img) => img.afterParagraphIndex === i);
    for (const img of afterImages) {
      result.push({ type: 'image', image: img });
    }
  }

  return result;
}
