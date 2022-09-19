## Question

It is possible to define a monoid instance for `Option<A>` that behaves like that:

| x        | y        | concat(x, y)           |
| -------- | -------- | ---------------------- |
| none     | none     | none                   |
| some(a1) | none     | some(a1)               |
| none     | some(a2) | some(a2)               |
| some(a1) | some(a2) | some(S.concat(a1, a2)) |

```ts
// the implementation is left as an exercise for the reader
declare const getMonoid: <A>(S: Semigroup<A>) => Monoid<Option<A>>
```

What is the `empty` member for the monoid?

## Answer

`none` is the empty member for our monoid because with it, all the Monoid laws are true. Let's check the monoid laws on our new monoid:

**associative**
```ts
concat(none, concat(none, concat(none))) === concat(concat(none, none), none)
concat(none, concat(none, concat(some(z)))) === concat(concat(none, none), some(z))
concat(none, concat(some(y), concat(none))) === concat(concat(none, some(y)), none)
concat(none, concat(some(y), concat(some(z)))) === concat(concat(none, some(y)), some(z))
concat(some(x), concat(none, concat(none))) === concat(concat(some(x), none), none)
...
concat(some(x), concat(some(y), concat(some(z)))) === concat(concat(some(x), some(y)), some(z))
```

**right identity**
```ts
concat(some(x), none) === some(x)
```

**left identity**
```ts
concat(none, some(x)) === some(x)
```