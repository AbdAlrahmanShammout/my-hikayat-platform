import type { SaveReadingProgressRequest } from '@/features/reader/api/save-reading-progress';
import { saveReadingProgress } from '@/features/reader/api/save-reading-progress';

/**
 * Best-effort Smart Resume save. Reading continues if the request fails.
 */
export async function saveReadingProgressBestEffort(input: {
  readonly bookId: number;
  readonly body: SaveReadingProgressRequest;
}): Promise<void> {
  try {
    await saveReadingProgress(input);
  } catch {
    // Progress save is best-effort; engines keep reading if it fails.
  }
}
