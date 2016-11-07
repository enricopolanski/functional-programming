# Type annotations

In matematica, e quindi in functional programming, è **essenziale** esprimere il dominio e il codominio di ogni funzione

```
f: A -> B
```

Dominio e codominio possono essere espressi nella "firma" ("signature") della funzione. Vediamo ad esempio la firma di `sum` in vari formalismi

Notazione matematica

```
sum: number x number -> nuber
```

Notazione Flow / TypeScript

```
type sum = (x: number, y: number) => number
```

Notazione Haskell

```
sum :: number -> number -> number
```

# Kinds

Che cosa sono gli "higher kinded types"? Parlare di "kind" è come edificare una torre, ove ogni piano è costituito da entità costruite partendo da quelle del piano inferiore. Consideriamo i tipi `number` o `string`. Questi sono al primo piano e vengono associati al kind **uno** oppure, in simboli, alla scrittura `*`. Adesso consideriamo le scritture che si utilizzano per definire un'entità parametrizzata da un solo tipo, ad esempio `Array<A>` o `Promise<A>`. Sono ancora dei tipi? In gergo solitamente diciamo di si, ma formalmente non lo sono, sono dei "kind". `Array<A>` e `Promise<A>` hanno kind **due**, oppure in simboli, `* -> *`. Notate che quest'ultimo simbolo richiama alla mente una funzione a livello di tipi: un kind di livello due è come una funzione che accetta un tipo e restituisce un tipo. Per esempio `Array<A>` è (come se fosse) una funzione che accetta un tipo `A` e restituisce il tipo degli array i cui elementi sono di tipo `A`. Si può continuare con questo processo all'infinito producendo i kind di livello tre `* -> * -> *`, quattro, etc..

In TypeScript e in Flow non è possibile esprimere un kind superiore a uno in modo parametrico, perchè per esempio la scrittura

```
F<?>
```

che dovrebbe esprimere il fatto che `F` è parametrizzato da un tipo generico `?` non è supportata.

In Scala si utilizza la sintassi

```
F[_]
```

mentre in PureScript si utilizza la semplice giustapposizione

```
forall a. f a
```

# Type classes

Una type class è come un'interfaccia, ovvero una serie di proprietà e funzioni che devono essere supportate da un determinato tipo. Vediamo come per esempio in PureScript viene definita una type class per i funtori

```purescript
class Functor f where
  map :: forall a b. (a -> b) -> f a -> f b
```

Notate che in PureScript gli higher kinded types possono essere agevolmente espressi: `f a`

Oppure come viene definita la type class che rappresenta i semigruppi

```purescript
class Semigroup a where
  append :: a -> a -> a
```

# Type constraints

Talvolta è utile aggiungere dei vincoli a dei tipi, ad esempio se vogliamo che implementino determinate type class. Di seguito vediamo come vengono definiti i monoidi, avendo come dipendenza i semigruppi

```purescript
class Semigroup m <= Monoid m where
  mempty :: m
```
