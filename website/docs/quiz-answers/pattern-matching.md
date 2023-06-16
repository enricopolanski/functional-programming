## Question

```ts
interface Nil {
  readonly _tag: 'Nil'
}

interface Cons<A> {
  readonly _tag: 'Cons'
  readonly head: A
  readonly tail: List<A>
}

export type List<A> = Nil | Cons<A>

export const match = <R, A>(
  onNil: () => R,
  onCons: (head: A, tail: List<A>) => R
) => (fa: List<A>): R => {
  switch (fa._tag) {
    case 'Nil':
      return onNil()
    case 'Cons':
      return onCons(fa.head, fa.tail)
  }
}

export const head = match(
  () => undefined,
  (head, _tail) => head
)
```

Why's the `head` API sub optimal?

## Answer

The issue with `head` here is, its codomain (return type) can be either the type of List element `A` (in `List<A>`) or `undefined`. Working with this return type can be challenging and increase the possibility of introducing bugs. If we can always return the same type, then we don't need to write 2 separate pieces of code to handle two different possible return types from head function.
 
In fact, we always implement a `match` function to return the same type (unlike in this example). You will learn how to have `A` (in `List<A>`) and `undefined` modeled under the one type later in this tutorial.
