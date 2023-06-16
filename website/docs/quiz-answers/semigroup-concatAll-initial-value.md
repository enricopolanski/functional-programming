## Question

By definition `concat` combines merely two elements of `A` every time. Is it possible to combine any number of them?

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

The `concatAll` method has to return an element of type `A`. If the provided array of elements is empty, we don't have any element of type `A` to return from it.
Enforcing the need of an initial value makes sure we can return this initial value if the array is empty.

We could also define a `concatAll` method which would take a `NonEmptyArray<A>` and no initial value. It's actually pretty easy to implement:

```ts
import * as Semigroup from 'fp-ts/Semigroup'
import * as NEA from 'fp-ts/NonEmptyArray'

const concatAll = <A>(S: Semigroup<A>) => (as: NEA<A>) =>
  Semigroup.concatAll(S)(NEA.tail(as))(NEA.head(as))
```
