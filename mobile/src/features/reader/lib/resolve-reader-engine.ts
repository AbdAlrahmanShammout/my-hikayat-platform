import type { BookLayoutType } from '@/features/reader/lib/build-start-session-body';

export type ReaderEngineKind = 'reflowable' | 'fixed_layout';

/**
 * Selects the reader engine from backend layoutType only (never bookType).
 */
export function resolveReaderEngine(
  layoutType: string | null | undefined,
): ReaderEngineKind | null {
  if (layoutType === 'reflowable' || layoutType === 'fixed_layout') {
    return layoutType;
  }
  return null;
}

export function isBookLayoutType(value: string | null | undefined): value is BookLayoutType {
  return value === 'reflowable' || value === 'fixed_layout';
}
