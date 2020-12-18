# 1. Semigroup

**Esercizio 1.1** definire una istanza di `Semigroup` per `Point`:

```ts
type Point = {
  readonly x: number
  readonly y: number
}
```

**Esercizio 1.2** definire una istanza di `Semigroup` per `Vector`:

```ts
type Vector = {
  readonly from: Point
  readonly to: Point
}
```

# 2. Eq

**Esercizio 2.1** definire una istanza di `Eq` per `Option<A>`.

**Esercizio 2.2** definire una istanza di `Eq` per `Either<E, A>`.
