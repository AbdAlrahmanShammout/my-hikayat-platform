import { useEffect, useRef, useState, type JSX } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import type { BookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import { ingestReadingActivity } from '@/features/reader/api/ingest-reading-activity';
import type { ReadingSession } from '@/features/reader/api/start-reading-session';
import { buildReflowableChapterHtml } from '@/features/reader/lib/build-reflowable-chapter-html';
import { loadReflowableEpubBook } from '@/features/reader/lib/load-reflowable-epub-book';
import type { ParsedEpubBook, ParsedEpubChapter } from '@/features/reader/lib/parse-epub-book';
import {
  DEFAULT_REFLOWABLE_READER_SETTINGS,
  toggleReaderTheme,
  type ReflowableReaderSettings,
} from '@/features/reader/lib/reflowable-reader-settings';
import {
  loadReflowableReaderSettings,
  saveReflowableReaderSettings,
} from '@/features/reader/lib/reflowable-reader-settings-storage';
import { saveReadingProgressBestEffort } from '@/features/reader/lib/save-reading-progress-best-effort';
import type { ReadingPositionSnapshot } from '@/features/reader/lib/reading-position';
import { resolveReflowableContentProgress } from '@/features/reader/lib/resolve-reflowable-content-progress';
import { ReaderBookmarkToggle } from '@/features/reader/components/reader-bookmark-toggle';
import { ReaderBookmarksPanel } from '@/features/reader/components/reader-bookmarks-panel';
import { ReaderChromeButton } from '@/features/reader/components/reader-chrome-button';
import { ReflowableReaderSettingsControls } from '@/features/reader/components/reflowable-reader-settings-controls';
import type { ReadingBookmark } from '@/features/reader/api/create-reading-bookmark';
import { theme } from '@/theme/theme';
import { BottomSheet } from '@/ui/layout/bottom-sheet';
import { Button } from '@/ui/primitives/button';
import { ErrorState } from '@/ui/feedback/error-state';

type ReflowableReaderEngineProps = {
  readonly book: CatalogBook;
  readonly session: ReadingSession;
  readonly deliveryGrant: BookAssetDeliveryGrant | null;
  readonly onClose: () => void;
  readonly onPositionChange?: (position: ReadingPositionSnapshot) => void;
};

type LoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'ready'; readonly epub: ParsedEpubBook };

const ACTIVITY_TICK_MS = 15_000;

/**
 * Reflowable EPUB engine: decrypt in memory, parse spine, render chapter HTML in an isolated WebView.
 *
 * WebView rationale: EPUB chapters are XHTML/HTML with inline assets. A sandboxed WebView is the
 * appropriate Expo viewport for that markup. It is not used for privileged app flows, receives no
 * native bridge methods, and only loads injected HTML (`originWhitelist` limited to about:blank).
 */
export function ReflowableReaderEngine({
  book,
  session,
  deliveryGrant,
  onClose,
  onPositionChange,
}: ReflowableReaderEngineProps): JSX.Element {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [spineIndex, setSpineIndex] = useState<number>(
    coerceNonNegativeInt(session.spineIndex, 0),
  );
  const [scrollOffset, setScrollOffset] = useState<number>(
    coerceNonNegativeInt(session.scrollOffset, 0),
  );
  const [readerSettings, setReaderSettings] = useState<ReflowableReaderSettings>(
    DEFAULT_REFLOWABLE_READER_SETTINGS,
  );
  const [reloadToken, setReloadToken] = useState<number>(0);
  const [isChromeVisible, setIsChromeVisible] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const epubRef = useRef<ParsedEpubBook | null>(null);
  const spineIndexRef = useRef<number>(spineIndex);
  const scrollOffsetRef = useRef<number>(scrollOffset);
  const activeStartedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    let isCancelled = false;
    void loadReflowableReaderSettings().then((loaded) => {
      if (!isCancelled) {
        setReaderSettings(loaded);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  function applyReaderSettings(next: ReflowableReaderSettings): void {
    setReaderSettings(next);
    void saveReflowableReaderSettings(next);
  }

  useEffect(() => {
    spineIndexRef.current = spineIndex;
  }, [spineIndex]);

  useEffect(() => {
    scrollOffsetRef.current = scrollOffset;
  }, [scrollOffset]);

  useEffect(() => {
    onPositionChange?.({
      layoutType: 'reflowable',
      spineIndex,
      scrollOffset,
    });
  }, [onPositionChange, scrollOffset, spineIndex]);

  useEffect(() => {
    let isCancelled = false;
    async function executeLoad(): Promise<void> {
      setLoadState({ status: 'loading' });
      try {
        const epub: ParsedEpubBook = await loadReflowableEpubBook({
          bookId: book.id,
          sessionId: session.id,
          deliveryGrant,
        });
        if (isCancelled) {
          epubRef.current = null;
          return;
        }
        epubRef.current = epub;
        const initialSpine: number = clampSpineIndex(
          coerceNonNegativeInt(session.spineIndex, 0),
          epub.chapters.length,
        );
        setSpineIndex(initialSpine);
        setScrollOffset(coerceNonNegativeInt(session.scrollOffset, 0));
        setLoadState({ status: 'ready', epub });
        activeStartedAtRef.current = Date.now();
      } catch (error: unknown) {
        if (isCancelled) {
          return;
        }
        epubRef.current = null;
        setLoadState({
          status: 'error',
          message: mapLoadError(error),
        });
      }
    }
    void executeLoad();
    return () => {
      isCancelled = true;
      epubRef.current = null;
    };
  }, [book.id, deliveryGrant, reloadToken, session.id, session.scrollOffset, session.spineIndex]);

  useEffect(() => {
    if (loadState.status !== 'ready') {
      return;
    }
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      void reportActivity({
        bookId: book.id,
        sessionId: session.id,
        activeStartedAtRef,
        spineIndexRef,
        scrollOffsetRef,
      });
    }, ACTIVITY_TICK_MS);
    return () => {
      clearInterval(timer);
      void reportActivity({
        bookId: book.id,
        sessionId: session.id,
        activeStartedAtRef,
        spineIndexRef,
        scrollOffsetRef,
      });
    };
  }, [book.id, loadState.status, session.id]);

  if (loadState.status === 'loading') {
    return (
      <View style={styles.centered} testID="reader-reflowable-loading">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.body}>Loading book…</Text>
        <CloseButton onClose={onClose} />
      </View>
    );
  }

  if (loadState.status === 'error') {
    return (
      <View style={styles.centered} testID="reader-reflowable-error">
        <ErrorState
          description={loadState.message}
          retryLabel="Try again"
          onRetry={() => {
            setReloadToken((token) => token + 1);
          }}
          retryTestID="reader-reflowable-retry"
        />
        <CloseButton onClose={onClose} />
      </View>
    );
  }

  const chapter: ParsedEpubChapter | undefined = loadState.epub.chapters[spineIndex];
  if (chapter === undefined) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>That chapter could not be found.</Text>
        <CloseButton onClose={onClose} />
      </View>
    );
  }

  const html: string = buildReflowableChapterHtml({
    title: chapter.title,
    htmlDocument: chapter.htmlDocument,
    fontScalePercent: readerSettings.fontScalePercent,
    lineHeight: readerSettings.lineHeight,
    marginPx: readerSettings.marginPx,
    theme: readerSettings.theme,
  });
  const canGoPrevious: boolean = spineIndex > 0;
  const canGoNext: boolean = spineIndex < loadState.epub.chapters.length - 1;
  const contentProgressPercent: number = resolveReflowableContentProgress({
    spineIndex,
    chapters: loadState.epub.chapters,
  });
  const isDarkChrome: boolean = readerSettings.theme === 'dark';
  const webBackground: string = isDarkChrome ? theme.colors.navBg : theme.colors.canvas;
  const chromeTone: 'light' | 'dark' = isDarkChrome ? 'dark' : 'light';

  return (
    <View style={[styles.container, { backgroundColor: webBackground }]} testID="reader-reflowable-engine">
      <WebView
        style={[styles.webview, { backgroundColor: webBackground }]}
        originWhitelist={['about:blank']}
        source={{ html, baseUrl: 'about:blank' }}
        javaScriptEnabled
        domStorageEnabled={false}
        allowFileAccess={false}
        allowFileAccessFromFileURLs={false}
        allowUniversalAccessFromFileURLs={false}
        setSupportMultipleWindows={false}
        startInLoadingState
        injectedJavaScript={
          scrollOffset > 0 ? `window.scrollTo(0, ${scrollOffset}); true;` : 'true;'
        }
        testID="reader-reflowable-webview"
        onScroll={(event) => {
          const nextOffset: number = Math.max(0, Math.round(event.nativeEvent.contentOffset.y));
          setScrollOffset(nextOffset);
        }}
      />
      {isChromeVisible ? (
        <View
          style={[
            styles.topChrome,
            isDarkChrome ? styles.topChromeDark : styles.topChromeLight,
          ]}
        >
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close reader"
            testID="reader-close-button"
            style={styles.closeHit}
          >
            <Text style={[styles.closeText, isDarkChrome ? styles.closeTextDark : null]}>
              Close
            </Text>
          </Pressable>
          <View style={styles.topTitles} pointerEvents="none">
            <Text
              style={[styles.topTitle, isDarkChrome ? styles.closeTextDark : null]}
              numberOfLines={1}
              accessibilityRole="header"
            >
              {chapter.title}
            </Text>
            <Text
              style={[styles.topSubtitle, isDarkChrome ? styles.progressLabelDark : null]}
              numberOfLines={1}
            >
              {book.title}
            </Text>
          </View>
          <View style={styles.topActions}>
            <ReaderBookmarkToggle
              bookId={book.id}
              layoutType="reflowable"
              tone={chromeTone}
              currentPosition={{
                kind: 'reflowable',
                spineIndex,
                scrollOffset,
              }}
            />
            <ReaderBookmarksPanel
              bookId={book.id}
              layoutType="reflowable"
              tone={chromeTone}
              currentPosition={{
                kind: 'reflowable',
                spineIndex,
                scrollOffset,
              }}
              onJump={(bookmark: ReadingBookmark) => {
                const nextSpine: number = clampSpineIndex(
                  coerceNonNegativeInt(bookmark.spineIndex, 0),
                  loadState.epub.chapters.length,
                );
                setSpineIndex(nextSpine);
                setScrollOffset(coerceNonNegativeInt(bookmark.scrollOffset, 0));
                activeStartedAtRef.current = Date.now();
              }}
            />
            <ReaderChromeButton
              label="Aa"
              accessibilityLabel="Reading settings"
              tone={chromeTone}
              onPress={() => {
                setIsSettingsOpen(true);
              }}
            />
          </View>
        </View>
      ) : (
        <Pressable
          style={styles.revealTop}
          onPress={() => {
            setIsChromeVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Show reader controls"
        />
      )}
      {isChromeVisible ? (
        <View
          style={[
            styles.bottomChrome,
            isDarkChrome ? styles.bottomChromeDark : styles.bottomChromeLight,
          ]}
        >
          <ReaderChromeButton
            label="‹"
            accessibilityLabel="Previous chapter"
            testID="reader-prev-chapter"
            tone={chromeTone}
            isDisabled={!canGoPrevious}
            onPress={() => {
              setSpineIndex((current) => Math.max(0, current - 1));
              setScrollOffset(0);
              activeStartedAtRef.current = Date.now();
            }}
          />
          <Pressable
            style={styles.progressHit}
            onPress={() => {
              setIsChromeVisible(false);
            }}
            accessibilityRole="button"
            accessibilityLabel="Hide reader controls"
          >
            <Text
              style={[styles.progressLabel, isDarkChrome ? styles.progressLabelDark : null]}
              testID="reader-chapter-title"
            >
              {chapter.title}
            </Text>
            <Text
              style={[styles.progressMeta, isDarkChrome ? styles.progressLabelDark : null]}
              testID="reader-spine-index"
            >
              {`Chapter ${spineIndex + 1} of ${loadState.epub.chapters.length} · ${contentProgressPercent}%`}
            </Text>
          </Pressable>
          <ReaderChromeButton
            label="›"
            accessibilityLabel="Next chapter"
            testID="reader-next-chapter"
            tone={chromeTone}
            isDisabled={!canGoNext}
            onPress={() => {
              setSpineIndex((current) => Math.min(loadState.epub.chapters.length - 1, current + 1));
              setScrollOffset(0);
              activeStartedAtRef.current = Date.now();
            }}
          />
        </View>
      ) : (
        <Pressable
          style={styles.revealBottom}
          onPress={() => {
            setIsChromeVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Show reader controls"
        />
      )}
      <BottomSheet
        isVisible={isSettingsOpen}
        onDismiss={() => {
          setIsSettingsOpen(false);
        }}
        accessibilityLabel="Reading Settings"
      >
        <View style={styles.settingsSheet}>
          <Text style={styles.settingsTitle}>Reading Settings</Text>
          <Text style={styles.settingsMeta}>
            {`Font ${readerSettings.fontScalePercent}% · Line ${readerSettings.lineHeight} · Margin ${readerSettings.marginPx}px`}
          </Text>
          <ReflowableReaderSettingsControls
            settings={readerSettings}
            onApplySettings={applyReaderSettings}
            onToggleTheme={() => {
              applyReaderSettings(toggleReaderTheme(readerSettings));
            }}
          />
          <Button
            label="Done"
            onPress={() => {
              setIsSettingsOpen(false);
            }}
            variant="secondary"
          />
        </View>
      </BottomSheet>
    </View>
  );
}

function CloseButton({ onClose }: { readonly onClose: () => void }): JSX.Element {
  return (
    <Button
      label="Close"
      onPress={onClose}
      variant="secondary"
      isFullWidth={false}
      accessibilityLabel="Close reader"
      testID="reader-close-button"
    />
  );
}

async function reportActivity(input: {
  readonly bookId: number;
  readonly sessionId: number;
  readonly activeStartedAtRef: { current: number };
  readonly spineIndexRef: { current: number };
  readonly scrollOffsetRef: { current: number };
}): Promise<void> {
  const now: number = Date.now();
  const activeDurationMs: number = Math.max(0, now - input.activeStartedAtRef.current);
  input.activeStartedAtRef.current = now;
  if (activeDurationMs > 0) {
    try {
      await ingestReadingActivity({
        bookId: input.bookId,
        sessionId: input.sessionId,
        body: {
          activeDurationMs,
          idleDurationMs: 0,
          spineIndex: input.spineIndexRef.current,
          scrollOffset: input.scrollOffsetRef.current,
        },
      });
    } catch {
      // Activity ingest is best-effort; reading continues if it fails.
    }
  }
  await saveReadingProgressBestEffort({
    bookId: input.bookId,
    body: {
      spineIndex: input.spineIndexRef.current,
      scrollOffset: input.scrollOffsetRef.current,
    },
  });
}

function coerceNonNegativeInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return Math.floor(value);
}

function clampSpineIndex(value: number, chapterCount: number): number {
  if (chapterCount <= 0) {
    return 0;
  }
  return Math.min(chapterCount - 1, Math.max(0, value));
}

function mapLoadError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Could not open this book right now.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.canvas,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  topChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  topChromeLight: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  topChromeDark: {
    backgroundColor: theme.colors.navBg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  closeHit: {
    minHeight: theme.controlMinHeight,
    minWidth: theme.controlMinHeight,
    justifyContent: 'center',
    zIndex: 1,
  },
  closeText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  closeTextDark: {
    color: theme.colors.textOnDark,
  },
  topTitles: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  topTitle: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  topSubtitle: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.scale.xs,
    zIndex: 1,
  },
  bottomChrome: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  bottomChromeLight: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  bottomChromeDark: {
    backgroundColor: theme.colors.navBg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  progressHit: {
    flex: 1,
    minHeight: theme.controlMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  progressMeta: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  progressLabelDark: {
    color: theme.colors.textOnDark,
  },
  revealTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: theme.controlMinHeight,
  },
  revealBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: theme.controlMinHeight,
  },
  settingsSheet: {
    gap: theme.spacing.sm,
  },
  settingsTitle: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  settingsMeta: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
});
