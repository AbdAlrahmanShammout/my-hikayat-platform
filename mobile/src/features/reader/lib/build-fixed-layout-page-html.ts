/**
 * Builds a sandboxed HTML document for fixed-layout page rendering at locked page dimensions.
 * WebView is used only as an isolated EPUB HTML viewport (no native bridges).
 */
export function buildFixedLayoutPageHtml(input: {
  readonly title: string;
  readonly htmlDocument: string;
  readonly width: number;
  readonly height: number;
}): string {
  const width: number = Math.max(1, Math.round(input.width));
  const height: number = Math.max(1, Math.round(input.height));
  const bodyHtml: string = extractBodyHtml(input.htmlDocument);
  const headExtras: string = extractHeadExtras(input.htmlDocument);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=${width}, height=${height}, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>${escapeHtml(input.title)}</title>
  ${headExtras}
  <style>
    :root { color-scheme: light; }
    html, body {
      margin: 0;
      padding: 0;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: #ffffff;
    }
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

function extractHeadExtras(documentXml: string): string {
  const headMatch: RegExpMatchArray | null = documentXml.match(
    /<head\b[^>]*>([\s\S]*?)<\/head>/i,
  );
  if (headMatch?.[1] === undefined) {
    return '';
  }
  return headMatch[1]
    .replace(/<meta\b[^>]*viewport[^>]*>/gi, '')
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/>/gi, '');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
