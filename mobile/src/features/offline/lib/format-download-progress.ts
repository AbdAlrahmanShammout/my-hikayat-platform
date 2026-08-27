export type DownloadProgressInput = {
  readonly totalBytesWritten: number;
  readonly totalBytesExpectedToWrite: number;
};

/**
 * Formats ciphertext download progress as a kids-friendly percent, or null when size is unknown.
 */
export function formatDownloadProgress(input: DownloadProgressInput): string | null {
  if (
    !Number.isFinite(input.totalBytesWritten) ||
    !Number.isFinite(input.totalBytesExpectedToWrite) ||
    input.totalBytesExpectedToWrite <= 0
  ) {
    return null;
  }
  const ratio: number = Math.min(
    1,
    Math.max(0, input.totalBytesWritten / input.totalBytesExpectedToWrite),
  );
  const percent: number = Math.floor(ratio * 100);
  return `Downloading… ${percent}%`;
}
