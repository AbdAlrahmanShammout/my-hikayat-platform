import { useCallback, useEffect, useState, type JSX } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { ReadingBookmark } from '@/features/reader/api/create-reading-bookmark';
import { createReadingBookmark } from '@/features/reader/api/create-reading-bookmark';
import { deleteReadingBookmark } from '@/features/reader/api/delete-reading-bookmark';
import { listReadingBookmarkItems } from '@/features/reader/api/list-reading-bookmarks';
import { theme } from '@/theme/theme';

export type ReflowableBookmarkPosition = {
  readonly kind: 'reflowable';
  readonly spineIndex: number;
  readonly scrollOffset: number;
};

export type FixedLayoutBookmarkPosition = {
  readonly kind: 'fixed_layout';
  readonly spreadIndex: number;
  readonly pageNumber: number;
};

export type ReaderBookmarkPosition =
  | ReflowableBookmarkPosition
  | FixedLayoutBookmarkPosition;

type ReaderBookmarksPanelProps = {
  readonly bookId: number;
  readonly layoutType: 'reflowable' | 'fixed_layout';
  readonly currentPosition: ReaderBookmarkPosition;
  readonly onJump: (bookmark: ReadingBookmark) => void;
};

/**
 * In-reader bookmarks: list, add at current position, delete, and jump.
 */
export function ReaderBookmarksPanel({
  bookId,
  layoutType,
  currentPosition,
  onJump,
}: ReaderBookmarksPanelProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<readonly ReadingBookmark[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeReload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const items: readonly ReadingBookmark[] = await listReadingBookmarkItems(bookId);
      setBookmarks(items);
    } catch {
      setErrorMessage('Could not load bookmarks right now.');
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    void executeReload();
  }, [executeReload, isOpen]);

  async function executeAdd(): Promise<void> {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await createReadingBookmark({
        bookId,
        body: buildCreateBody(currentPosition),
      });
      await executeReload();
    } catch {
      setErrorMessage('Could not save that bookmark.');
    } finally {
      setIsSaving(false);
    }
  }

  async function executeDelete(bookmarkId: number): Promise<void> {
    setErrorMessage(null);
    try {
      await deleteReadingBookmark({ bookId, bookmarkId });
      setBookmarks((current) => current.filter((item) => item.id !== bookmarkId));
    } catch {
      setErrorMessage('Could not remove that bookmark.');
    }
  }

  return (
    <>
      <Pressable
        style={styles.openButton}
        onPress={() => {
          setIsOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Open bookmarks"
        testID="reader-bookmarks-open"
      >
        <Text style={styles.openLabel}>Bookmarks</Text>
      </Pressable>
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setIsOpen(false);
        }}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet} testID="reader-bookmarks-panel">
            <Text style={styles.title} accessibilityRole="header">
              Bookmarks
            </Text>
            <Text style={styles.subtitle}>
              {layoutType === 'reflowable'
                ? 'Save and jump to chapter positions.'
                : 'Save and jump to spreads.'}
            </Text>
            <Pressable
              style={[styles.primaryButton, isSaving ? styles.disabled : null]}
              disabled={isSaving}
              onPress={() => {
                void executeAdd();
              }}
              accessibilityRole="button"
              accessibilityLabel="Add bookmark here"
              testID="reader-bookmark-add"
            >
              <Text style={styles.primaryLabel}>
                {isSaving ? 'Saving…' : 'Add bookmark here'}
              </Text>
            </Pressable>
            {errorMessage !== null ? <Text style={styles.error}>{errorMessage}</Text> : null}
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
            ) : (
              <ScrollView style={styles.list} testID="reader-bookmarks-list">
                {bookmarks.length === 0 ? (
                  <Text style={styles.empty} testID="reader-bookmarks-empty">
                    No bookmarks yet.
                  </Text>
                ) : (
                  bookmarks.map((bookmark) => (
                    <View key={bookmark.id} style={styles.row} testID={`reader-bookmark-${bookmark.id}`}>
                      <Pressable
                        style={styles.jumpButton}
                        onPress={() => {
                          onJump(bookmark);
                          setIsOpen(false);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Go to bookmark ${bookmark.id}`}
                        testID={`reader-bookmark-jump-${bookmark.id}`}
                      >
                        <Text style={styles.jumpLabel}>{formatBookmarkLabel(bookmark)}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => {
                          void executeDelete(bookmark.id);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete bookmark ${bookmark.id}`}
                        testID={`reader-bookmark-delete-${bookmark.id}`}
                      >
                        <Text style={styles.deleteLabel}>Remove</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setIsOpen(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="Close bookmarks"
              testID="reader-bookmarks-close"
            >
              <Text style={styles.closeLabel}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function buildCreateBody(position: ReaderBookmarkPosition): {
  readonly spineIndex?: number;
  readonly scrollOffset?: number;
  readonly spreadIndex?: number;
  readonly pageNumber?: number;
} {
  if (position.kind === 'reflowable') {
    return {
      spineIndex: position.spineIndex,
      scrollOffset: position.scrollOffset,
    };
  }
  return {
    spreadIndex: position.spreadIndex,
    pageNumber: position.pageNumber,
  };
}

function formatBookmarkLabel(bookmark: ReadingBookmark): string {
  if (bookmark.layoutType === 'reflowable') {
    const chapter: number =
      typeof bookmark.spineIndex === 'number' ? bookmark.spineIndex + 1 : 1;
    const offset: number =
      typeof bookmark.scrollOffset === 'number' ? Math.round(bookmark.scrollOffset) : 0;
    return `Chapter ${chapter} · scroll ${offset}`;
  }
  const spread: number =
    typeof bookmark.spreadIndex === 'number' ? bookmark.spreadIndex + 1 : 1;
  const page: number = typeof bookmark.pageNumber === 'number' ? bookmark.pageNumber : 1;
  return `Spread ${spread} · page ${page}`;
}

const styles = StyleSheet.create({
  openButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  openLabel: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  primaryButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  primaryLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
  disabled: {
    opacity: 0.55,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
  loader: {
    marginVertical: theme.spacing.md,
  },
  list: {
    flexGrow: 0,
  },
  empty: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    paddingVertical: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  jumpButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  jumpLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  deleteButton: {
    minHeight: 48,
    borderRadius: theme.radii.control,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  deleteLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  closeButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
});
