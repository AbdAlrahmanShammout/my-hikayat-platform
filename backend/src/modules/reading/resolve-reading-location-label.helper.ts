import { BookLayoutType } from '@/modules/book/enum/general.enum';

type ResolveReadingLocationLabelInput = {
  readonly layoutType: BookLayoutType;
  readonly spineIndex: number | null;
  readonly chapterTitle: string | null;
  readonly pageNumber: number | null;
  readonly pageCount: number;
  readonly spreadIndex: number | null;
  readonly spreadCount: number;
};

/**
 * Builds a display location from stored progress and processed book structure.
 */
export function resolveReadingLocationLabel(
  input: ResolveReadingLocationLabelInput,
): string | null {
  if (input.layoutType === BookLayoutType.REFLOWABLE) {
    return resolveReflowableLocationLabel(input.chapterTitle, input.spineIndex);
  }
  return resolveFixedLayoutLocationLabel(input);
}

function resolveReflowableLocationLabel(
  chapterTitle: string | null,
  spineIndex: number | null,
): string | null {
  if (chapterTitle !== null && chapterTitle.trim() !== '') {
    return chapterTitle;
  }
  if (spineIndex === null) {
    return null;
  }
  return `Chapter ${spineIndex + 1}`;
}

function resolveFixedLayoutLocationLabel(
  input: ResolveReadingLocationLabelInput,
): string | null {
  if (input.pageNumber !== null && input.pageCount > 0) {
    return `Page ${input.pageNumber} of ${input.pageCount}`;
  }
  if (input.spreadIndex !== null && input.spreadCount > 0) {
    return `Spread ${input.spreadIndex + 1} of ${input.spreadCount}`;
  }
  if (input.pageNumber !== null) {
    return `Page ${input.pageNumber}`;
  }
  if (input.spreadIndex !== null) {
    return `Spread ${input.spreadIndex + 1}`;
  }
  return null;
}
