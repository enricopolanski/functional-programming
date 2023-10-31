# semigroup-first

## 問題

次のセミグループのインスタンスはセミグループの定義を満たしていますか？

```ts
import { Semigroup } from 'fp-ts/Semigroup';

/** いつでも最初の引数を返します */
const first = <A,>(): Semigroup<A> => ({
  concat: (first, _second) => first,
});
```

## 答え

満たしています。

- `first`，`second`と結果`concat`(実質`first`)は全部`A`
- `concat`は結合律を満たしています。
  - `concat(concat(first, second), third)`と`concat(first, third)`は結果が同じくて、`first`になります。
  - `concat(first, concat(second, third))`と`concat(first, second)`は結果が同じくて，`first`になります。
