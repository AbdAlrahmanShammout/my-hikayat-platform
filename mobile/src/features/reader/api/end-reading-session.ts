import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';
import type { ReadingSession } from '@/features/reader/api/start-reading-session';

export type EndReadingSessionRequest = components['schemas']['EndReadingSessionRequestDto'];

/**
 * Ends an open reading session. Placeholder engines call this when closing.
 */
export async function endReadingSession(input: {
  readonly bookId: number;
  readonly sessionId: number;
  readonly body?: EndReadingSessionRequest;
}): Promise<ReadingSession> {
  return requestJson<ReadingSession>({
    path: `/reader/books/${input.bookId}/sessions/${input.sessionId}/end`,
    method: 'POST',
    body: input.body ?? {},
  });
}
