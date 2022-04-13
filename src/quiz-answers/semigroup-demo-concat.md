## Question

Can the `concat` combinator defined in the demo [`01_retry.ts`](src/01_retry.ts) be used to define a `Semigroup` instance for the `RetryPolicy` type?

## Answer

Yes, it can. Let's define the Semigroup like this:

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const SemigroupRetryPolicy: Semigroup<RetryPolicy> = {
  concat: (first, second) => concat(first)(second)
}
```

It obeys all the Semigroup rules:

- `first`, `second` and the result of `concat` are all of the same type `RetryPolicy`
- `concat` is associative:

  given 3 `RetryPolicy` `first`, `second` and `third` and a `status`:

  - if any of the `RetryPolicy` returns `undefined`, then the result of both `concat(concat(first, second), third)(status)` and `concat(first, concat(second, third))(status)` will be `undefined`.
  - if all the `RetryPolicy` return a number, then `concat(concat(first, second), third)(status)` will be `Math.max(Math.max(delay1, delay2), delay3)` and `concat(first, concat(second, third))(status)` will be `Math.max(delay1, Math.max(delay2, delay3))`. As `Math.max` is associative, the result will be the max of `delay1`, `delay2` and `delay3`.
