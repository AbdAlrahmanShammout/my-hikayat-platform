import { requestJson } from '@/api/client';
import type { components } from '@/generated/reader';

export type IngestReadingVisualEngagementRequest =
  components['schemas']['IngestReadingVisualEngagementRequestDto'];

export type ReadingVisualEngagement =
  components['schemas']['ReadingVisualEngagementResponse'];

/**
 * Reports fixed-layout visual engagement for an open session.
 */
export async function ingestReadingVisualEngagement(input: {
  readonly bookId: number;
  readonly sessionId: number;
  readonly body: IngestReadingVisualEngagementRequest;
}): Promise<ReadingVisualEngagement> {
  return requestJson<ReadingVisualEngagement>({
    path: `/reader/books/${input.bookId}/sessions/${input.sessionId}/visual-engagement`,
    method: 'POST',
    body: input.body,
  });
}
