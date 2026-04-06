// HTML 콘텐츠에서 텍스트만 추출
function extractText(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// HTML을 블록 단위(<p>, <h1~3>)로 분리
function splitHtmlBlocks(html: string): string[] {
  if (!html.trim()) return [];
  // 블록 태그 기준으로 분리
  const blocks = html.split(/(?=<(?:p|h[1-3])[^>]*>)/i).filter(Boolean);
  return blocks.length ? blocks : [html];
}

const CHARS_PER_PAGE = 600;

export function paginateHtml(html: string): string[] {
  if (!html.trim()) return [''];

  const blocks = splitHtmlBlocks(html);
  const pages: string[] = [];
  let currentPage = '';
  let currentLength = 0;

  for (const block of blocks) {
    const blockText = extractText(block);
    if (currentLength + blockText.length > CHARS_PER_PAGE && currentPage) {
      pages.push(currentPage);
      currentPage = block;
      currentLength = blockText.length;
    } else {
      currentPage += block;
      currentLength += blockText.length;
    }
  }

  if (currentPage) pages.push(currentPage);
  return pages.length ? pages : [''];
}
