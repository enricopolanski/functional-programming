/*

  成功するまでアクションを繰り返し実行するメカニズムの抽象

  このモジュールは3つの部分に分かれています：

  - モデル
  - プリミティブ値
  - コンビネータ

*/

// -------------------------------------------------------------------------------------
// モデル
// -------------------------------------------------------------------------------------

export interface RetryStatus {
  /** イテレーション回数。 `0`は初回の実行 */
  readonly iterNumber: number

  /** 最新の実行の遅延。初回の実行は常に`undefined`。*/
  readonly previousDelay: number | undefined
}

export const startStatus: RetryStatus = {
  iterNumber: 0,
  previousDelay: undefined
}

/**
 * `RetryPolicy`は`RetryStatus`を受け取る関数で、遅延をミリ秒単位で返す可能性があります。
 * 
 * イテレーション回数は0から始まり、実行するたびに1を増やします。
 * 
 * *undefined*を返すことは、再試行回数の制限に達したことを意味します。
 */
export interface RetryPolicy {
  (status: RetryStatus): number | undefined
}

// -------------------------------------------------------------------------------------
// プリミティブ値
// -------------------------------------------------------------------------------------

/**
 * 一定の遅延と無制限の再試行。
 */
export const constantDelay = (delay: number): RetryPolicy => () => delay

/**
 * すぐに再試行するが、最大'i'回までです。
 */
export const limitRetries = (i: number): RetryPolicy => (status) =>
  status.iterNumber >= i ? undefined : 0

/**
 * イテレーションごとに遅延が指数関数的に増加します。
 * 
 * 各遅延が倍になります。
 */
export const exponentialBackoff = (delay: number): RetryPolicy => (status) =>
  delay * Math.pow(2, status.iterNumber)

// -------------------------------------------------------------------------------------
// コンビネータ
// -------------------------------------------------------------------------------------

/**
 * 指定されたポリシーが指定した遅延に時間上限を設定します。
 */
export const capDelay = (maxDelay: number) => (
  policy: RetryPolicy
): RetryPolicy => (status) => {
  const delay = policy(status)
  return delay === undefined ? undefined : Math.min(maxDelay, delay)
}

/**
 * 2つのポリシーをマージします。**クイズ**：2 つのポリシーをマージするとはどういう意味ですか?
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
// テスト
// -------------------------------------------------------------------------------------

/**
 * statusにpolicyを適用して、結果を確認します。
 */
export const applyPolicy = (policy: RetryPolicy) => (
  status: RetryStatus
): RetryStatus => ({
  iterNumber: status.iterNumber + 1,
  previousDelay: policy(status)
})

/**
 * すべての中間結果を保存して、policyを適用する。
 */
export const dryRun = (policy: RetryPolicy): ReadonlyArray<RetryStatus> => {
  const apply = applyPolicy(policy)
  let status: RetryStatus = apply(startStatus)
  const out: Array<RetryStatus> = [status]
  while (status.previousDelay !== undefined) {
    status = apply(out[out.length - 1])
    out.push(status)
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
