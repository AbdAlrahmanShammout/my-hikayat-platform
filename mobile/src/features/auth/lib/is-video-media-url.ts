const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'] as const;

/**
 * True when a public media URL looks like a looping video rather than a GIF/image.
 */
export function isVideoMediaUrl(url: string): boolean {
  try {
    const pathname: string = new URL(url).pathname.toLowerCase();
    return VIDEO_EXTENSIONS.some((extension) => pathname.endsWith(extension));
  } catch {
    return false;
  }
}
