/*

  Questo modulo è diviso in 3 sezioni

  - modello
  - primitive
  - combinatori

*/

//
// modello
//

export interface RetryStatus {
  /** Iteration number, where `0` is the first try */
  iterNumber: number

  /** Latest attempt's delay. Will always be `undefined` on first run. */
  previousDelay: number | undefined
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

//
// primitive
//

/**
 * Constant delay with unlimited retries
 */
export function constantDelay(delay: number): RetryPolicy {
  return () => delay
}

/**
 * Retry immediately, but only up to `i` times.
 */
export function limitRetries(i: number): RetryPolicy {
  return status => (status.iterNumber >= i ? undefined : 0)
}

/**
 * Grow delay exponentially each iteration.
 * Each delay will increase by a factor of two.
 */
export function exponentialBackoff(
  delay: number
): RetryPolicy {
  return status => delay * Math.pow(2, status.iterNumber)
}

//
// combinatori
//

/**
 * Set a time-upperbound for any delays that may be directed by the
 * given policy.
 */
export function capDelay(
  maxDelay: number,
  policy: RetryPolicy
): RetryPolicy {
  return status => {
    const delay = policy(status)
    return delay === undefined
      ? undefined
      : Math.min(maxDelay, delay)
  }
}

/**
 * Merges two policies.
 */
export function concat(
  policy1: RetryPolicy,
  policy2: RetryPolicy
): RetryPolicy {
  return status => {
    const delay1 = policy1(status)
    const delay2 = policy2(status)
    if (delay1 !== undefined && delay2 !== undefined) {
      return Math.max(delay1, delay2)
    }
  }
}

//
// test
//

export const myPolicy = capDelay(
  2000,
  concat(exponentialBackoff(200), limitRetries(5))
)

/**
 * Apply policy on status to see what the decision would be.
 */
export function applyPolicy(
  policy: RetryPolicy,
  status: RetryStatus
): RetryStatus {
  const previousDelay = policy(status)
  return {
    iterNumber: status.iterNumber + 1,
    previousDelay
  }
}

/**
 * Initial, default retry status. Exported mostly to allow user code
 * to test their handlers and retry policies.
 */
export const defaultRetryStatus: RetryStatus = {
  iterNumber: 0,
  previousDelay: 0
}

export function run(policy: RetryPolicy): RetryStatus {
  let status = defaultRetryStatus
  while (status.previousDelay !== undefined) {
    status = applyPolicy(policy, status)
  }
  return status
}

// console.log(run(myPolicy))

export function withLogging(
  policy: RetryPolicy
): RetryPolicy {
  return status => {
    const delay = policy(status)
    console.log(
      delay === undefined
        ? 'Done.'
        : status.iterNumber === 0
        ? 'first attempt...'
        : `retrying in ${delay} milliseconds...`
    )
    return delay
  }
}

// console.log(run(withLogging(myPolicy)))
/*
first attempt...                 <= exponentialBackoff
retrying in 400 milliseconds...  <= exponentialBackoff
retrying in 800 milliseconds...  <= exponentialBackoff
retrying in 1600 milliseconds... <= exponentialBackoff
retrying in 2000 milliseconds... <= exponentialBackoff + capDelay
Done.                            <= limitRetries
{ iterNumber: 6, previousDelay: undefined }
*/
