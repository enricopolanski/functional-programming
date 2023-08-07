# semigroup-commutative

## 问题

你能分别找到一个`concat`满足交换律与不满足交换律的例子吗？

## 答案

### 满足交换律

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const SemigroupSum: Semigroup<number> = {
  concat: (first, second) => first + second
}
```

`concat(a, b) = a + b = b + a = concat(b, a)`所以加法满足交换律

### 不满足交换律

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const first = <A>(): Semigroup<A> => ({
  concat: (first, _second) => first
})
```

`concat(a, b) = a != concat(b, a)`
