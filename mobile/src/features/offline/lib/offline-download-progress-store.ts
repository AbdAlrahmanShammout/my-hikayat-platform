export type OfflineDownloadProgress = {
  readonly bookId: number;
  readonly title: string;
  readonly label: string;
};

type Listener = () => void;

let currentProgress: OfflineDownloadProgress | null = null;
const listeners = new Set<Listener>();

/**
 * Ephemeral in-memory download progress for My Books while a package is saving.
 */
export const offlineDownloadProgressStore = {
  getSnapshot(): OfflineDownloadProgress | null {
    return currentProgress;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  publish(progress: OfflineDownloadProgress): void {
    currentProgress = progress;
    emit();
  },
  clear(bookId?: number): void {
    if (bookId !== undefined && currentProgress?.bookId !== bookId) {
      return;
    }
    currentProgress = null;
    emit();
  },
};

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}
