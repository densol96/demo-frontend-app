import { computed, Signal } from '@angular/core';

/**
 * Creates a **deep readonly** (immutable) projection of a given signal.
 *
 * This utility ensures that any value returned from the signal cannot be
 * mutated outside its source. Internally it uses `structuredClone()` to
 * perform a full deep copy of the signal's current value.
 */
export function readonlySignal<T>(source: Signal<T>): Signal<T> {
  return computed(() => {
    const value = source();
    if (value === null || value === undefined) return value;
    return structuredClone(value);
  });
}
