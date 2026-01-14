/**
 * TimerBag manages multiple timers by key.
 * Provides centralized cleanup for all timeouts.
 */
export class TimerBag {
  private timers: Map<string, number> = new Map();

  /**
   * Set a timer for a given key.
   * If a timer already exists for this key, it will be cleared first.
   *
   * @param key - Unique identifier for the timer
   * @param fn - Function to execute after delay
   * @param ms - Delay in milliseconds
   */
  set(key: string, fn: () => void, ms: number): void {
    this.clear(key);
    const id = window.setTimeout(() => {
      this.timers.delete(key);
      fn();
    }, ms);
    this.timers.set(key, id);
  }

  /**
   * Clear a specific timer by key.
   *
   * @param key - Timer key to clear
   */
  clear(key: string): void {
    const id = this.timers.get(key);
    if (id !== undefined) {
      clearTimeout(id);
      this.timers.delete(key);
    }
  }

  /**
   * Clear all active timers.
   */
  clearAll(): void {
    this.timers.forEach((id) => {
      clearTimeout(id);
    });
    this.timers.clear();
  }

  /**
   * Check if a timer exists for the given key.
   *
   * @param key - Timer key to check
   * @returns True if timer exists
   */
  has(key: string): boolean {
    return this.timers.has(key);
  }
}

