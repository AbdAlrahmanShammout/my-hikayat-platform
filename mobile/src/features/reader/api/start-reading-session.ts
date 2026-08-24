import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type StartReadingSessionRequest =
  components['schemas']['StartReadingSessionRequestDto'];

export type ReadingSession = components['schemas']['ReadingSessionResponse'];

/**
 * Starts an open reading session for a book. Backend requires layout-valid position.
 */
export async function startReadingSession(input: {
  readonly bookId: number;
  readonly body: StartReadingSessionRequest;
}): Promise<ReadingSession> {
  return requestJson<ReadingSession>({
    path: `/reader/books/${input.bookId}/sessions`,
    method: 'POST',
    body: input.body,
  });
}
