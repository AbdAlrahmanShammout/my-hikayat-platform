import { Alert } from 'react-native';

import { listOfflineManifests } from '@/features/offline/lib/offline-manifest-storage';

export type OfflinePurgeConfirmKind = 'sign_out' | 'abandon_restore';

export type OfflinePurgeConfirmCopy = {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
};

export type OfflinePurgeConfirmResult = 'confirmed' | 'cancelled' | 'skipped';

export type PresentOfflinePurgeAlert = (
  title: string,
  message: string,
  buttons: ReadonlyArray<{
    readonly text: string;
    readonly style?: 'default' | 'cancel' | 'destructive';
    readonly onPress?: () => void;
  }>,
) => void;

/**
 * Builds user-facing copy for confirming that sign-out / abandon will purge downloads.
 * Display only — purge behavior stays in session sign-out / abandon handlers.
 */
export function buildOfflinePurgeConfirmCopy(input: {
  readonly kind: OfflinePurgeConfirmKind;
  readonly packageCount: number;
}): OfflinePurgeConfirmCopy {
  const bookWord: string = input.packageCount === 1 ? 'book' : 'books';
  const countLabel: string = String(input.packageCount);
  if (input.kind === 'abandon_restore') {
    return {
      title: 'Remove downloaded books?',
      message: `Starting over removes ${countLabel} downloaded ${bookWord} from this device. You can download ${input.packageCount === 1 ? 'it' : 'them'} again after you sign in.`,
      confirmLabel: 'Remove and sign in',
      cancelLabel: 'Cancel',
    };
  }
  return {
    title: 'Remove downloaded books?',
    message: `Signing out removes ${countLabel} downloaded ${bookWord} from this device. You can download ${input.packageCount === 1 ? 'it' : 'them'} again after you sign in.`,
    confirmLabel: 'Sign out and remove',
    cancelLabel: 'Cancel',
  };
}

/**
 * Returns true when offline packages exist and a destructive confirmation is required.
 */
export function shouldRequireOfflinePurgeConfirmation(packageCount: number): boolean {
  return packageCount > 0;
}

/**
 * Runs the destructive action immediately when there are no downloads; otherwise asks first.
 * Choice documented for MG-9: no downloads → no confirm dialog.
 */
export async function confirmOfflinePurgeIfNeeded(input: {
  readonly kind: OfflinePurgeConfirmKind;
  readonly onConfirm: () => void | Promise<void>;
  readonly presentAlert?: PresentOfflinePurgeAlert;
}): Promise<OfflinePurgeConfirmResult> {
  const packages = await listOfflineManifests();
  if (!shouldRequireOfflinePurgeConfirmation(packages.length)) {
    await input.onConfirm();
    return 'skipped';
  }
  const copy: OfflinePurgeConfirmCopy = buildOfflinePurgeConfirmCopy({
    kind: input.kind,
    packageCount: packages.length,
  });
  const presentAlert: PresentOfflinePurgeAlert =
    input.presentAlert ??
    ((title, message, buttons) => {
      Alert.alert(title, message, [...buttons]);
    });
  return new Promise<OfflinePurgeConfirmResult>((resolve) => {
    presentAlert(copy.title, copy.message, [
      {
        text: copy.cancelLabel,
        style: 'cancel',
        onPress: () => {
          resolve('cancelled');
        },
      },
      {
        text: copy.confirmLabel,
        style: 'destructive',
        onPress: () => {
          void Promise.resolve(input.onConfirm()).then(() => {
            resolve('confirmed');
          });
        },
      },
    ]);
  });
}
