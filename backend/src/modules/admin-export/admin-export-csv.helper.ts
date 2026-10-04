export function toCsvDocument(
  columns: readonly string[],
  rows: readonly Record<string, unknown>[],
): string {
  const header: string = columns.map((column) => escapeCsvCell(column)).join(',');
  const lines: string[] = rows.map((row) =>
    columns.map((column) => escapeCsvCell(formatCsvValue(row[column]))).join(','),
  );
  return [header, ...lines].join('\n');
}

function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return String(value);
  }
  return '';
}

function escapeCsvCell(value: string): string {
  const guarded: string = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(guarded) || guarded.startsWith("'")) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
}
