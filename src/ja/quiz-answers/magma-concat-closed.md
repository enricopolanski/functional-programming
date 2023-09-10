# magma-concat-closed

## 問題

```ts
import { Magma } from 'fp-ts/Magma'

const MagmaSub: Magma<number> = {
  concat: (first, second) => first - second
}
```

`concat`が閉じているという事実は自明な性質ではありません。`A`がJavaScriptの数値型（正と負の浮動小数点数の集合）ではなく、自然数の集合である場合、`MagmaSub`の`concat`で`Magma<Natural>`を定義できますか？自然数において閉じていない他の`concat`演算はありますか？

## 答え

自然数の場合，引き算はマグマを定義できません。`b`が`a`より大きい場合、`a - b`は自然数ではなく、負の数になります。
他の自然数において、閉じていない`concat`演算：

- `concat: (first, second) => first / second`
- `concat: (first, second) => (first + second) / 2`
