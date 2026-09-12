import { useState, type JSX } from 'react';

import type { ReaderBookmarkPosition } from '@/features/reader/components/reader-bookmarks-panel';
import { ReaderChromeButton } from '@/features/reader/components/reader-chrome-button';
import { addReaderBookmark } from '@/features/reader/lib/reader-bookmark-actions';

type ReaderBookmarkToggleProps = {
  readonly bookId: number;
  readonly layoutType: 'reflowable' | 'fixed_layout';
  readonly currentPosition: ReaderBookmarkPosition;
  readonly tone?: 'light' | 'dark';
};

/**
 * Adds a bookmark at the current reader position. The bookmarks icon still opens the panel.
 */
export function ReaderBookmarkToggle({
  bookId,
  layoutType,
  currentPosition,
  tone = 'light',
}: ReaderBookmarkToggleProps): JSX.Element {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [didSave, setDidSave] = useState<boolean>(false);
  return (
    <ReaderChromeButton
      label={didSave ? '★' : '☆'}
      accessibilityLabel="Add bookmark at current position"
      tone={tone}
      isDisabled={isSaving}
      testID="reader-bookmark-toggle"
      onPress={() => {
        if (isSaving) {
          return;
        }
        setIsSaving(true);
        void addReaderBookmark({
          bookId,
          layoutType,
          position: currentPosition,
        })
          .then(() => {
            setDidSave(true);
          })
          .finally(() => {
            setIsSaving(false);
          });
      }}
    />
  );
}
