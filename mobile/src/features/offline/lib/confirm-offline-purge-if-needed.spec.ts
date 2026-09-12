import {
  buildOfflinePurgeConfirmCopy,
  confirmOfflinePurgeIfNeeded,
  shouldRequireOfflinePurgeConfirmation,
  type PresentOfflinePurgeAlert,
} from './confirm-offline-purge-if-needed';
import { listOfflineManifests } from './offline-manifest-storage';

jest.mock('./offline-manifest-storage', () => ({
  listOfflineManifests: jest.fn(),
}));

const mockListOfflineManifests = listOfflineManifests as jest.MockedFunction<
  typeof listOfflineManifests
>;

describe('confirm offline purge helpers', () => {
  beforeEach(() => {
    mockListOfflineManifests.mockReset();
  });

  it('always requires a confirmation sheet', () => {
    expect(shouldRequireOfflinePurgeConfirmation(0)).toBe(true);
    expect(shouldRequireOfflinePurgeConfirmation(1)).toBe(true);
  });

  it('builds a non-destructive sign-out sheet when there are no downloads', () => {
    const actual = buildOfflinePurgeConfirmCopy({ kind: 'sign_out', packageCount: 0 });
    expect(actual.confirmLabel).toBe('Sign out');
    expect(actual.confirmVariant).toBe('primary');
  });

  it('builds sign-out copy for one and many downloads', () => {
    expect(
      buildOfflinePurgeConfirmCopy({ kind: 'sign_out', packageCount: 1 }).message,
    ).toContain('1 downloaded book');
    expect(
      buildOfflinePurgeConfirmCopy({ kind: 'sign_out', packageCount: 2 }).confirmLabel,
    ).toBe('Sign out and remove');
  });

  it('builds abandon-restore copy', () => {
    const actual = buildOfflinePurgeConfirmCopy({
      kind: 'abandon_restore',
      packageCount: 3,
    });
    expect(actual.confirmLabel).toBe('Remove and sign in');
    expect(actual.message).toContain('3 downloaded books');
  });

  it('shows a dialog even when there are no downloads', async () => {
    mockListOfflineManifests.mockResolvedValue([]);
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const presentAlert: PresentOfflinePurgeAlert = (_title, _message, buttons) => {
      const confirmButton = buttons.find((button) => button.style !== 'cancel');
      confirmButton?.onPress?.();
    };
    const actual = await confirmOfflinePurgeIfNeeded({
      kind: 'sign_out',
      onConfirm,
      presentAlert,
    });
    expect(actual).toBe('confirmed');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows a dialog and runs confirm only when accepted', async () => {
    mockListOfflineManifests.mockResolvedValue([
      { bookId: 1 } as never,
      { bookId: 2 } as never,
    ]);
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const presentAlert: PresentOfflinePurgeAlert = (_title, _message, buttons) => {
      const confirmButton = buttons.find((button) => button.style === 'destructive');
      confirmButton?.onPress?.();
    };
    const actual = await confirmOfflinePurgeIfNeeded({
      kind: 'sign_out',
      onConfirm,
      presentAlert,
    });
    expect(actual).toBe('confirmed');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancels without purging when the user dismisses', async () => {
    mockListOfflineManifests.mockResolvedValue([{ bookId: 1 } as never]);
    const onConfirm = jest.fn();
    const presentAlert: PresentOfflinePurgeAlert = (_title, _message, buttons) => {
      const cancelButton = buttons.find((button) => button.style === 'cancel');
      cancelButton?.onPress?.();
    };
    const actual = await confirmOfflinePurgeIfNeeded({
      kind: 'abandon_restore',
      onConfirm,
      presentAlert,
    });
    expect(actual).toBe('cancelled');
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
