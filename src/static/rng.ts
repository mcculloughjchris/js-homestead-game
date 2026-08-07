/**
 * Small RNG abstraction so systems that need randomness (currently just
 * inspections) can be given a seeded, deterministic generator later for
 * save/load consistency (e.g. replaying an inspection's outcome exactly)
 * without touching call sites - they only ever see the RNG interface.
 *
 * The rest of the codebase still uses raw Math.random()/a local
 * randomBetween helper in main.ts for things like door-knock selection and
 * harvest amounts - this isn't a wholesale replacement for those, just the
 * seedable helper requested for the new inspection system.
 */
export interface RNG {
  /** Next float in [0, 1). */
  next(): number
  /** True with the given probability (0-1). */
  chance(probability: number): boolean
  /** A random element from a non-empty array. */
  pick<T>(items: T[]): T
}

// mulberry32 - tiny, fast, decent-quality seeded PRNG
const mulberry32 = (seed: number) => {
  let a = seed

  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Creates an RNG. Pass a numeric seed for reproducible results; omit it to use Math.random(). */
export const createRNG = (seed?: number): RNG => {
  const next = seed !== undefined ? mulberry32(seed) : Math.random

  return {
    next,
    chance: (probability: number) => next() < probability,
    pick: <T>(items: T[]): T => items[Math.floor(next() * items.length)]
  }
}
