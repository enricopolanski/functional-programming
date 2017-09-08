# Semigroup

```purescript
class Semigroup a where
  append :: a -> a -> a
```

Aliases:

- `<> = append`

Laws:

- Associativity: `(x <> y) <> z = x <> (y <> z)`

# Monoid

```purescript
class Semigroup a <= Monoid a where
  mempty :: a
```

Laws:

- Left and right unit: `forall x. mempty <> x = x <> mempty = x`

# Functor

```purescript
class Functor f where
  map :: forall a b. (a -> b) -> f a -> f b
```

 Aliases:

- `<$> = map`
- `<#> = flippedMap`
- `<$ = voidRight`
- `$> = voidLeft`

Laws:

- Identity: `map id = id`
- Composition: `map (f <<< g) = map f <<< map g`

# Apply

```purescript
class Functor f <= Apply f where
  apply :: forall a b. f (a -> b) -> f a -> f b
```

Aliases:

- `<*> = apply`
- `<* = applyFirst`
- `*> = applySecond`

Laws:

- Associative composition: `(<<<) <$> f <*> g <*> h = f <*> (g <*> h)`

# Applicative

```purescript
class Apply f <= Applicative f where
  pure :: forall a. a -> f a
```

Laws:

- Identity: `pure id <*> v = v`
- Composition: `pure (<<<) <*> f <*> g <*> h = f <*> (g <*> h)`
- Homomorphism: `pure f <*> pure x = pure (f x)`
- Interchange: `u <*> pure y = pure ($ y) <*> u`

# Alt

```purescript
class Functor f <= Alt f where
  alt :: f a -> f a -> f a
```

Aliases:

- `<|> = alt`

Laws:

- Associativity: `(x <|> y) <|> z == x <|> (y <|> z)`
- Left Distributivity: `f <$> (x <|> y) == (f <$> x) <|> (f <$> y)`
