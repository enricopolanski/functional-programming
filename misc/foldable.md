# Foldable

`Foldable` represents data structures which can be *folded*.

Questa è la definizione della type class `Foldable` in PureScript

```purescript
class Foldable f where
  foldr :: forall a b. (a -> b -> b) -> b -> f a -> b
  foldl :: forall a b. (b -> a -> b) -> b -> f a -> b
  foldMap :: forall a m. Monoid m => (a -> m) -> f a -> m
```

- `foldr` folds a structure from the right
- `foldl` folds a structure from the left
- `foldMap` folds a structure by accumulating values in a `Monoid`

```scala
trait Foldable[F[_]] {
  def foldr[A, B](f: A => B => B)(b: B)(fa: F[A]): B
  def foldl[A, B](f: B => A => B)(b: B)(fa: F[A]): B
  def foldMap[A, M: Monoid](f: A => M)(fa: F[A]): M
}
```

La prima considerazione da fare è che le tre funzioni sono ridondanti: è possibile prederne una qualsiasi e stabilire che costituisce la definizione di `Foldable` dato che le altre due possono essere derivate. La ragione per la quale la definizione di `Foldable` contiene tutte e tre le versioni è che, in casi specifici, si ha la possibilità di definire implementazioni più efficienti rispetto a quelle derivate.
