import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

// 配置 marked 与代码高亮
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

// 配置 marked 选项
marked.setOptions({
  breaks: true, // 支持 GitHub 风格的换行
  gfm: true, // 启用 GitHub 风格的 Markdown
});

/**
 * 将 Markdown 文本转换为 HTML
 * @param markdown - Markdown 格式的文本
 * @returns HTML 格式的文本
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';
  return marked.parse(markdown) as string;
}