/**
 * Implementare le seguenti funzioni
 */
import { IO } from 'fp-ts/IO'

/**
 * Returns a random number between 0 (inclusive) and 1 (exclusive). This is a direct wrapper around JavaScript's
 * `Math.random()`.
 */
export declare const random: IO<number>

/**
 * Takes a range specified by `low` (the first argument) and `high` (the second), and returns a random integer uniformly
 * distributed in the closed interval `[low, high]`. It is unspecified what happens if `low > high`, or if either of
 * `low` or `high` is not an integer.
 */
export declare const randomInt: (low: number, high: number) => IO<number>

/**
 * Returns a random element in `as`
 */
export declare const randomElem: <A>(as: ReadonlyArray<A>) => IO<A>
