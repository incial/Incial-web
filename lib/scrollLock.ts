/**
 * Global scroll-transition lock.
 *
 * When a card/phase transition is in flight, multiple section scroll-handlers
 * can fire simultaneously because AnimatePresence mode="sync" keeps both the
 * entering and exiting cards mounted at the same time.  A single wheel tick
 * can therefore trigger two sections' handlers and skip the user ahead by two
 * phases.
 *
 * This module provides a lightweight, framework-agnostic lock that every
 * section handler checks before acting.  Acquiring the lock also resets the
 * release timer so rapid successive calls don't release early.
 */

let _locked = false;
let _timer: ReturnType<typeof setTimeout> | null = null;

/**
 * Acquire the global scroll lock for `durationMs` milliseconds.
 * Call this immediately before every phase/section change.
 */
export function lockGlobalScroll(durationMs = 950): void {
  _locked = true;
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(() => {
    _locked = false;
    _timer = null;
  }, durationMs);
}

/**
 * Returns `true` while a card transition is in progress.
 * All section wheel/touch handlers should bail immediately when this is true.
 */
export function isGlobalScrollLocked(): boolean {
  return _locked;
}
