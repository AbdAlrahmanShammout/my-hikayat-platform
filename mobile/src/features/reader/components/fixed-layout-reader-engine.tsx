import { useEffect, useRef, useState, type JSX } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import type { BookAssetDeliveryGrant } from '@/features/reader/api/create-delivery-grant';
import { ingestReadingActivity } from '@/features/reader/api/ingest-reading-activity';
import { ingestReadingVisualEngagement } from '@/features/reader/api/ingest-reading-visual-engagement';
import type { ReadingSession } from '@/features/reader/api/start-reading-session';
import { buildFixedLayoutPageHtml } from '@/features/reader/lib/build-fixed-layout-page-html';
import {
  computeAspectFitSize,
  resolveSpreadContentSize,
} from '@/features/reader/lib/compute-aspect-fit-size';
import { loadFixedLayoutEpubBook } from '@/features/reader/lib/load-fixed-layout-epub-book';
import type {
  ParsedFixedLayoutEpub,
  ParsedFixedLayoutPage,
  ParsedFixedLayoutSpread,
} from '@/features/reader/lib/parse-fixed-layout-epub';
import { saveReadingProgressBestEffort } from '@/features/reader/lib/save-reading-progress-best-effort';
import type { ReadingPositionSnapshot } from '@/features/reader/lib/reading-position';
import { ReaderBookmarkToggle } from '@/features/reader/components/reader-bookmark-toggle';
import { ReaderBookmarksPanel } from '@/features/reader/components/reader-bookmarks-panel';
import { ReaderChromeButton } from '@/features/reader/components/reader-chrome-button';
import type { ReadingBookmark } from '@/features/reader/api/create-reading-bookmark';
import { theme } from '@/theme/theme';
import { Button } from '@/ui/primitives/button';
import { ErrorState } from '@/ui/feedback/error-state';

type FixedLayoutReaderEngineProps = {
  readonly book: CatalogBook;
  readonly session: ReadingSession;
  readonly deliveryGrant: BookAssetDeliveryGrant | null;
  readonly onClose: () => void;
  readonly onPositionChange?: (position: ReadingPositionSnapshot) => void;
};

type LoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'ready'; readonly epub: ParsedFixedLayoutEpub };

const ACTIVITY_TICK_MS = 15_000;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const SPREAD_DOT_LIMIT = 12;

/**
 * Fixed-layout EPUB canvas engine: decrypt in memory, parse spreads, aspect-fit render with zoom.
 *
 * WebView rationale: fixed-layout EPUB pages are XHTML with locked composition. A sandboxed WebView
 * is the Expo viewport for that markup. It receives no native bridge methods and only loads
 * injected HTML (`originWhitelist` limited to about:blank).
 */
export function FixedLayoutReaderEngine({
  book,
  session,
  deliveryGrant,
  onClose,
  onPositionChange,
}: FixedLayoutReaderEngineProps): JSX.Element {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [spreadIndex, setSpreadIndex] = useState<number>(
    coerceNonNegativeInt(session.spreadIndex, 0),
  );
  const [pageNumber, setPageNumber] = useState<number>(
    coercePositiveInt(session.pageNumber, 1),
  );
  const [zoom, setZoom] = useState<number>(MIN_ZOOM);
  const [viewport, setViewport] = useState<{ width: number; height: number }>({
    width: 1,
    height: 1,
  });
  const [reloadToken, setReloadToken] = useState<number>(0);
  const [isChromeVisible, setIsChromeVisible] = useState<boolean>(true);
  const epubRef = useRef<ParsedFixedLayoutEpub | null>(null);
  const spreadIndexRef = useRef<number>(spreadIndex);
  const pageNumberRef = useRef<number>(pageNumber);
  const activeStartedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    spreadIndexRef.current = spreadIndex;
  }, [spreadIndex]);

  useEffect(() => {
    pageNumberRef.current = pageNumber;
  }, [pageNumber]);

  useEffect(() => {
    onPositionChange?.({
      layoutType: 'fixed_layout',
      spreadIndex,
      pageNumber,
    });
  }, [onPositionChange, pageNumber, spreadIndex]);

  useEffect(() => {
    let isCancelled = false;
    async function executeLoad(): Promise<void> {
      setLoadState({ status: 'loading' });
      try {
        const epub: ParsedFixedLayoutEpub = await loadFixedLayoutEpubBook({
          bookId: book.id,
          sessionId: session.id,
          deliveryGrant,
        });
        if (isCancelled) {
          epubRef.current = null;
          return;
        }
        epubRef.current = epub;
        const initialSpread: number = clampIndex(
          coerceNonNegativeInt(session.spreadIndex, 0),
          epub.spreads.length,
        );
        const initialPageNumber: number = resolvePageNumberForSpread(
          epub,
          initialSpread,
          coercePositiveInt(session.pageNumber, 1),
        );
        setSpreadIndex(initialSpread);
        setPageNumber(initialPageNumber);
        setZoom(MIN_ZOOM);
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
  }, [book.id, deliveryGrant, reloadToken, session.id, session.pageNumber, session.spreadIndex]);

  useEffect(() => {
    if (loadState.status !== 'ready') {
      return;
    }
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      void reportFixedLayoutActivity({
        bookId: book.id,
        sessionId: session.id,
        activeStartedAtRef,
        spreadIndexRef,
        pageNumberRef,
      });
    }, ACTIVITY_TICK_MS);
    return () => {
      clearInterval(timer);
      void reportFixedLayoutActivity({
        bookId: book.id,
        sessionId: session.id,
        activeStartedAtRef,
        spreadIndexRef,
        pageNumberRef,
      });
    };
  }, [book.id, loadState.status, session.id]);

  if (loadState.status === 'loading') {
    return (
      <View style={styles.centered} testID="reader-fixed-layout-loading">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.body}>Loading book…</Text>
        <CloseButton onClose={onClose} />
      </View>
    );
  }

  if (loadState.status === 'error') {
    return (
      <View style={styles.centered} testID="reader-fixed-layout-error">
        <ErrorState
          description={loadState.message}
          retryLabel="Try again"
          onRetry={() => {
            setReloadToken((token) => token + 1);
          }}
          retryTestID="reader-fixed-layout-retry"
        />
        <CloseButton onClose={onClose} />
      </View>
    );
  }

  const spread: ParsedFixedLayoutSpread | undefined = loadState.epub.spreads[spreadIndex];
  if (spread === undefined) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>That spread could not be found.</Text>
        <CloseButton onClose={onClose} />
      </View>
    );
  }

  const pagesBySpine = new Map<number, ParsedFixedLayoutPage>(
    loadState.epub.pages.map((page) => [page.spineIndex, page]),
  );
  const leftPage: ParsedFixedLayoutPage | null =
    spread.leftSpineIndex === null ? null : (pagesBySpine.get(spread.leftSpineIndex) ?? null);
  const rightPage: ParsedFixedLayoutPage | null =
    spread.rightSpineIndex === null ? null : (pagesBySpine.get(spread.rightSpineIndex) ?? null);
  const centerPage: ParsedFixedLayoutPage | null =
    spread.centerSpineIndex === null
      ? null
      : (pagesBySpine.get(spread.centerSpineIndex) ?? null);
  const contentSize = resolveSpreadContentSize({
    leftWidth: leftPage?.width ?? null,
    leftHeight: leftPage?.height ?? null,
    rightWidth: rightPage?.width ?? null,
    rightHeight: rightPage?.height ?? null,
    centerWidth: centerPage?.width ?? null,
    centerHeight: centerPage?.height ?? null,
  });
  const fitted = computeAspectFitSize({
    contentWidth: contentSize.width,
    contentHeight: contentSize.height,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    zoom,
  });
  const canGoPrevious: boolean = spreadIndex > 0;
  const canGoNext: boolean = spreadIndex < loadState.epub.spreads.length - 1;
  const canZoomOut: boolean = zoom > MIN_ZOOM + 0.001;
  const canZoomIn: boolean = zoom < MAX_ZOOM - 0.001;
  const spreadTitle: string =
    centerPage?.title ?? leftPage?.title ?? rightPage?.title ?? `Spread ${spreadIndex + 1}`;

  return (
    <View style={styles.container} testID="reader-fixed-layout-engine">
      <View
        style={styles.canvasHost}
        testID="reader-fixed-layout-canvas"
        onLayout={(event: LayoutChangeEvent) => {
          const { width, height } = event.nativeEvent.layout;
          setViewport({
            width: Math.max(1, Math.floor(width)),
            height: Math.max(1, Math.floor(height)),
          });
        }}
      >
        <ScrollView
          style={styles.canvasScroll}
          contentContainerStyle={styles.canvasContent}
          maximumZoomScale={1}
          minimumZoomScale={1}
          centerContent
        >
          <View
            style={[
              styles.spreadFrame,
              {
                width: fitted.width,
                height: fitted.height,
              },
            ]}
            testID="reader-fixed-layout-spread-frame"
          >
            {centerPage !== null ? (
              <PageWebView page={centerPage} flex={1} />
            ) : (
              <>
                {leftPage !== null ? <PageWebView page={leftPage} flex={1} /> : null}
                {rightPage !== null ? <PageWebView page={rightPage} flex={1} /> : null}
              </>
            )}
          </View>
        </ScrollView>
      </View>
      {loadState.epub.spreads.length <= SPREAD_DOT_LIMIT ? (
        <Pressable
          style={styles.dots}
          onPress={() => {
            setIsChromeVisible((current) => !current);
          }}
          accessibilityRole="button"
          accessibilityLabel={isChromeVisible ? 'Hide reader controls' : 'Show reader controls'}
        >
          {loadState.epub.spreads.map((entry, index) => (
            <View
              key={`${entry.leftSpineIndex ?? 'l'}-${entry.rightSpineIndex ?? 'r'}-${entry.centerSpineIndex ?? 'c'}-${index}`}
              style={[styles.dot, index === spreadIndex ? styles.dotActive : null]}
            />
          ))}
        </Pressable>
      ) : null}
      {isChromeVisible ? (
        <View style={styles.topChrome}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close reader"
            testID="reader-close-button"
            style={styles.closeHit}
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          <View style={styles.topTitles} pointerEvents="none">
            <Text style={styles.topTitle} numberOfLines={1} accessibilityRole="header">
              {book.title}
            </Text>
            <Text style={styles.topSubtitle} numberOfLines={1} testID="reader-spread-title">
              {spreadTitle}
            </Text>
          </View>
          <View style={styles.topActions}>
            <ReaderBookmarkToggle
              bookId={book.id}
              layoutType="fixed_layout"
              tone="dark"
              currentPosition={{
                kind: 'fixed_layout',
                spreadIndex,
                pageNumber,
              }}
            />
            <ReaderBookmarksPanel
            bookId={book.id}
            layoutType="fixed_layout"
            tone="dark"
            currentPosition={{
              kind: 'fixed_layout',
              spreadIndex,
              pageNumber,
            }}
            onJump={(bookmark: ReadingBookmark) => {
              const nextSpread: number = clampIndex(
                coerceNonNegativeInt(bookmark.spreadIndex, 0),
                loadState.epub.spreads.length,
              );
              setSpreadIndex(nextSpread);
              setPageNumber(
                resolvePageNumberForSpread(
                  loadState.epub,
                  nextSpread,
                  coercePositiveInt(bookmark.pageNumber, 1),
                ),
              );
              setZoom(MIN_ZOOM);
              activeStartedAtRef.current = Date.now();
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
        <>
          <View style={styles.sideNavLeft} pointerEvents="box-none">
            <ReaderChromeButton
              label="‹"
              accessibilityLabel="Previous spread"
              testID="reader-prev-spread"
              tone="dark"
              isDisabled={!canGoPrevious}
              onPress={() => {
                const nextSpread: number = Math.max(0, spreadIndex - 1);
                setSpreadIndex(nextSpread);
                setPageNumber(resolvePageNumberForSpread(loadState.epub, nextSpread, 1));
                setZoom(MIN_ZOOM);
                activeStartedAtRef.current = Date.now();
              }}
            />
          </View>
          <View style={styles.sideNavRight} pointerEvents="box-none">
            <ReaderChromeButton
              label="›"
              accessibilityLabel="Next spread"
              testID="reader-next-spread"
              tone="dark"
              isDisabled={!canGoNext}
              onPress={() => {
                const nextSpread: number = Math.min(
                  loadState.epub.spreads.length - 1,
                  spreadIndex + 1,
                );
                setSpreadIndex(nextSpread);
                setPageNumber(resolvePageNumberForSpread(loadState.epub, nextSpread, 1));
                setZoom(MIN_ZOOM);
                activeStartedAtRef.current = Date.now();
              }}
            />
          </View>
          <View style={styles.bottomChrome}>
            <Text style={styles.spreadIndex} testID="reader-spread-index">
              {`Spread ${spreadIndex + 1} of ${loadState.epub.spreads.length} · Page ${pageNumber}`}
            </Text>
            <View style={styles.zoomRow}>
              <ReaderChromeButton
                label="−"
                accessibilityLabel="Zoom out"
                testID="reader-zoom-out"
                tone="dark"
                isDisabled={!canZoomOut}
                onPress={() => {
                  setZoom((current) => clampZoom(current - ZOOM_STEP));
                }}
              />
              <Text style={styles.zoomLabel}>{`${zoom}×`}</Text>
              <ReaderChromeButton
                label="+"
                accessibilityLabel="Zoom in"
                testID="reader-zoom-in"
                tone="dark"
                isDisabled={!canZoomIn}
                onPress={() => {
                  setZoom((current) => clampZoom(current + ZOOM_STEP));
                }}
              />
            </View>
          </View>
        </>
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
    </View>
  );
}

function PageWebView(input: {
  readonly page: ParsedFixedLayoutPage;
  readonly flex: number;
}): JSX.Element {
  const html: string = buildFixedLayoutPageHtml({
    title: input.page.title,
    htmlDocument: input.page.htmlDocument,
    width: input.page.width,
    height: input.page.height,
  });
  return (
    <WebView
      style={{ flex: input.flex, backgroundColor: '#ffffff' }}
      originWhitelist={['about:blank']}
      source={{ html, baseUrl: 'about:blank' }}
      javaScriptEnabled={false}
      domStorageEnabled={false}
      allowFileAccess={false}
      allowFileAccessFromFileURLs={false}
      allowUniversalAccessFromFileURLs={false}
      setSupportMultipleWindows={false}
      scrollEnabled={false}
      scalesPageToFit
      startInLoadingState
      testID={`reader-fixed-layout-page-${input.page.spineIndex}`}
    />
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

async function reportFixedLayoutActivity(input: {
  readonly bookId: number;
  readonly sessionId: number;
  readonly activeStartedAtRef: { current: number };
  readonly spreadIndexRef: { current: number };
  readonly pageNumberRef: { current: number };
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
          spreadIndex: input.spreadIndexRef.current,
          pageNumber: input.pageNumberRef.current,
        },
      });
    } catch {
      // Activity ingest is best-effort; reading continues if it fails.
    }
    try {
      await ingestReadingVisualEngagement({
        bookId: input.bookId,
        sessionId: input.sessionId,
        body: {
          spreadIndex: input.spreadIndexRef.current,
          pageNumber: input.pageNumberRef.current,
          activeDurationMs,
          visualSceneTimeMs: activeDurationMs,
        },
      });
    } catch {
      // Visual engagement ingest is best-effort; reading continues if it fails.
    }
  }
  await saveReadingProgressBestEffort({
    bookId: input.bookId,
    body: {
      spreadIndex: input.spreadIndexRef.current,
      pageNumber: input.pageNumberRef.current,
    },
  });
}

function resolvePageNumberForSpread(
  epub: ParsedFixedLayoutEpub,
  spreadIndex: number,
  preferredPageNumber: number,
): number {
  const spread: ParsedFixedLayoutSpread | undefined = epub.spreads[spreadIndex];
  if (spread === undefined) {
    return 1;
  }
  const candidates: number[] = [];
  if (spread.centerSpineIndex !== null) {
    candidates.push(spread.centerSpineIndex + 1);
  }
  if (spread.leftSpineIndex !== null) {
    candidates.push(spread.leftSpineIndex + 1);
  }
  if (spread.rightSpineIndex !== null) {
    candidates.push(spread.rightSpineIndex + 1);
  }
  if (candidates.includes(preferredPageNumber)) {
    return preferredPageNumber;
  }
  return candidates[0] ?? 1;
}

function coerceNonNegativeInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return Math.floor(value);
}

function coercePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
    return fallback;
  }
  return Math.floor(value);
}

function clampIndex(value: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  return Math.min(count - 1, Math.max(0, value));
}

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
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
    backgroundColor: theme.colors.navBg,
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
  canvasHost: {
    flex: 1,
    backgroundColor: theme.colors.navBg,
  },
  canvasScroll: {
    flex: 1,
  },
  canvasContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
  spreadFrame: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  dots: {
    minHeight: theme.controlMinHeight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.scale.xs,
    paddingVertical: theme.spacing.sm,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: theme.radii.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 16,
    backgroundColor: theme.colors.primary,
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
    backgroundColor: 'rgba(14,10,8,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: theme.spacing.xs,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.scale.xs,
    zIndex: 1,
  },
  closeHit: {
    minHeight: theme.controlMinHeight,
    minWidth: theme.controlMinHeight,
    justifyContent: 'center',
    zIndex: 1,
  },
  closeText: {
    ...theme.typography.body,
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
    color: theme.colors.textOnDark,
    textAlign: 'center',
  },
  topSubtitle: {
    ...theme.typography.label,
    color: theme.colors.navMuted,
    textAlign: 'center',
  },
  sideNavLeft: {
    position: 'absolute',
    left: theme.spacing.sm,
    top: '50%',
    marginTop: -28,
  },
  sideNavRight: {
    position: 'absolute',
    right: theme.spacing.sm,
    top: '50%',
    marginTop: -28,
  },
  bottomChrome: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'rgba(14,10,8,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: theme.spacing.sm,
  },
  spreadIndex: {
    ...theme.typography.label,
    color: theme.colors.navMuted,
    flex: 1,
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.scale.xs,
  },
  zoomLabel: {
    ...theme.typography.label,
    color: theme.colors.textOnDark,
    minWidth: 40,
    textAlign: 'center',
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
});
