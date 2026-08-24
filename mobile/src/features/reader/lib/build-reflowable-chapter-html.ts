/**
 * Builds a sandboxed HTML document for WebView chapter rendering.
 * WebView is used only as an isolated EPUB HTML viewport (no native bridges).
 */
export function buildReflowableChapterHtml(input: {
  readonly title: string;
  readonly htmlDocument: string;
  readonly fontScalePercent: number;
  readonly lineHeight: number;
  readonly marginPx: number;
  readonly theme: 'light' | 'dark';
}): string {
  const bodyHtml: string = extractBodyHtml(input.htmlDocument);
  const fontScale: number = Math.min(160, Math.max(90, input.fontScalePercent));
  const lineHeight: number = Math.min(2, Math.max(1.2, input.lineHeight));
  const marginPx: number = Math.min(36, Math.max(8, Math.round(input.marginPx)));
  const isDark: boolean = input.theme === 'dark';
  const background: string = isDark ? '#1a1714' : '#f7f3ea';
  const foreground: string = isDark ? '#f4efe6' : '#1f1a14';
  const link: string = isDark ? '#7dcdb8' : '#0f5c4c';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>${escapeHtml(input.title)}</title>
  <style>
    :root { color-scheme: ${isDark ? 'dark' : 'light'}; }
    html, body {
      margin: 0;
      padding: 0;
      background: ${background};
      color: ${foreground};
      font-family: Georgia, "Times New Roman", serif;
      font-size: ${fontScale}%;
      line-height: ${lineHeight};
    }
    body { padding: 16px ${marginPx}px 48px; }
    img, svg { max-width: 100%; height: auto; }
    a { color: ${link}; }
    p { margin: 0 0 0.9em; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

function extractBodyHtml(documentXml: string): string {
  const bodyMatch: RegExpMatchArray | null = documentXml.match(
    /<body\b[^>]*>([\s\S]*?)<\/body>/i,
  );
  if (bodyMatch?.[1] !== undefined) {
    return bodyMatch[1];
  }
  return documentXml;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
