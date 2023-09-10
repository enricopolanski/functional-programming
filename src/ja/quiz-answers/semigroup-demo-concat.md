# semigroup-demo-concat

## 問題

[`01_retry.ts`](../01_retry.ts)で定義されたコンビネータの`concat`を使って、`RetryPolicy`のセミグループを定義できますか？

## 答え

できます。書いてみましょう。

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const SemigroupRetryPolicy: Semigroup<RetryPolicy> = {
  concat: (first, second) => concat(first)(second)
}
```

セミグループのすべての条件を満たしています。

- 引数の`first`，`second`と結果の`concat`は全部`RetryPolicy`
- `concat`は结合律を満たしている:
  `RetryPolicy`の任意の元の`first`，`second`、`third`と`status`に対して：
  - 一つの`RetryPolicy`でも`undefined`を返したら、`concat(concat(first, second), third)(status)`と`concat(first, concat(second, third))(status)`のどちらでも`undefined`になります。
  - すべての`RetryPolicy`が`number`を返すのであれば、`concat(concat(first, second), third)(status)`の結果は`Math.max(Math.max(delay1, delay2), delay3)`になり，`concat(first, concat(second, third))(status)`の結果は`Math.max(delay1, Math.max(delay2, delay3))`になります。`Math.max`が交換律を満たしていますので，结果は`delay1`，`delay2`，`delay3`の中で最も大きい方になります。
