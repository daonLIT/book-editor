// MVP: 글자 수 기준 단순 페이지 분할
const CHARS_PER_PAGE = 600;

export function paginateText(text: string): string[] {
  if (!text.trim()) return [''];

  const pages: string[] = [];
  // 문단 단위로 우선 분리
  const paragraphs = text.split(/\n\n+/);
  let currentPage = '';

  for (const paragraph of paragraphs) {
    const candidate = currentPage ? currentPage + '\n\n' + paragraph : paragraph;
    if (candidate.length > CHARS_PER_PAGE && currentPage) {
      pages.push(currentPage);
      currentPage = paragraph;
    } else {
      currentPage = candidate;
    }
  }

  if (currentPage) {
    pages.push(currentPage);
  }

  return pages.length ? pages : [''];
}
