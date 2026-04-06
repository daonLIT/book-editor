export interface Chapter {
  id: string;
  title: string;
  content: string; // 순수 plain text, 문단은 \n\n 구분
}

export interface TextRange {
  paragraphIndex: number; // 몇 번째 문단 (0-based)
  start: number;          // 문단 내 시작 offset
  end: number;            // 문단 내 끝 offset
}

export interface Annotation {
  id: string;
  type: 'bold' | 'italic' | 'underline' | 'highlight' | 'comment';
  range: TextRange;
  color?: string;       // highlight 색상 (예: '#fef08a')
  commentText?: string; // comment 내용
}

export interface ImageInsertion {
  id: string;
  afterParagraphIndex: number; // 이 문단 다음에 삽입
  src: string;                 // data URL
  caption?: string;
}

export interface ChapterLayout {
  annotations: Annotation[];
  images: ImageInsertion[];
}

export interface Book {
  id: string;
  title: string;
  chapters: Chapter[];
  layouts: Record<string, ChapterLayout>; // chapterId → layout
}
