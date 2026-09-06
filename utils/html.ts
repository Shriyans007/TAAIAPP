export const stripHtml = (html = '') =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

export function decodeHtml(value = '') {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

export function contentBlocks(html = '') {
  const safe = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '');
  const blocks: Array<{ type: 'heading' | 'paragraph'; text: string }> = [];
  const pattern = /<(h[1-6]|p|li|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(safe))) {
    const text = decodeHtml(stripHtml(match[2]));
    if (!text) continue;
    blocks.push({ type: match[1].toLowerCase().startsWith('h') ? 'heading' : 'paragraph', text });
  }
  if (!blocks.length) {
    const text = decodeHtml(stripHtml(safe));
    if (text) blocks.push({ type: 'paragraph', text });
  }
  return blocks;
}
