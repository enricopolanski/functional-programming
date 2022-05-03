## Question

The `concatAll` function takes:

- an instance of a semigroup
- an initial value
- an array of elements

```ts
import * as S from 'fp-ts/Semigroup'
import * as N from 'fp-ts/number'

const sum = S.concatAll(N.SemigroupSum)(2)

console.log(sum([1, 2, 3, 4])) // => 12
```

Why do I need to provide an initial value?

## Answer

Because there is no way to infer from the Semigroup what to do in case of an empty list. There is no way to define an `empty` value on a Semigroup. See [Monoid's concatAll below](https://github.com/enricopolanski/functional-programming/#the-concatall-function-1) to see the difference.
