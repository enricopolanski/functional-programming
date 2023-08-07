# magma-concat-closed

## 问题

```ts
import { Magma } from 'fp-ts/Magma'

const MagmaSub: Magma<number> = {
  concat: (first, second) => first - second
}
```

`concat`是一个 _封闭性(Closure)_ 运算这一事实看似不起眼，其实非常重要。如果`A`是自然数的集合而不是 JavaScript的number类型(正负浮点数的集合), 我们能用`MagmaSub`的`concat`去定义`Magma<Natural>`吗? 你能想到其他定义在自然数上的不具备 _封闭性_ 的`concat`运算吗?

## 答案

对于自然数，减法运算无法定义`Magma`。当`b`大于`a`时，`a - b`是一个负数而不是自然数。
其他定义在自然数上并不具备 _封闭性_ 的`concat`运算：

- `concat: (first, second) => first / second`
- `concat: (first, second) => (first + second) / 2`
