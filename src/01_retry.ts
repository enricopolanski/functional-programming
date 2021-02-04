/*

  Abstraction for a mechanism to perform actions repetitively until successful.

  Questo modulo è diviso in 3 sezioni

  - modello
  - primitive
  - combinatori

*/

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface RetryStatus {
  /** Iteration number, where `0` is the first try */
  readonly iterNumber: number

  /** Latest attempt's delay. Will always be `undefined` on first run. */
  readonly previousDelay: number | undefined
}

export const startStatus: RetryStatus = {
  iterNumber: 0,
  previousDelay: undefined
}

/**
 * A `RetryPolicy` is a function that takes an `RetryStatus` and
 * possibly returns a delay in milliseconds. Iteration numbers start
 * at zero and increase by one on each retry. A *undefined* return value from
 * the function implies we have reached the retry limit.
 */
export interface RetryPolicy {
  (status: RetryStatus): number | undefined
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * Constant delay with unlimited retries.
 */
export const constantDelay = (delay: number): RetryPolicy => () => delay

/**
 * Retry immediately, but only up to `i` times.
 */
export const limitRetries = (i: number): RetryPolicy => (status) =>
  status.iterNumber >= i ? undefined : 0

/**
 * Grow delay exponentially each iteration.
 * Each delay will increase by a factor of two.
 */
export const exponentialBackoff = (delay: number): RetryPolicy => (status) =>
  delay * Math.pow(2, status.iterNumber)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * Set a time-upperbound for any delays that may be directed by the
 * given policy.
 */
export const capDelay = (maxDelay: number) => (
  policy: RetryPolicy
): RetryPolicy => (status) => {
  const delay = policy(status)
  return delay === undefined ? undefined : Math.min(maxDelay, delay)
}

/**
 * Merges two policies. **Quiz**: cosa vuol dire fare merge di due policy?
 */
export const concat = (second: RetryPolicy) => (
  first: RetryPolicy
): RetryPolicy => (status) => {
  const delay1 = first(status)
  const delay2 = second(status)
  if (delay1 !== undefined && delay2 !== undefined) {
    return Math.max(delay1, delay2)
  }
  return undefined
}

// -------------------------------------------------------------------------------------
// tests
// -------------------------------------------------------------------------------------

/**
 * Apply policy on status to see what the decision would be.
 */
export const applyPolicy = (policy: RetryPolicy) => (
  status: RetryStatus
): RetryStatus => ({
  iterNumber: status.iterNumber + 1,
  previousDelay: policy(status)
})

/**
 * Apply a policy keeping all intermediate results.
 */
export const dryRun = (policy: RetryPolicy): ReadonlyArray<RetryStatus> => {
  const apply = applyPolicy(policy)
  let status: RetryStatus = apply(startStatus)
  const out: Array<RetryStatus> = [status]
  while (status.previousDelay !== undefined) {
    out.push((status = apply(out[out.length - 1])))
  }
  return out
}

import { pipe } from 'fp-ts/function'

// exponentialBackoff(200) |> concat(limitRetries(5)) |> capDelay(2000)
const myPolicy = pipe(
  exponentialBackoff(200),
  concat(limitRetries(5)),
  capDelay(2000)
)

console.log(dryRun(myPolicy))
/*
[
  { iterNumber: 1, previousDelay: 200 },      <= exponentialBackoff
  { iterNumber: 2, previousDelay: 400 },      <= exponentialBackoff
  { iterNumber: 3, previousDelay: 800 },      <= exponentialBackoff
  { iterNumber: 4, previousDelay: 1600 },     <= exponentialBackoff
  { iterNumber: 5, previousDelay: 2000 },     <= exponentialBackoff + capDelay
  { iterNumber: 6, previousDelay: undefined } <= limitRetries
]
*/
