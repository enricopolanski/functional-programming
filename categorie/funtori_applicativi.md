# Funtori applicativi

Nel capitolo sui [funtori](categorie_e_funtori.md#funtori) abbiamo visto come "liftare" una generica funzione `f: A -> B` con un solo argomento. Cosa succede se abbiamo una funzione con due o più argomenti? Possiamo ancora effettuare una operazione che sia simile al "lifting" che già conosciamo? Consideriamo una funzione con due argomenti

```
f: A x B -> C
```

ove `A x B` indica il [prodotto cartesiano](relazioni.md#prodotto-cartesiano) degli insiemi `A` e `B`. La funzione `f` può essere riscritta in modo che sia una composizione di due funzioni, ognuna con un solo parametro

```
f: A -> B -> C
```

Questo processo di riscrittura prende il nome di *currying*.

Se `F` è un funtore, quello che si vuole ottenere qui è una funzione `F(f)` tale che

```
F(f): F(A) -> F(B) -> F(C)
```

Ricapitoliamo con un diagramma

```
F(f):  F(A) ----> F(B) ----> F(C)  <= categoria D
        ^          ^          ^
        |          |          |
        |          |          |
 f:     A -------> B -------> C    <= categoria C
```

Proviamo a costruire `F(f)` con i soli mezzi che abbiamo a disposizione. Siccome sappiamo che la composizione di funzioni è [associativa](categorie_e_funtori.md#seconda-legge-composizione-di-morfismi) possiamo evidenziare il secondo elemento della composizione di `f` vedendola come una funzione che accetta un solo parametro di tipo `A` e restituisce un valore di tipo `B -> C` (anche le funzioni hanno un loro tipo).

```
f: A -> ( B -> C )
```

adesso che ci siamo ricondotti ad avere una funzione con un solo parametro, possiamo liftarla tramite `F`

```
F(f): F(A) -> F(B -> C)
```

Ma a questo punto rimaniamo bloccati! Perchè non c'è nessuna operazione lecita che ci permette di passare dal tipo `F(B -> C)` al tipo `F(B) -> F(C)`.

Che `F` sia solo un funtore non basta, deve avere una proprietà in più, quella cioè di possedere una operazione che permette di "spacchettare" il tipo delle funzioni da `B` a `C` mandandolo nel tipo delle funzioni da `F(B)` a `F(C)`. Questa operazione si indica comunemente con `ap`.

In più è comodo avere un'altra operazione che, dato un elemento di `A` associa un elemento di `F(A)`. Questa operazione si chiama `of` (sinonimi sono `pure`, `point`, `return`).

## Definizione

Sia `F` un funtore tra le categorie `C` e `D`, allora `F` si dice *funtore applicativo* se esistono due funzioni

```
of: A -> F(A)
ap: F(A -> B) -> F(A) -> F(B)
```

tali che valgono le seguenti proprietà (o leggi)

- Identity: `ap(of(id), x) = x`
- Homomorphism: `ap(of(f), of(x)) = of(f(x))`
- Interchange: `ap(u, of(y)) = ap(of(f => f(y)), u)`

## Definizione di una `interface` per i funtori applicativi

```js
interface PointedFunctor<F> extends Functor<F> {
  of<A>(a: A): F<A>;
}

interface Apply<F> extends Functor<F> {
  ap<A, B>(ff: F<(a: A) => B>, fa: F<A>): F<B>;
}

interface Applicative<F> extends PointedFunctor<F>, Apply<F> {}
```

## `liftA2`

```js
export function liftA2<F, A, B, C>(applicative: Applicative<F>, f: (a: A, b: B) => C): (fa: F<A>, fb: F<B>) => F<C> {
  const cf = a => b => f(a, b)
  return (fa, fb) => applicative.ap(applicative.map(cf, fa), fb)
}
```

## Esempi

### `Id`

```js
{
  map<A, B>(f: (a: A) => B, fa: Id<A>): Id<B> {
    return f(fa)
  },
  of<A>(a: A): Id<A> {
    return a
  },
  ap<A, B>(ff: Id<(a: A) => B>, fa: Id<A>): Id<B> {
    return ff(fa)
  }
}
```

### `Maybe`

```js
{
  map<A, B>(f: (a: A) => B, fa: Maybe<A>): Maybe<B> {
    return fa == null ? fa : f(fa)
  },
  of<A>(a: A): Maybe<A> {
    return a
  },
  ap<A, B>(ff: Maybe<(a: A) => B>, fa: Maybe<A>): Maybe<B> {
    if (ff != null && fa != null) {
      return ff(fa)
    }
    return null
  }
}
```

### `Promise`

```js
{
  map<A, B>(f: (a: A) => B, fa: Promise<A>): Promise<B> {
    return fa.then(f)
  },
  of<A>(a: A): Promise<A> {
    return Promise.resolve(a)
  },
  ap<A, B>(ff: Promise<(a: A) => B>, fa: Promise<A>): Promise<B> {
    return ff.then(f => fa.then(a => f(a)))
  }
}
```

### `Array`

```js
{
  map<A, B>(f: (a: A) => B, fa: Array<A>): Array<B> {
    return fa.map(f)
  },
  of<A>(a: A): Array<A> {
    return [a]
  },
  ap<A, B>(ff: Array<(a: A) => B>, fa: Array<A>): Array<B> {
    return ff.reduce((acc, f) => acc.concat(fa.map(f)), [])
  }
}
```

### `Eff`

```js
{
  map<A, B>(f: (a: A) => B, fa: Eff<A>): Eff<B> {
    return () => f(fa())
  },
  of<A>(a: A): Eff<A> {
    return () => a
  },
  ap<A, B>(ff: Eff<(a: A) => B>, fa: Eff<A>): Eff<B> {
    return () => ff()(fa())
  }
}
```
