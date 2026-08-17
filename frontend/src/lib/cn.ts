import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with Tailwind conflict resolution.
 */
export function cn(...parts: ClassValue[]): string {
  return twMerge(clsx(parts));
}
