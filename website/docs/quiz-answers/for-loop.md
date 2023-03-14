## Question

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

Is the `for loop` correct?

## Answer

No, it's not. The condition `i <= xs.length` should be `i < xs.length`.

As it is coded, `ys`'s value is `[ 2, 4, 6, NaN ]` instead of `[ 2, 4, 6 ]`
