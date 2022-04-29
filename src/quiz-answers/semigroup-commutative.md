## Question

Can you find a Semigroup example where `concat` is [**commutative**](https://en.wikipedia.org/wiki/Commutative_property) and one where it isn't?

## Answer

### Commutative:

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const SemigroupSum: Semigroup<number> = {
  concat: (first, second) => first + second
}
```

`concat(a, b) = a + b = b + a = concat(b, a)` as the addition is commutative

### Not commutative:

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const first = <A>(): Semigroup<A> => ({
  concat: (first, _second) => first
})
```

`concat(a, b) = a != concat(b, a)`
