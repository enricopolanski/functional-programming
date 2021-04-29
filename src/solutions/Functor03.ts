/**
 * Implementare le seguenti funzioni
 */
import { pipe } from 'fp-ts/function'
import { IO, map } from 'fp-ts/IO'

/**
 * Returns a random number between 0 (inclusive) and 1 (exclusive). This is a direct wrapper around JavaScript's
 * `Math.random()`.
 */
export const random: IO<number> = () => Math.random()

/**
 * Takes a range specified by `low` (the first argument) and `high` (the second), and returns a random integer uniformly
 * distributed in the closed interval `[low, high]`. It is unspecified what happens if `low > high`, or if either of
 * `low` or `high` is not an integer.
 */
export const randomInt = (low: number, high: number): IO<number> =>
  pipe(
    random,
    map((n) => Math.floor((high - low + 1) * n + low))
  )

/**
 * Returns a random element in `as`
 */
export const randomElem = <A>(as: ReadonlyArray<A>): IO<A> =>
  pipe(
    randomInt(0, as.length - 1),
    map((i) => as[i])
  )
