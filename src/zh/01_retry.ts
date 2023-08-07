/*

  不断重复执行操作直到成功的机制的抽象。

  模块分为3部分：

  - 模型
  - 原语
  - combinators

*/

// -------------------------------------------------------------------------------------
// 模型
// -------------------------------------------------------------------------------------

export interface RetryStatus {
  /** 迭代次数。 `0`代表第一次尝试 */
  readonly iterNumber: number

  /** 最近一次尝试的延迟。第一次尝试时总是`undefined`。 */
  readonly previousDelay: number | undefined
}

export const startStatus: RetryStatus = {
  iterNumber: 0,
  previousDelay: undefined
}

/**
 * `RetryPolicy`是一个函数。它接受一个`RetryStatus`并可能返回一个毫秒级的延迟。
 * 
 * 迭代次数从0开始，每次尝试都加1。
 * 
 * 返回*undefined*意味着我们到达了重试次数的上限。
 */
export interface RetryPolicy {
  (status: RetryStatus): number | undefined
}

// -------------------------------------------------------------------------------------
// 原语
// -------------------------------------------------------------------------------------

/**
 * 固定延迟且无限重试。
 */
export const constantDelay = (delay: number): RetryPolicy => () => delay

/**
 * 立即重试，但是上限重试上限为`i`.
 */
export const limitRetries = (i: number): RetryPolicy => (status) =>
  status.iterNumber >= i ? undefined : 0

/**
 * 每次迭代延迟呈指数增长
 * 每次延迟都会成为2倍。
 */
export const exponentialBackoff = (delay: number): RetryPolicy => (status) =>
  delay * Math.pow(2, status.iterNumber)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * 为给定的策略所指示的任何延迟设置时间上限。
 */
export const capDelay = (maxDelay: number) => (
  policy: RetryPolicy
): RetryPolicy => (status) => {
  const delay = policy(status)
  return delay === undefined ? undefined : Math.min(maxDelay, delay)
}

/**
 * 合并两个策略. **提问**: 什么叫合并两个策略？
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
 * 对给定的status应用策略，来查看结果。
 */
export const applyPolicy = (policy: RetryPolicy) => (
  status: RetryStatus
): RetryStatus => ({
  iterNumber: status.iterNumber + 1,
  previousDelay: policy(status)
})

/**
 * 应用策略并保存所有的中间结果。
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

import { function as F } from 'fp-ts'

/*
  constantDelay(300)
    |> concat(exponentialBackoff(200))
    |> concat(limitRetries(5))
    |> capDelay(2000)
*/
const myPolicy = F.pipe(
  constantDelay(300),
  concat(exponentialBackoff(200)),
  concat(limitRetries(5)),
  capDelay(2000)
)

console.log(dryRun(myPolicy))
/*
[
  { iterNumber: 1, previousDelay: 300 },      <= constantDelay
  { iterNumber: 2, previousDelay: 400 },      <= exponentialBackoff
  { iterNumber: 3, previousDelay: 800 },      <= exponentialBackoff
  { iterNumber: 4, previousDelay: 1600 },     <= exponentialBackoff
  { iterNumber: 5, previousDelay: 2000 },     <= capDelay
  { iterNumber: 6, previousDelay: undefined } <= limitRetries
]
*/
