# semigroup-second

## 问题

以下半群实例合法吗？

```ts
import { Semigroup } from 'fp-ts/Semigroup'

/** 总是返回第二个参数 */
const last = <A>(): Semigroup<A> => ({
  concat: (_first, second) => second
})
```

## 答案

合法:

- `first`，`second`与结果`concat`(实际上就是`second`)都是类型`A`
- `concat`满足结合律：
  - `concat(concat(first, second), third)`与`concat(second, third)`的结果相等，都是`third`
  - `concat(first, concat(second, third))`与`concat(first, third)`的结果相等，都是`third`
