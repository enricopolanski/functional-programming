# Monadi

## Definizione

Una monade `M` è un funtore con due operazioni in più (oltre a `map`)

```
of: A => M<A>
chain: ( A => M<B>, M<A>) => M<B>
```

Nota. Sinonimi di `of` sono `pure`, `return`, `point`; sinonimi di `chain` sono `bind`, `flatMap`.

Inoltre devono valere le seguenti leggi:

- Left identity: `chain(f, of(a)) = f(a)`
- Right identity: `chain(of, u) = u`
- Associativity: `chain(g, chain(f, u)) = chain(x => chain(g, f(x)), u)`

Chiaro no? **No**.

## Primo mito delle monadi: sequenzialità

> Le monadi incorporano l'essenza di una computazione sequenziale

E' la composizione di funzioni che incorpora l'essenza di sequenzialità

```js
const x1 = ...
const x2 = g(x1)
const x3 = f(x2)

const x3 = f(g(x1)) = compose(f, g)(x1)
```

La programmazione funzionale ci dice che un intero programma può essere modellato con una funzione

```js
function main(world: World): World {
  ...
}
```

ma come faccio a modellare lo stato?

```js
const w1: World = ...
const w2 = main(w1)
const w3 = main(w2)
...
```

ok, ma come faccio a scrivere `main`?

La programmazione funzionale si basa su una tecnica risaputa, decomporre un problema in sotto problemi più piccoli, per poi ricomporre le soluzioni trovate per i sotto problemi.

Cosa c'è di nuovo però? Il fatto che in programmazione funzionale come decomporre e come ricomporre il problema non è lasciato all'istinto del programmatore: la metodologia suggerita è quella di descrivere il programma tramite strutture algebriche (monoidi, categorie, funtori, etc...) che godono di buone proprietà di composizione.

**Ma che due funzioni compongano è un evento raro!**

Il dominio di `f` **deve** essere il codominio di `g`

```js
g: A -> B
f: B -> C
```

Ma in generale non è così. Come faccio allora?

Enter monads...

## Secondo mito delle monadi: sono difficili

La categorie di Kleisli no e sono equivalenti.

Enter Kleisli cats... [video](https://www.youtube.com/watch?v=WEp_9uhbAOM)

## Esempi

### `Id`

```js
{
  of<A>(a: A): Id<A> {
    return a
  },
  chain<A, B>(f: (a: A) => Id<B>, fa: Id<A>): Id<B> {
    return f(fa)
  }
}
```

Maybe

```js
{
  of<A>(a: A): Maybe<A> {
    return a
  },
  chain<A, B>(f: (a: A) => Maybe<B>, fa: Maybe<A>): Maybe<B> {
    return fa == null ? null : f(fa)
  }
}
```

Array

```js
{
  of<A>(a: A): Array<A> {
    return [a]
  },
  chain<A, B>(f: (a: A) => Array<B>, fa: Array<A>): Array<B> {
    return fa.reduce((acc, a) => acc.concat(f(a)), [])
  }
}
```

Promise

```js
{
  of<A>(a: A): Promise<A> {
    return Promise.resolve(a)
  },
  chain<A, B>(f: (a: A) => Promise<B>, fa: Promise<A>): Promise<B> {
    return fa.then(a => f(a))
  }
}
```

## Esercizi

1) Mostrare che la seguenti definizioni di monade sono equivalenti

a) Una monade `M` è un funtore con associate le seguenti operazioni:

```js
of: A => M<A>
join: M<M<A>> => M<A>
```

b) Una monade `M` è un type constructor con associate le seguenti operazioni (notare l'assenza dell'ipotesi funtoriale):

```js
of: A => M<A>
chain: ( A => M<B>, M<A> ) => M<B>
```

Hint: traccia di dimostrazione per `Array`

```js
// a) => b)
declare function map<A, B>(f: (a: A) => B, fa: Array<A>): Array<B>;
declare function of<A>(a: A): Array<A>;
declare function join<A>(mma: Array<Array<A>>): Array<A>;

function chain<A, B>(f: (a: A) => Array<B>, ma: Array<A>): Array<B> {
  return ???
}

// b) => a)
declare function of<A>(a: A): Array<A>;
declare function chain<A, B>(f: (a: A) => Array<B>, ma: Array<A>): Array<B>;

function map<A, B>(f: (a: A) => B, fa: Array<A>): Array<B> {
  return ???
}

function join<A>(mma: Array<Array<A>>): Array<A> {
  return ???
}
```

2) Definire l'istanza di monade per `Either`

```js
type Either<L, R> = { type: 'Left', left: L } | { type: 'Right', right: R };
```
