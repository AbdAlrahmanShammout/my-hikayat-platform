import { useCallback, useEffect, useState, type JSX } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ReadingBookmark } from '@/features/reader/api/create-reading-bookmark';
import {
  addReaderBookmark,
  loadReaderBookmarks,
  removeReaderBookmark,
  type ReaderBookmarkListItem,
} from '@/features/reader/lib/reader-bookmark-actions';
import { theme } from '@/theme/theme';
import { BottomSheet } from '@/ui/layout/bottom-sheet';
import { Button } from '@/ui/primitives/button';

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
  readonly tone?: 'light' | 'dark';
};

/**
 * In-reader bookmarks: list, add at current position, delete, and jump.
 * Supports offline local persistence with reconnect sync.
 */
export function ReaderBookmarksPanel({
  bookId,
  layoutType,
  currentPosition,
  onJump,
  tone = 'light',
}: ReaderBookmarksPanelProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<readonly ReaderBookmarkListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const executeReload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const items: readonly ReaderBookmarkListItem[] = await loadReaderBookmarks(bookId);
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
      await addReaderBookmark({
        bookId,
        layoutType,
        position: currentPosition,
      });
      await executeReload();
    } catch {
      setErrorMessage('Could not save that bookmark.');
    } finally {
      setIsSaving(false);
    }
  }
  async function executeDelete(item: ReaderBookmarkListItem): Promise<void> {
    setErrorMessage(null);
    try {
      await removeReaderBookmark({
        bookId,
        localId: item.localId,
        serverId: item.serverId,
      });
      setBookmarks((current) => current.filter((entry) => entry.localId !== item.localId));
    } catch {
      setErrorMessage('Could not remove that bookmark.');
    }
  }
  return (
    <>
      <Pressable
        style={[styles.openButton, tone === 'dark' ? styles.openButtonDark : null]}
        onPress={() => {
          setIsOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Open bookmarks"
        testID="reader-bookmarks-open"
      >
        <Text style={[styles.openLabel, tone === 'dark' ? styles.openLabelDark : null]}>
          Bookmarks
        </Text>
      </Pressable>
      <BottomSheet
        isVisible={isOpen}
        onDismiss={() => {
          setIsOpen(false);
        }}
        accessibilityLabel="Bookmarks"
      >
        <View style={styles.sheet} testID="reader-bookmarks-panel">
          <Text style={styles.title} accessibilityRole="header">
            Bookmarks
          </Text>
          <Text style={styles.subtitle}>
            {layoutType === 'reflowable'
              ? 'Save and jump to chapter positions.'
              : 'Save and jump to spreads.'}
          </Text>
          <Button
            label={isSaving ? 'Saving…' : 'Add bookmark here'}
            onPress={() => {
              void executeAdd();
            }}
            isDisabled={isSaving}
            isLoading={isSaving}
            accessibilityLabel="Add bookmark here"
            testID="reader-bookmark-add"
          />
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
                bookmarks.map((item) => (
                  <View
                    key={item.localId}
                    style={styles.row}
                    testID={`reader-bookmark-${item.localId}`}
                  >
                    <Pressable
                      style={styles.jumpButton}
                      onPress={() => {
                        onJump(item.bookmark);
                        setIsOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Go to bookmark ${formatBookmarkLabel(item.bookmark)}`}
                      testID={`reader-bookmark-jump-${item.localId}`}
                    >
                      <Text style={styles.jumpLabel}>{formatBookmarkLabel(item.bookmark)}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => {
                        void executeDelete(item);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete bookmark ${formatBookmarkLabel(item.bookmark)}`}
                      testID={`reader-bookmark-delete-${item.localId}`}
                    >
                      <Text style={styles.deleteLabel}>Remove</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
          )}
          <Button
            label="Close"
            onPress={() => {
              setIsOpen(false);
            }}
            variant="secondary"
            accessibilityLabel="Close bookmarks"
            testID="reader-bookmarks-close"
          />
        </View>
      </BottomSheet>
    </>
  );
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
    minWidth: theme.controlMinHeight,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  openLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  openLabelDark: {
    color: theme.colors.textOnDark,
  },
  sheet: {
    gap: theme.spacing.sm,
    maxHeight: 480,
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
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
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.canvasWarm,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  jumpLabel: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  deleteButton: {
    minHeight: theme.controlMinHeight,
    minWidth: theme.controlMinHeight,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  deleteLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.error,
  },
});
