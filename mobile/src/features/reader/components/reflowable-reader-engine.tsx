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
  decreaseFontScale,
  decreaseLineHeight,
  decreaseMargin,
  DEFAULT_REFLOWABLE_READER_SETTINGS,
  increaseFontScale,
  increaseLineHeight,
  increaseMargin,
  toggleReaderTheme,
  type ReflowableReaderSettings,
} from '@/features/reader/lib/reflowable-reader-settings';
import { saveReadingProgressBestEffort } from '@/features/reader/lib/save-reading-progress-best-effort';
import { ReaderBookmarksPanel } from '@/features/reader/components/reader-bookmarks-panel';
import type { ReadingBookmark } from '@/features/reader/api/create-reading-bookmark';
import { theme } from '@/theme/theme';

type ReflowableReaderEngineProps = {
  readonly book: CatalogBook;
  readonly session: ReadingSession;
  readonly deliveryGrant: BookAssetDeliveryGrant | null;
  readonly onClose: () => void;
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
  const epubRef = useRef<ParsedEpubBook | null>(null);
  const spineIndexRef = useRef<number>(spineIndex);
  const scrollOffsetRef = useRef<number>(scrollOffset);
  const activeStartedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    spineIndexRef.current = spineIndex;
  }, [spineIndex]);

  useEffect(() => {
    scrollOffsetRef.current = scrollOffset;
  }, [scrollOffset]);

  useEffect(() => {
    let isCancelled = false;
    async function executeLoad(): Promise<void> {
      if (deliveryGrant === null) {
        setLoadState({
          status: 'error',
          message: 'This book file is not ready to open yet.',
        });
        return;
      }
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
        <Text style={styles.error}>{loadState.message}</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            setReloadToken((token) => token + 1);
          }}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          testID="reader-reflowable-retry"
        >
          <Text style={styles.primaryLabel}>Try again</Text>
        </Pressable>
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
  const webBackground: string = readerSettings.theme === 'dark' ? '#1a1714' : '#f7f3ea';

  return (
    <View style={styles.container} testID="reader-reflowable-engine">
      <View style={styles.header}>
        <Text style={styles.engineLabel}>Reflowable reader</Text>
        <Text style={styles.title} accessibilityRole="header" numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.meta} testID="reader-chapter-title">
          {chapter.title}
        </Text>
        <Text style={styles.meta} testID="reader-spine-index">
          {`Chapter ${spineIndex + 1} of ${loadState.epub.chapters.length}`}
        </Text>
      </View>
      <View style={styles.settingsRow} testID="reader-reflowable-settings">
        <SettingsButton
          label="A−"
          accessibilityLabel="Decrease font size"
          testID="reader-font-decrease"
          onPress={() => {
            setReaderSettings((current) => decreaseFontScale(current));
          }}
        />
        <SettingsButton
          label="A+"
          accessibilityLabel="Increase font size"
          testID="reader-font-increase"
          onPress={() => {
            setReaderSettings((current) => increaseFontScale(current));
          }}
        />
        <SettingsButton
          label="Line −"
          accessibilityLabel="Decrease line spacing"
          testID="reader-line-decrease"
          onPress={() => {
            setReaderSettings((current) => decreaseLineHeight(current));
          }}
        />
        <SettingsButton
          label="Line +"
          accessibilityLabel="Increase line spacing"
          testID="reader-line-increase"
          onPress={() => {
            setReaderSettings((current) => increaseLineHeight(current));
          }}
        />
        <SettingsButton
          label="Margin −"
          accessibilityLabel="Decrease margin"
          testID="reader-margin-decrease"
          onPress={() => {
            setReaderSettings((current) => decreaseMargin(current));
          }}
        />
        <SettingsButton
          label="Margin +"
          accessibilityLabel="Increase margin"
          testID="reader-margin-increase"
          onPress={() => {
            setReaderSettings((current) => increaseMargin(current));
          }}
        />
        <SettingsButton
          label={readerSettings.theme === 'light' ? 'Dark' : 'Light'}
          accessibilityLabel="Toggle reading theme"
          testID="reader-theme-toggle"
          onPress={() => {
            setReaderSettings((current) => toggleReaderTheme(current));
          }}
        />
      </View>
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
      <View style={styles.footer}>
        <Pressable
          style={[styles.navButton, !canGoPrevious ? styles.navButtonDisabled : null]}
          disabled={!canGoPrevious}
          onPress={() => {
            setSpineIndex((current) => Math.max(0, current - 1));
            setScrollOffset(0);
            activeStartedAtRef.current = Date.now();
          }}
          accessibilityRole="button"
          accessibilityLabel="Previous chapter"
          testID="reader-prev-chapter"
        >
          <Text style={styles.navLabel}>Previous</Text>
        </Pressable>
        <Pressable
          style={[styles.navButton, !canGoNext ? styles.navButtonDisabled : null]}
          disabled={!canGoNext}
          onPress={() => {
            setSpineIndex((current) => Math.min(loadState.epub.chapters.length - 1, current + 1));
            setScrollOffset(0);
            activeStartedAtRef.current = Date.now();
          }}
          accessibilityRole="button"
          accessibilityLabel="Next chapter"
          testID="reader-next-chapter"
        >
          <Text style={styles.navLabel}>Next</Text>
        </Pressable>
        <ReaderBookmarksPanel
          bookId={book.id}
          layoutType="reflowable"
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
        <CloseButton onClose={onClose} />
      </View>
    </View>
  );
}

function SettingsButton(input: {
  readonly label: string;
  readonly accessibilityLabel: string;
  readonly testID: string;
  readonly onPress: () => void;
}): JSX.Element {
  return (
    <Pressable
      style={styles.settingsButton}
      onPress={input.onPress}
      accessibilityRole="button"
      accessibilityLabel={input.accessibilityLabel}
      testID={input.testID}
    >
      <Text style={styles.settingsLabel}>{input.label}</Text>
    </Pressable>
  );
}

function CloseButton({ onClose }: { readonly onClose: () => void }): JSX.Element {
  return (
    <Pressable
      style={styles.closeButton}
      onPress={onClose}
      accessibilityRole="button"
      accessibilityLabel="Close reader"
      testID="reader-close-button"
    >
      <Text style={styles.closeLabel}>Close</Text>
    </Pressable>
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
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: 4,
  },
  engineLabel: {
    ...theme.typography.label,
    color: theme.colors.primaryMuted,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  meta: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  settingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  settingsButton: {
    minHeight: 40,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  webview: {
    flex: 1,
    backgroundColor: '#f7f3ea',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.45,
  },
  navLabel: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  primaryButton: {
    minHeight: theme.controlMinHeight,
    minWidth: 160,
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
  closeButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginLeft: 'auto',
  },
  closeLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
});
