# Algebre a monoidi

Nell'introduzione abbiamo visto la definizione di `Semigruppo`: un semigruppo è una coppia `(X, *)` ove `X` è un insieme e `*` è un'operazione binaria associativa.

## Monoidi

Se aggiungiamo una condizione in più, ovvero che esiste un elemento `u` appartenente a `X` tale che per ogni elemento `m` di `X` vale `u * m = m * u = m`, allora la coppia `(X, *, u)` viene chiamata *monoide* e l'elemento `u` viene chiamato "unità" (sinonimi: "elemento neutro", "elemento identità")

## Algebre

Questa è la gerarchia algebrica alla quale appartengono i monoidi

```
(M, *) "magma", * è un'operazione "chiusa" (o "interna") su M ovvero *: M x M -> M

(S, *) "semigruppo", è un magma in cui * è associativa

(M, *, u) "monoide", è un semigruppo che ha un elemento identità, u * m = m * u = m per ogni m in M

(G, *, u) "gruppo", è un monoide che ammette elemento inverso per ogni m in M
```

Per "algebra" si intende generalmente una qualsiasi particolare combinazione di insiemi, operazioni, leggi.

Le algebre sono il modo in cui i matematici tendono a catturare un concetto (e solo quello) nel modo più puro, ovvero eliminando tutto ciò che è superfluo.

Per esempio i semigruppi catturano il concetto di operazione parallelizzabile.

Le algebre possono essere considerate alla stregua di "interfacce": quando si manipola una struttura algebrica sono permesse solo le operazioni definite dall'algebra in oggetto. I matematici "lavorano a interfacce" da secoli e funziona in modo egregio.

## Monoidi come categorie

La "somiglianza" di un monoide `(X, *, u)` e una categoria:

- un'operazione che "compone" gli elementi
- l'operazione deve essere "associativa"
- c'è il concetto di "identità"

non è casuale. Ad un monoide `(X, *, u)` può essere associata una categoria con un solo oggetto, i cui morfismi sono gli elementi di `X` e la cui operazione di composizione è `*`.

> Categories correspond to strongly typed languages, monoids to untyped languages - Bartosz Milewski

Dato che i monoidi possono essere associati ad una categoria con un solo oggetto, a quale tipologia di linguaggi è assimilabile un monoide?

> dynamic typing is just a special case of static typing where there is only one type - anonymous

## Esempi

- `(number, *, 1)`
- `(number, +, 0)`
- `(String, +, "")`
- `(Array<any>, concat, [])`
- `(Object, Object.assign, {})`

Ancora un altro esempio di monoide, questa volta un po' più astratto ma ugualmente importante e comune, è `(End(X), ., idX)` dove `End(X)` è l'insieme delle funzioni `f: X -> X` (ovvero le funzioni che, dato un insieme `X`, hanno come dominio e codominio `X` e che prendono il nome di "endomorfismi"), `.` è l'usuale composizione di funzioni e l'elemento neutro è la funzione identità (su `X`)

Quindi, per esempio, all'insieme delle funzioni `number -> number` può essere associata un'istanza di monoide

## Controesempi

Un esempio di struttura dati che è un semigruppo ma NON è un monoide sono le gli array con almeno un elemento

```
type NonEmptyArray<A> = { head: A, tail: Array<A> };
```

## Implementazione

Ecco come vengono definite le type class di semigruppi e monoidi in PureScript

```purescript
class Semigroup a where
  append :: a -> a -> a

class Semigroup m <= Monoid m where
  mempty :: m
```

In JavaScript una type class può essere implementata come un semplice dizionario di proprietà / funzioni

```js
interface Semigroup<S> {
  concat(x: S, y: S): S;
}

interface Monoid<M> extends Semigroup<M> {
  empty(): M;
}
```

Le leggi che devono valere per `empty()` e `concat()` purtroppo non hanno un'implementazione associata.

Come primo esempi implementiamo il monoide `(String, +, "")`

```js
const stringMonoid: Monoid<string> = {
  empty() { return '' },
  concat(x, y) { return x + y }
}
```

e il monoide `(number, *, 1)`

```js
const multMonoid: Monoid<number> = {
  empty() { return 1 },
  concat(x, y) { return x * y }
}
```

Per utilizzare l'implementazione di una type class, occorre passare il dizionario come parametro

```js
function fold<M>(monoid: Monoid<M>, ms: Array<M>): M {
  if (ms.length === 0) {
    return monoid.empty()
  }
  return monoid.concat(ms[0], fold(monoid, ms.slice(1)))
}

fold(stringMonoid, ['a', 'b', 'c']) // => 'abc'
fold(productMonoid, [2, 3, 4]) // => 24
fold(productMonoid, []) // => 1
```

## Il monoide prodotto

Dati due monoidi, ci sono operazioni che posso effettuare e che mi danno come risultato ancora un monoide? La prima operazione che si tenta sempre è il prodotto:

Siano `M1 = (X1, *1, u1)` e `M2 = (X2, *2, u2)` due monoidi allora il loro prodotto, indicato con `M1 x M2`, e definito nel modo seguente

- l'insieme "sostegno" ("carrier") è `X1 x X2` ovvero le coppie `(x1, x2)` ove `x1 ∈ X1`, `x2 ∈ X2`
- l'operazione `*: (X1 x X2) x (X1 x X2) -> X1 x X2` è definita da `*( (a1, a2), (b1, b2) ) = (a1 *1 b1, a2 *2 b2)`
- `u = (u1, u2)`

è un monoide.

## Monoidi liberi (Free monoids)

Cosa succede se ho un insieme `X` al quale non posso associare facilmente un'istanza di monoide? Esiste un'operazione su `X` che produce in modo "automatico" un monoide? E se si, il monoide generato che caratteristiche ha?

Consideriamo come `X` l'insieme costituito dalle due stringhe `'a'` e `'b'` e come operazione `*` la giustapposizione:

```
*(a, b) = ab
```

Ovviamente quello che abbiamo non è un monoide: non c'è traccia di un elemento neutro e appena applichiamo `*` "cadiamo fuori" dall'insieme `X`. Possiamo però costruire (e possiamo farlo perchè in fondo viviamo in una fantasy land e si fa quel che ci pare) il seguente monoide `M(X)` che viene chiamato "monoide generato da `X`" o "monoide libero":

`M(X) = (Y, *, u)` ove

- `*` è l'operazione da cui siamo partiti
- `u` è un elemento speciale che fa da unità
- `Y = { u, a, b, ab, ba, aa, bb, aab, aba, ... }`

Attenzione: perchè valga la proprietà associativa dobbiamo anche identificare alcuni elementi generati, ad esempio `(aa)b = a(ab)`

Gli elementi di `X` vengono detti "elementi generatori" di `M(X)`.

Ora il colpo di scena, è possibile dimostrare che:

- `M(X)` è il "più piccolo" monoide che contiene `X` (il termine "libero" si usa quando sussiste questa proprietà)
- `M(X)` è *isomorfo* a `(Array<X>, concat, [])`

### Applicazioni

- laziness: posticipare le operazioni di concatenazione a quando è davvero necessario

# Approfondimenti

- [Free Monoids - by Bartosz Milewski](https://bartoszmilewski.com/2015/07/21/free-monoids/)

# Esercizi

1) Implementare il prodotto di due monoidi

```js
// funzione da implementare
declare function product<A, B>(m1: Monoid<A>, m2: Monoid<B>): Monoid<[A, B]>;

// test
const stringMultMonoid = product(stringMonoid, multMonoid)

console.log(fold(stringMultMonoid, [
  ['a', 2],
  ['b', 3]
])) // => ["ab", 6]
```

2) Reimplementare `Array.prototype.every` in termini di `fold`

Suggerimento: definire un monoide su `boolean` in cui `concat` agisce come `&&`

3) Reimplementare `Array.prototype.some` in termini di `fold`

Suggerimento: definire un monoide su `boolean` in cui `concat` agisce come `||`

4) Implementare una funzione che restituisce un monoide per `Promise<A>` per ogni `A`

```js
declare function getPromiseMonoid<A>(monoid: Monoid<A>): Monoid<Promise<A>>;
```

5) Implementare una funzione che restituisce un monoide per `Maybe<A>` per ogni `A` (ove `Maybe<A> = ?A` e `?A =A | null | undefined`)

```js
declare function getMaybeMonoid<A>(monoid: Monoid<A>): Monoid<?A>;
```

6) Implementare una funzione che, dato un semigruppo su `A` e un tipo con un solo elemento `B = { b }`, restituisce un monoide su `A | B`

```js
declare function getMonoidOfSemigroup<A, B>(semigroup: Semigroup<A>, b: B): Monoid<A | B>;
```

7) Un esempio di semigruppo per le funzioni

```js
// @flow

interface Semigroup<A> {
  concat(x: A, y: A): A;
}

// concatena due stringhe
const stringSemigroup: Semigroup<string> = {
  concat: (x, y) => x + y
}

// concatena due booleani (OR)
const all: Semigroup<boolean> = {
  concat: (x, y) => x && y
}

// concatena due funzioni: la funzione restituita applica lo stesso argomento
// alle due funzioni e poi concatena i risultati. Notare che per concatenare
// i risultati occorre un'istanza di semigruppo per il tipo di ritorno B
function getFunctionSemigroup<A, B>(semigroup: Semigroup<B>): Semigroup<(a: A) => B> {
  return {
    concat: (x, y) => a => semigroup.concat(x(a), y(a))
  }
}

// primo test: una funzione che data una stringa concatena la sua versione
// maiuscola e quella minuscola
const toUpperCase = s => s.toUpperCase()
const toLowerCase = s => s.toLowerCase()
const bothCase = getFunctionSemigroup(stringSemigroup).concat(toUpperCase, toLowerCase)

console.log(bothCase('abc')) // => ABCabc

// secondo test: scrivere una funzione che restituisce
// true se le parentesi sono bilanciate
const startsWith = token => s => s.startsWith(token)
const endsWith = token => s => s.endsWith(token)
const parens = getFunctionSemigroup(all).concat(startsWith('('), endsWith(')'))

console.log(parens('(+ 1 2)')) // => true
console.log(parens('(+ 1 2')) // => false
```
