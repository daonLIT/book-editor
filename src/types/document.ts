export interface Chapter {
  id: string;
  title: string;
  content: string; // MVP: 단순 텍스트
}

export interface Book {
  id: string;
  title: string;
  chapters: Chapter[];
}
