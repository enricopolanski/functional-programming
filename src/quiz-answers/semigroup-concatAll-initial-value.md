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

Because the array of elements can be empty.
In that case, without the initial value, we would have to return `undefined` or `null` which would most probably not match the type of the Semigroup.
