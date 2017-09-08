# Alternative

Le classi `Semigroup` e `Monoid` lavorano su tipi con kind `*` ai quali può essere associata una struttura monoidale, ricordiamone le definizioni

PureScript

```purescript
class Semigroup a where
  append :: a -> a -> a
```

- Associativity: `(x <> y) <> z = x <> (y <> z)`

```purescript
class Semigroup a <= Monoid a where
  mempty :: a
```

- Left and right unit: `forall x. mempty <> x = x <> mempty = x`

TypeScript

```ts
interface Semigroup<A> {
  concat: (x: A, y: A) => A
}
```

- Associativity: `append(append(x, y), z) = append(x, append(y, z))`

```ts
interface Monoid<A> extends Semigroup<A> {
  empty: A
}
```

- Left and right unit: `forall x. concat(empty, x) = concat(x, mempty) = x`

Ma cosa si può dire di analogo che riguardi un type constructor `F` che ha kind `* -> *` (per esempio `Option<A>`, `Array<A>`, etc...)? E' possibile dotare anche loro di un concetto simile? Per farlo occorrerebbe definire una operazione che combina due qualsiasi elementi di tipo `F<A>` **indipendentemente** da `A`, il che ci porta alla definizione della classe `Alt` (l'equivalente di `Semigroup`)

PureScript

```purescript
class Functor f <= Alt f where
  alt :: f a -> f a -> f a

infixl 3 alt as <|>
```

TypeScript

```ts
export interface Alt<F> extends Functor<F> {
  alt<A>(fx: HKT<F, A>, fy: HKT<F, A>): HKT<F, A>
}
```

**Nota**. L'interfaccia è qui espressa utilizzando l'encoding per gli higher kinded type fornita dalla libreria `fp-ts`.

Così come `Semigroup` ha una legge associata, così una qualsiasi istanza di `Alt` deve soddisfare le seguenti due leggi

PureScript

- Associativity: `(x <|> y) <|> z == x <|> (y <|> z)`
- Left Distributivity: `f <$> (x <|> y) == (f <$> x) <|> (f <$> y)`

TypeScript

- Associativity: `x.alt(y).alt(z) == x.alt(y.alt(z))`
- Left Distributivity: `x.alt(y).map(f) == x.map(f).alt(y.map(f))`
