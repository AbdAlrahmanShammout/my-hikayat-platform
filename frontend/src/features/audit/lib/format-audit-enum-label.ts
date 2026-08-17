/**
 * Presents a backend audit enum without changing its meaning.
 */
export function formatAuditEnumLabel(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Unknown';
  }
  const [firstWord, ...rest] = value.split('_');
  if (firstWord === undefined || firstWord === '') {
    return value;
  }
  return [capitalizeWord(firstWord), ...rest].join(' ');
}

function capitalizeWord(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
