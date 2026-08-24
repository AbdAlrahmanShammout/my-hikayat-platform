import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';
import type { ReadingSession } from '@/features/reader/api/start-reading-session';

export type IngestReadingActivityRequest =
  components['schemas']['IngestReadingActivityRequestDto'];

/**
 * Reports active/idle time and reflowable position for an open session.
 */
export async function ingestReadingActivity(input: {
  readonly bookId: number;
  readonly sessionId: number;
  readonly body: IngestReadingActivityRequest;
}): Promise<ReadingSession> {
  return requestJson<ReadingSession>({
    path: `/reader/books/${input.bookId}/sessions/${input.sessionId}/activity`,
    method: 'POST',
    body: input.body,
  });
}
