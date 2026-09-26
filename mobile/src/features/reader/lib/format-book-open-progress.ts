import type { BookOpenProgress } from '@/features/reader/lib/download-and-decrypt-book-source';

const BYTES_PER_KIBIBYTE = 1024;
const BYTES_PER_MEBIBYTE = 1024 * 1024;

export type FormattedBookOpenProgress = {
  readonly fraction: number | null;
  readonly label: string;
};

/**
 * Turns a real download or prepare update into a bar fraction and a remaining-size label.
 */
export function formatBookOpenProgress(progress: BookOpenProgress): FormattedBookOpenProgress {
  if (progress.phase === 'preparing') {
    return { fraction: 1, label: 'Preparing the book…' };
  }
  return formatDownloadProgress(progress.loadedBytes, progress.totalBytes);
}

function formatDownloadProgress(
  loadedBytes: number,
  totalBytes: number | null,
): FormattedBookOpenProgress {
  if (totalBytes === null || totalBytes <= 0) {
    return {
      fraction: null,
      label: `Downloading book · ${formatByteSize(loadedBytes)}`,
    };
  }
  const fraction: number = Math.min(1, Math.max(0, loadedBytes / totalBytes));
  const percent: number = Math.floor(fraction * 100);
  const remainingBytes: number = Math.max(0, totalBytes - loadedBytes);
  return {
    fraction,
    label: `Downloading book · ${percent}% · ${formatByteSize(remainingBytes)} left`,
  };
}

function formatByteSize(bytes: number): string {
  const safeBytes: number = Math.max(0, bytes);
  if (safeBytes >= BYTES_PER_MEBIBYTE) {
    return `${(safeBytes / BYTES_PER_MEBIBYTE).toFixed(1)} MB`;
  }
  if (safeBytes >= BYTES_PER_KIBIBYTE) {
    return `${Math.round(safeBytes / BYTES_PER_KIBIBYTE)} KB`;
  }
  return `${Math.round(safeBytes)} B`;
}
