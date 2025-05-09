/**
 * Creates a Promise that resolves after a specified number of milliseconds.
 * Useful for adding delays or creating timed operations in async functions.
 *
 * @param ms - The number of milliseconds to sleep
 * @returns A Promise that resolves after the specified delay
 * @example
 * ```typescript
 * // Wait for 2 seconds
 * await sleep(2000);
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
