## Question

```ts
import { Magma } from 'fp-ts/Magma'

const MagmaSub: Magma<number> = {
  concat: (first, second) => first - second
}
```

The fact that `concat` is a _closed_ operation isn't a trivial detail. If `A` is the set of natural numbers (defined as positive integers) instead of the JavaScript number type (a set of positive and negative floats), could we define a `Magma<Natural>` with `concat` implemented like in `MagmaSub`? Can you think of any other `concat` operation on natural numbers for which the `closure` property isn't valid?

## Answer

With natural numbers, the substraction operation cannot define a `Magma`. `a - b` with `b` being greater than `a` results in a negative number which is not a natural number.

Here are other examples of `concat` operation on natural numbers for which the `closure` property isn't valid:

- `concat: (first, second) => first / second`
- `concat: (first, second) => (first + second) / 2`
