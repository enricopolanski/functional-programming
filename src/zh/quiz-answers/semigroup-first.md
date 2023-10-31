# semigroup-first

## 问题

以下半群实例合法吗(是否遵守半群定律)？

```ts
import { Semigroup } from 'fp-ts/Semigroup'

/** 总是返回第一个参数 */
const first = <A>(): Semigroup<A> => ({
  concat: (first, _second) => first
})
```

## 答案

合法:

- `first`，`second`与结果`concat`(实际上就是`first`)都是类型`A`
- `concat`满足结合律：
  - `concat(concat(first, second), third)`与`concat(first, third)`的结果相等，都是`first`
  - `concat(first, concat(second, third))`与`concat(first, second)`的结果相等，都是`first`
