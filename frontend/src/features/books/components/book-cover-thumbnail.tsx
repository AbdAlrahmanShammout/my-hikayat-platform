import { BookOpen } from 'lucide-react';
import { useEffect, useState, type JSX } from 'react';

import { resolveBookCoverUrl } from '@/features/books/lib/resolve-book-cover-url';
import { cn } from '@/lib/cn';

type BookCoverThumbnailSize = 'sm' | 'lg';

type BookCoverThumbnailProps = {
  readonly title: string;
  readonly cover?: { url: string } | null;
  readonly size?: BookCoverThumbnailSize;
};

const COVER_FRAME_CLASS: Record<BookCoverThumbnailSize, string> = {
  sm: 'h-14 w-10',
  lg: 'h-36 w-24',
};

const COVER_ICON_SIZE: Record<BookCoverThumbnailSize, number> = {
  sm: 16,
  lg: 28,
};

/**
 * Catalog cover preview. Shows a placeholder when the API has no cover URL.
 */
export function BookCoverThumbnail({
  title,
  cover = null,
  size = 'sm',
}: BookCoverThumbnailProps): JSX.Element {
  const [hasLoadError, setHasLoadError] = useState(false);
  const coverUrl: string | null = resolveBookCoverUrl(cover);
  useEffect(() => {
    setHasLoadError(false);
  }, [coverUrl]);
  const frameClassName: string = cn(
    'flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted',
    COVER_FRAME_CLASS[size],
  );
  if (coverUrl === null || hasLoadError) {
    return <BookCoverPlaceholder title={title} className={frameClassName} size={size} />;
  }
  return (
    <img
      src={coverUrl}
      alt=""
      title={title}
      loading="lazy"
      decoding="async"
      className={cn(frameClassName, 'object-cover')}
      onError={() => {
        setHasLoadError(true);
      }}
    />
  );
}

function BookCoverPlaceholder({
  title,
  className,
  size,
}: {
  readonly title: string;
  readonly className: string;
  readonly size: BookCoverThumbnailSize;
}): JSX.Element {
  return (
    <div className={className} title={title} aria-hidden="true">
      <BookOpen className="text-muted-foreground" size={COVER_ICON_SIZE[size]} />
    </div>
  );
}
