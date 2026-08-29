import { ApiError } from '@/api/api-error';

export type OpenReaderErrorKind =
  | 'entitlement_denied'
  | 'session_conflict'
  | 'layout_unavailable'
  | 'not_found'
  | 'generic';

export type MappedOpenReaderError = {
  readonly kind: OpenReaderErrorKind;
  readonly message: string;
};

/**
 * Maps open-reader API failures to kids-friendly copy. No client entitlement rules.
 */
export function mapOpenReaderError(error: unknown): MappedOpenReaderError {
  if (error instanceof ApiError) {
    if (error.code === 'OFFLINE_LEASE_EXPIRED') {
      return {
        kind: 'entitlement_denied',
        message: error.message,
      };
    }
    if (error.code === 'FULL_BOOK_ACCESS_DENIED' || error.statusCode === 403) {
      return {
        kind: 'entitlement_denied',
        message:
          'You need full-book access to read this book. Ask a grown-up to Start Free Trial or Subscribe on Profile.',
      };
    }
    if (error.code === 'READING_SESSION_ALREADY_OPEN') {
      return {
        kind: 'session_conflict',
        message: 'This book is already open. Trying again…',
      };
    }
    if (error.code === 'READER_LAYOUT_UNAVAILABLE') {
      return {
        kind: 'layout_unavailable',
        message: 'This book is not ready to open in a reader yet.',
      };
    }
    if (error.code === 'OFFLINE_PACKAGE_MISSING') {
      return {
        kind: 'not_found',
        message:
          'This book is not downloaded for offline reading. Connect to the internet or download it first.',
      };
    }
    if (error.statusCode === 404) {
      return {
        kind: 'not_found',
        message: 'That book is not available to read.',
      };
    }
    return {
      kind: 'generic',
      message: error.message.trim() !== '' ? error.message : 'Could not open this book.',
    };
  }
  if (error instanceof Error && error.message.trim() !== '') {
    return { kind: 'generic', message: error.message };
  }
  return { kind: 'generic', message: 'Could not open this book.' };
}
