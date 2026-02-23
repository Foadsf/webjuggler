/**
 * Safely access array length, returning 0 for null/undefined
 */
export function safeLength<T>(arr: T[] | null | undefined): number {
  return arr?.length ?? 0;
}

/**
 * Safely map over array, returning empty array for null/undefined
 */
export function safeMap<T, R>(
  arr: T[] | null | undefined, 
  fn: (item: T, index: number) => R
): R[] {
  return (arr ?? []).map(fn);
}

/**
 * Safely filter array, returning empty array for null/undefined
 */
export function safeFilter<T>(
  arr: T[] | null | undefined,
  predicate: (item: T) => boolean
): T[] {
  return (arr ?? []).filter(predicate);
}

/**
 * Safely access nested property with optional chaining
 */
export function get<T>(obj: T | null | undefined, path: string): any {
  return path.split('.').reduce((acc, part) => (acc as any)?.[part], obj);
}
