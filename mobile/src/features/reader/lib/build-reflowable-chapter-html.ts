/**
 * Builds a sandboxed HTML document for WebView chapter rendering.
 * WebView is used only as an isolated EPUB HTML viewport (no native bridges).
 */
export function buildReflowableChapterHtml(input: {
  readonly title: string;
  readonly htmlDocument: string;
  readonly fontScalePercent: number;
}): string {
  const bodyHtml: string = extractBodyHtml(input.htmlDocument);
  const fontScale: number = Math.min(160, Math.max(90, input.fontScalePercent));
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>${escapeHtml(input.title)}</title>
  <style>
    :root { color-scheme: light; }
    html, body {
      margin: 0;
      padding: 0;
      background: #f7f3ea;
      color: #1f1a14;
      font-family: Georgia, "Times New Roman", serif;
      font-size: ${fontScale}%;
      line-height: 1.55;
    }
    body { padding: 16px 18px 48px; }
    img, svg { max-width: 100%; height: auto; }
    a { color: #0f5c4c; }
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
