## Question

Is the following semigroup instance lawful (does it respect semigroup laws)?

```ts
import { Semigroup } from 'fp-ts/Semigroup'

/** Always return the last argument */
const last = <A>(): Semigroup<A> => ({
  concat: (_first, second) => second
})
```

## Answer

Yes:

- `first`, `second` and the result of `concat` (which is `second`) are all of the same type `A`
- `concat` is associative:
  - `concat(concat(first, second), third)` evaluates to `concat(second, third)` which then evaluates to `third`
  - `concat(first, concat(second, third))` evaluates to `concat(first, third)` which then evaluates to `third`
