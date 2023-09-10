# semigroup-second

## 問題

次のセミグループのインスタンスはセミグループの定義を満たしていますか？

```ts
import { Semigroup } from 'fp-ts/Semigroup';

/** いつでも2つ目の引数を返します */
const last = <A>(): Semigroup<A> => ({
  concat: (_first, second) => second
})
```

## 答え

満たしています。

- `first`，`second`と結果`concat`(実質`first`)は全部`A`
- `concat`は結合律を満たしています。
  - `concat(concat(first, second), third)`と`concat(second, third)`は結果が同じくて、`third`になります。
  - `concat(first, concat(second, third))`と`concat(first, third)`は結果が同じくて，`third`になります。
