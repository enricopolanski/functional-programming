# semigroup-demo-concat

## 问题

定义在[`01_retry.ts`](../01_retry.ts)中的combinator `concat`能否用来给`RetryPolicy`定义一个半群接口？

## 答案

可以。让我们尝试定义一下：

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const SemigroupRetryPolicy: Semigroup<RetryPolicy> = {
  concat: (first, second) => concat(first)(second)
}
```

它满足所有半群的约束：

- 参数`first`，`second`与结果`concat`都是类型`RetryPolicy`
- `concat`满足结合律:
  给定3个`RetryPolicy`，`first`，`second`与`third`。和一个`status`:
  - 如果任意一个`RetryPolicy`返回`undefined`，那么`concat(concat(first, second), third)(status)`与`concat(first, concat(second, third))(status)`都将会是`undefined`。
  - 如果所有的`RetryPolicy`都返回一个数字，那么`concat(concat(first, second), third)(status)`的结果会是`Math.max(Math.max(delay1, delay2), delay3)`，`concat(first, concat(second, third))(status)`的结果会是`Math.max(delay1, Math.max(delay2, delay3))`。`Math.max`满足交换律，因此结果会是`delay1`，`delay2`，`delay3`中的最大值。
