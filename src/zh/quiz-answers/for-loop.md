# for-loop

## 问题

```ts
// input
const xs: Array<number> = [1, 2, 3]

// transformation
const double = (n: number): number => n * 2

// result: I want an array where each `xs`' element is doubled
const ys: Array<number> = []
for (let i = 0; i <= xs.length; i++) {
  ys.push(double(xs[i]))
}
```

`for`循环正确吗？

## 答案

不正确。条件部分的`i <= xs.length`应该是`i < xs.length`。
按照上述代码，`ys`的值会是`[ 2, 4, 6, NaN ]`，而不是`[ 2, 4, 6 ]`。
