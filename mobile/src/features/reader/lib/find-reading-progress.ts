import { ApiError } from '@/api/api-error';
import {
  getReadingProgress,
  type ReadingProgress,
} from '@/features/reader/api/get-reading-progress';

/**
 * Loads Smart Resume progress when present; returns null when none is saved yet.
 */
export async function findReadingProgress(bookId: number): Promise<ReadingProgress | null> {
  try {
    return await getReadingProgress(bookId);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}
