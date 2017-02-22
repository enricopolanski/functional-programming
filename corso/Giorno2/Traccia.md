# Programma

Giorno II

- introduzione ai tipi statici (oggi scriviamo un po' di codice!)
- cos'è una algebra
- semigruppi
  - setoid
  - ord
- monoidi
- monoidi come categorie
- monoidi liberi
- che cos'è la programmazione funzionale?

# Introduzione ai tipi statici

## Type safety e garanzie sul codice

- reificazione di concetti astratti: computazione che può fallire -> `Maybe`
  - portato al limite: se un qualcosa non è rappresentato nel type system, non esiste.
- `if` vs `fold`
- `map` vs cicli `for`
- strutture dati immutabili
- "make impossible states not representable" (vedremo qualche esempio nel Giorno IV)
- runtime type checking vs static type checking

```js
const xs = [1, 2, 3]

// flessibile ma con un costo
// posso sbagliare l'indice di partenza
// quello di fine
// o il passo
for (var i = 0, len = xs.length - 1; i < len; i++) {
  ...
}

// nessuna possibilità di errore e ho la garanzia
// che l'array che ottengo ha lo stesso numero di elementi
xs.map(f)
```

> [Constraints Liberate, Liberties Constrain (video)](https://www.youtube.com/watch?v=GqmsQeSzMdw)

La mia scala di valori

> type safe > leggibile > funzionale > performance (misurate!)

## Motivazione (teorica)

Ricordiamo che

> Una funzione (pura e totale) `f: A -> B` è il sottoinsieme `f` di `A x B` tale che per ogni `a ∈ A` esiste esattamente un `b ∈ B` tale che `(a, b) ∈ f`

Senza specificare i tipi (dominio e codominio), non posso neppure parlare di funzioni.

## Motivazione (pratica)

Considerate il seguente codice

```js
// motivazione.js
const Maybe = x => ({
  map: f => Maybe(x == null ? null : f(x)),
  fold: (f, g) => x == null ? f() : g(x)
})

// trim: (s: string) => string
const trim = s => s.trim()

// x: Maybe<number>
const x = Maybe(1)

console.log(x.map(trim))
```

Quello che ottenete è una eccezione a runtime, il che è inaccettabile.

> Non ogni bug è un type error, ma ogni type error è un bug

Dunque obiettivo numero uno è eliminare (per quanto possibile) ogni tipo di type error.

E' lo scopo dei type system "sound": ogni programma non valido viene rifiutato (ma possono essere rifiutati programmi validi).

Vediamo cosa succede usando TypeScript

```ts
// motivazione.ts
export class Maybe<A> {
  value: A | null;
  constructor(value: A | null) {
    this.value = value
  }
  map<B>(f: (a: A) => B): Maybe<B> {
    return this.value == null ? new Maybe<B>(null) : new Maybe(f(this.value))
  }
  fold<B>(f: () => B, g: (a: A) => B) {
    return this.value == null ? f() : g(this.value)
  }
}

const trim = (s: string): string => s.trim()

const x: Maybe<number> = new Maybe(1)

console.log(x.map(trim)) // <= error: Type 'number' is not assignable to type 'string'
```

Quello che ottenete è un errore a **compile time**.

Purtroppo TypeScript non è sound, ma comunque aiuta ad eliminare un grosso numero di type error.

## TypeScript setup

```
npm install -g typescript@2.2.0
# se avete node >= 5.5
npm install -g ts-node
mkdir fp
cd fp
cat > index.ts
const a: string = 1 (ENTER)
(CTRL+D)
ts-node index.ts
```

Se vedete il seguente errore è andato tutto bene

```
Type '1' is not assignable to type 'string'
```

Se provate a modificare il contenuto del file in

```ts
const a: string = null
```

e rilanciate `ts-node` non otterrete nessun errore. Questo perchè dobbiamo abilitare l'opzione `strictNullChecks`

```
tsc --init
```

tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es5",
    "noImplicitAny": false, // <= true is better
    "sourceMap": false,
    "strictNullChecks": true
  }
}
```

> no more "undefined is not a function"

# Cos'è una algebra

Al posto di "functional programming" potremmo parlare di "algebraic programming".

> Le algebre sono i design pattern della programmazione funzionale

Per "algebra" si intende generalmente una qualsiasi particolare combinazione di insiemi, operazioni, leggi.

Le algebre sono il modo in cui i matematici tendono a catturare un concetto (e solo quello) nel modo più puro, ovvero eliminando tutto ciò che è superfluo.

Le algebre possono essere considerate alla stregua di "interfacce": quando si manipola una struttura algebrica sono permesse solo le operazioni definite dall'algebra in oggetto. I matematici "lavorano a interfacce" da secoli e funziona in modo egregio.

Facciamo un esempio: l'algebra magma.

Sia `M` un insieme e `*` un'operazione "chiusa" (o "interna") su `M` ovvero `*: M x M -> M`, allora la coppia `(M, *)` si chiama *magma*.

Un magma non possiede alcuna legge, vediamo un'algebra che ne contiene una: i semigruppi.

# Semigruppi

Sia `(S, *)` un magma, se `*` è associativa (legge), ovvero per ogni `a, b, c ∈ S` vale

```
(a * b) * c = a * ( b * c )
```

allora è un *semigruppo*.

L'insieme `S` si dice insieme *sostegno* del semigruppo.

La proprietà associativa semplicemente ci dice che non ci dobbiamo preoccupare di utilizzare le parentesi in una espressione e che possiamo scrivere `a * b * c`.

> I semigruppi catturano l'essenza di (alcune) operazioni parallelizzabili

Ma possono essere usati per rappresentare l'idea astratta di

- concatenazione
- fusione
- merging
- riduzione

Ci sono numrosi esempi di semigruppi:

- `(number, +)` ove `+` è l'usuale addizione di numeri
- `(number, *)` ove `*` è l'usuale moltiplicazione di numeri
- `(string, +)` ove `+` è l'usuale concatenazioni di stringhe
- `(boolean, &&)` ove `&&` è l'usuale congiunzione
- `(boolean, ||)` ove `||` è l'usuale disgiunzione

e molti altri ancora.

## Interfaccia

Come facciamo a tradurre queste idee astratte in JavaScript (TypeScript)? Possiamo implementare il concetto di semigruppo sul tipo `S` come una interfaccia, ove l'operazione `*` è chiamata `concat`

```ts
interface Semigroup<A> { // <= l'insieme sostegno è rappresentato da un tipo
  concat(x: A, y: A): A; // <= operazione *
}
```

Nota. Questa è la definizione di semigruppo in PureScript

```purescript
class Semigroup a where
  append :: a -> a -> a
```

Purtroppo l'associatività non può essere espressa nel type system

```ts
concat(concat(a, b), c) = concat(a, concat(b, c)) // <= deve valere per ogni a, b, c
```

Ecco come possiamo implementare il semigruppo `(number, +)`

```ts
const additionSemigroup: Semigroup<number> = { // <= provate a sostituire number con boolean
  concat: (x, y) => x + y
}
```

Notate che si possono definire diverse istanze di semigruppo per lo stesso insieme (tipo) sostegno

```ts
const multiplicationSemigroup: Semigroup<number> = {
  concat: (x, y) => x * y
}
```

Esercizio: implementare i seguenti semigruppi

- `everySemigroup = (boolean, &&)`
- `someSemigroup = (boolean, ||)`
- `mergeSemigroup = (Object, { ... })` (spread operator)

Ora se definiamo una generica funzione `reduce` che accetta un semigruppo come parametro

```ts
function reduce<A>(semigroup: Semigroup<A>, a: A, as: Array<A>): A {
  return as.reduce(semigroup.concat, a)
}
```

possiamo reimplementare alcune popolari funzioni

```ts
// Array.prototype.every
function every(as: Array<boolean>): boolean {
  return reduce(everySemigroup, true, as)
}
// Array.prototype.some
function some(as: Array<boolean>): boolean {
  return reduce(someSemigroup, false, as)
}
// Object.assign
function assign(as: Array<Object>): Object {
  return reduce(mergeSemigroup, {}, as)
}

console.log(every([true, false, true])) // => false
console.log(some([true, false, true])) // => true
```

Possiamo spingerci oltre, l'insieme sostegno può essere costituito anche da funzioni!

```ts
// Endomorphism<A> è l'insieme degli endomorfismi dell'insieme A
type Endomorphism<A> = (a: A) => A;

function compose<A>(f: Endomorphism<A>, g: Endomorphism<A>): Endomorphism<A> {
  return x => f(g(x))
}

function getEndomorphismSemigroup<A>(): Semigroup<Endomorphism<A>> {
  return { concat: compose }
}

function identity<A>(a: A): A {
  return a
}

function composeAll<A>(as: Array<Endomorphism<A>>): Endomorphism<A> {
  return reduce(getEndomorphismSemigroup<A>(), identity, as) // <= un altro caso in cui è utile identity!
}
```

## Non riesco a trovare un'istanza!

Cosa succede se, dato un tipo `A`, non si riesce a trovare un'operazione associativa su `A`?

Potete creare un'istanza di semigruppo per **ogni** tipo `A` usando una delle seguenti costruzioni

```ts
// always return the first argument
const leftZeroSemigroup = {
  concat: (x, y) => x
}
// always return the second argument
const rightZeroSemigroup = {
  concat: (x, y) => y
}
// always return the same value a ∈ A
const constSemigroup = {
  concat: (x, y) => a
}
```

Queste istanze sono dette *banali*, ma c'è un'altra tecnica molto utile che è quella di definire una istanza di semigruppo per `Array<A>` (chiamata il **semigruppo libero** di `A`)

```ts
function getFreeSemigroup<A>(): Semigroup<Array<A>> {
  return {
    // here concat is the native array method
    concat: (x, y) => x.concat(y)
  }
}
```

e poi mappare gli elementi di `A` sui singoletti di `Array<A>`

```ts
function of<A>(a: A): Array<A> {
  return [a]
}
```

Il semigruppo libero di `A` è il semigruppo i cui elementi sono tutte le possibili sequenze finite di elementi di `A`

> Il semigruppo libero di `A` può anche essere visto come un modo "lazy" di concatenare elementi di `A`: viene preservata tutta l'informazione.

Anche se ho a disposizione una istanza di semigruppo per `A`, potrei decidere di usare ugualmente il semigruppo libero perchè

- mi evita di eseguire computazioni possibilmente inutili
- mi evita di passare l'istanza di semigruppo giù nelle profondità del codice
- permette al consumer delle mie API di stabilire la strategia di concatenazione

Real world example: reporters di [io-ts](https://github.com/gcanti/io-ts)

## Semigruppi per i type constructors

Per poter costruire un'istanza di semigruppo sensata per un type constructor, per esempio `Maybe<A>` o `Promise<A>`, dobbiamo prima avere un'istanza di semigruppo per `A`.

**Maybes**

```ts
function getMaybeSemigroup<A>(semigroup: Semigroup<A>): Semigroup<Maybe<A>> {
  return {
    concat: (x, y) => {
      if (x.value == null) {
        return y
      }
      if (y.value == null) {
        return x
      }
      // here we need a semigroup instance for A
      return new Maybe(semigroup.concat(x.value, y.value))
    }
  }
}

console.log(reduce(
    getMaybeSemigroup(additionSemigroup),
    new Maybe(null),
    [new Maybe(2), new Maybe(null), new Maybe(3)]
  )
) // => Maybe(5)

console.log(reduce(
    getMaybeSemigroup(multiplicationSemigroup),
    new Maybe(null),
    [new Maybe(2), new Maybe(null), new Maybe(3)]
  )
) // => Maybe(6)
```

**Promises**

```ts
function getPromiseSemigroup<A>(semigroup: Semigroup<A>): Semigroup<Promise<A>> {
  return {
    concat: (x, y) => Promise.all([x, y])
      // again, here we need a semigroup instance for A
      .then(([ax, ay]) => semigroup.concat(ax, ay))
  }
}
```

## Il semigruppo prodotto

Date due istanze di semigruppo, una per il tipo `A` e una per il tipo `B`, ci sono operazioni che posso effettuare e che mi danno come risultato ancora un semigruppo?

La prima operazione che si tenta sempre è il prodotto, ovvero la tupla `[A, B]`

Siano `S1 = (X1, *1)` e `S2 = (X2, *2)` due semigruppi allora il loro prodotto, indicato con `S1 x S2`, e definito nel modo seguente

- l'insieme sostegno è `X1 x X2` ovvero le coppie `(x1, x2)` ove `x1 ∈ X1`, `x2 ∈ X2`
- l'operazione `*: (X1 x X2) x (X1 x X2) -> X1 x X2` è definita da `*( (a1, a2), (b1, b2) ) = (a1 *1 b1, a2 *2 b2)`

```ts
function getProductSemigroup<A, B>(semigroupA: Semigroup<A>, semigroupB: Semigroup<B>): Semigroup<[A, B]> {
  return {
    concat: ([ax, bx], [ay, by]) => [semigroupA.concat(ax, ay), semigroupB.concat(bx, by)]
  }
}

console.log(
  getProductSemigroup<number, string>(additionSemigroup, stringSemigroup)
    .concat([2, 'a'], [3, 'b'])
) // => [5, 'ab']
```

## Insiemi ordinati

Se `A` è ordinabile, allora è possibile definire un'istanza di semigruppo su `A` usando `min` (o `max`) come operazioni

```ts
const minSemigroup: Semigroup<number> = {
  concat: (x, y) => Math.min(x, y)
}

const maxSemigroup: Semigroup<number> = {
  concat: (x, y) => Math.max(x, y)
}
```

E' possibile catturare la nozione di "ordinabile"? Si ma prima dobbiamo catturare la nozione di "uguaglianza". I matematici parlano di *relazione di equivalenza*. Definiamo una nuova interfaccia (algebra)

```ts
interface Setoid<A> {
  equals(x: A, y: A): boolean
}
```

Devono valere le seguenti leggi:

- **riflessiva** `equals(x, x) = true` per ogni `x ∈ A`
- **simmetrica** `equals(x, y) = equals(y, x)` per ogni `x, y ∈ A`
- **transitiva** se `equals(x, y) = true` e `equals(y, z) = true` allora `equals(x, z) = true`

Ora possiamo catturare la nozione di "ordinabile, introduziamo l'interfaccia `Ord`

```ts
type Ordering = 'LT' | 'EQ' | 'GT';

interface Ord<A> extends Setoid<A> {
  compare(x: A, y: A): Ordering
}

// less than or equal
function leq<A>(ord: Ord<A>, x: A, y: A): boolean {
  return ord.compare(x, y) !== 'GT'
}
```

scriviamo che `x <= y` se e solo se `leq(ord, x, y) = true`.

Devono valere le seguenti leggi:

- **riflessiva** `x <= x` per ogni `x ∈ A`
- **antisimmetrica** se `x <= y` e `y <= x` allora `x = y` (se non vale questa proprietà, si chiama *preordine*)
- **transitiva** se `x <= y` e `y <= z` allora `x <= y`

Per essere compatibile con `Setoid` deve valere una proprietà aggiuntiva:

`compare(x, y) = 'EQ'` se e solo se `equals(x, y) = true`

Ora possiamo definire `min` e `max` in modo generale

```ts
function min<A>(ord: Ord<A>, x: A, y: A): A {
  return ord.compare(x, y) === 'LT' ? x : y
}

function max<A>(ord: Ord<A>, x: A, y: A): A {
  return ord.compare(x, y) === 'GT' ? y : x
}
```

# Monoidi

Se aggiungiamo una condizione in più alla definizione dei semigruppi, ovvero che esista un elemento `u` appartenente a `M` tale che per ogni elemento `m` di `M` vale

```
u * m = m * u = m
```

allora la terna `(M, *, u)` viene chiamata *monoide* e l'elemento `u` viene chiamato "unità" (sinonimi: "elemento neutro", "elemento identità").

**Nota**. L'unità di un monoide se esiste è unica.

*Dimostrazione*. Siano `u1` e `u2` due unità. allora

```
u1 * u2 = u1 (perchè u2 è unità destra)
u1 * u2 = u2 (perchè u1 è unità sinistra)

=> u1 = u2
```

Questa è la gerarchia algebrica alla quale appartengono i monoidi

```
(M, *) "magma", * è un'operazione "chiusa" (o "interna") su M ovvero *: M x M -> M

(S, *) "semigruppo", è un magma in cui * è associativa

(M, *, u) "monoide", è un semigruppo che ha un elemento identità, u * m = m * u = m per ogni m in M

(G, *, u) "gruppo", è un monoide che ammette elemento inverso per ogni m in M
```

(Esercizio) Molti dei semigruppi che abbiamo visto sono anche dei monoidi

- `(number, +, 0)`
- `(number, *, 1)`
- `(string, +, "")`
- `(boolean, &&, true)`
- `(boolean, ||, false)`

## Interfaccia

```ts
export interface Monoid<A> extends Semigroup<A> {
  empty(): A
}
```

Nota. Questa è la definizione di monoide in PureScript

```purescript
class Semigroup m <= Monoid m where
  mempty :: m
```

**Esercizio**. Definire una istanza di monoide (se possibile) per ogni semigruppo introdotto precedentemente.

## Controesempio

Esiste un esempio di un semigruppo che non è un monoide? Si, `NonEmptyArray<A>`

```ts
class NonEmptyArray<A> {
  head: A;
  tail: Array<A>;
  constructor(head: A, tail: Array<A>) {
    this.head = head
    this.tail = tail
  }
}

function getNonEmptyArraySemigroup<A>(): Semigroup<NonEmptyArray<A>> {
  return {
    concat: (x, y) => new NonEmptyArray(x.head, x.tail.concat(y.head).concat(y.tail))
  }
}

console.log(
  getNonEmptyArraySemigroup().concat(
    new NonEmptyArray(1, [2]),
    new NonEmptyArray(3, [4, 5])
  )
) // => (1, [2,3,4,5])
```

Ma non esiste nessun elemento `u: NonEmptyArray` che concatenato ad un altro `x: NonEmptyArray` dia ancora `x`.

## Monoidi come categorie

Un monoide `(M, *, u)` "assomiglia" ad una categoria

- c'è un'operazione che "compone" gli elementi
- l'operazione è associativa
- c'è il concetto di "identità"

La somiglianza non è casuale. Ad un monoide `(M, *, u)` può essere associata una categoria con un solo oggetto, i cui morfismi sono gli elementi di `M` e la cui operazione di composizione è `*`.

[Grafico]
<!--![monoid as category](http://yogsototh.github.com/Category-Theory-Presentation/categories/img/mp/monoid.png)-->

> Categories correspond to strongly typed languages, monoids to untyped languages - Bartosz Milewski

## `reduceLeft`

La funzione `reduce` che abbiamo visto per i semigruppi può essere usata per definire una nuova funzione che accetta monoidi

```ts
// notate che non c'è più bisogno di un elemento iniziale a: A
// perchè ora possiamo sfruttare monoid.empty()
function reduceLeft<A>(monoid: Monoid<A>, as: Array<A>): A {
  return reduce(monoid, monoid.empty(), as)
}

const stringMonoid: Monoid<string> = {
  empty: () => '',
  concat: stringSemigroup.concat
}

const multiplicationMonoid: Monoid<number> = {
  empty: () => 1,
  concat: multiplicationSemigroup.concat
}

console.log(reduceLeft(stringMonoid, ['a', 'b', 'c'])) // => 'abc'
console.log(reduceLeft(multiplicationMonoid, [2, 3, 4])) // => 24
console.log(reduceLeft(multiplicationMonoid, [])) // => 1
```

## Il monoide prodotto

```ts
function getProductMonoid<A, B>(monoidA: Monoid<A>, monoidB: Monoid<B>): Monoid<[A, B]> {
  return {
    empty: () => ([monoidA.empty(), monoidB.empty()]),
    concat: getProductSemigroup(monoidA, monoidB).concat
  }
}

console.log(
  reduceLeft(
    getProductMonoid(multiplicationMonoid, stringMonoid),
    [[2, 'a'], [3, 'b']]
  )
) // => [6, 'ab']

console.log(
  reduceLeft(
    getProductMonoid(multiplicationMonoid, stringMonoid),
    []
  )
) // => [1, '']
```

# Monoidi liberi (Free monoids)

Cosa succede se ho un insieme `X` al quale non posso associare facilmente un'istanza di monoide? Esiste un'operazione su `X` che produce in modo "automatico" un monoide? E se si, il monoide generato che caratteristiche ha?

Consideriamo come `X` l'insieme costituito dalle due stringhe `'a'` e `'b'` e come operazione `*` la giustapposizione:

```
*(a, b) = ab
```

Ovviamente quello che abbiamo non è un monoide: non c'è traccia di un elemento unità e appena applichiamo `*` "cadiamo fuori" dall'insieme `X`. Possiamo però costruire il seguente monoide `M(X)` che viene chiamato "monoide generato da `X`" o "monoide libero":

`M(X) = (Y, *, u)` ove

- `*` è l'operazione di giustapposizione
- `u` è un elemento speciale che fa da unità
- `Y = { u, a, b, ab, ba, aa, bb, aab, aba, ... }`

Attenzione: perchè valga la proprietà associativa dobbiamo anche identificare alcuni elementi generati, ad esempio `(aa)b = a(ab)`

Gli elementi di `X` vengono detti "elementi generatori" di `M(X)`.

Ora il colpo di scena, è possibile dimostrare che:

- `M(X)` è il "più piccolo" monoide che contiene `X` (il termine "libero" si usa quando sussiste questa proprietà)
- `M(X)` è *isomorfo* a `(Array<X>, concat, [])`
