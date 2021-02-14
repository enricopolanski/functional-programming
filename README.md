<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Che cos'è la programmazione funzionale](#che-cos%C3%A8-la-programmazione-funzionale)
- [I due pilastri della programmazione funzionale](#i-due-pilastri-della-programmazione-funzionale)
  - [Trasparenza referenziale](#trasparenza-referenziale)
  - [Composizione](#composizione)
- [Modellare la composizione con i semigruppi](#modellare-la-composizione-con-i-semigruppi)
  - [Definizione di magma](#definizione-di-magma)
  - [Definizione di semigruppo](#definizione-di-semigruppo)
  - [La funzione `concatAll`](#la-funzione-concatall)
  - [Il semigruppo duale](#il-semigruppo-duale)
  - [Non riesco a trovare una istanza!](#non-riesco-a-trovare-una-istanza)
  - [Semigruppo prodotto](#semigruppo-prodotto)
  - [Semigruppi derivabili da un ordinamento](#semigruppi-derivabili-da-un-ordinamento)
- [Modellare l'uguaglianza con `Eq`](#modellare-luguaglianza-con-eq)
- [Modellare l'ordinamento con `Ord`](#modellare-lordinamento-con-ord)
  - [L'ordinamento duale](#lordinamento-duale)
- [Modellare la composizione con i monoidi](#modellare-la-composizione-con-i-monoidi)
  - [La funzione `concatAll`](#la-funzione-concatall-1)
  - [Monoide prodotto](#monoide-prodotto)
- [Funzioni pure e funzioni parziali](#funzioni-pure-e-funzioni-parziali)
- [Algebraic Data Types](#algebraic-data-types)
  - [Che cos'è un algebraic Data Types?](#che-cos%C3%A8-un-algebraic-data-types)
  - [Product types](#product-types)
    - [Da dove viene il nome "product types"?](#da-dove-viene-il-nome-product-types)
    - [Quando posso usare un product type?](#quando-posso-usare-un-product-type)
  - [Sum types](#sum-types)
    - [Costruttori](#costruttori)
    - [Pattern matching](#pattern-matching)
    - [Da dove viene il nome "sum types"?](#da-dove-viene-il-nome-sum-types)
    - [Quando dovrei usare un sum type?](#quando-dovrei-usare-un-sum-type)
- [Functional error handling](#functional-error-handling)
  - [Il tipo `Option`](#il-tipo-option)
  - [Il tipo `Either`](#il-tipo-either)
- [Teoria delle categorie](#teoria-delle-categorie)
  - [Definizione](#definizione)
  - [Modellare i linguaggi di programmazione con le categorie](#modellare-i-linguaggi-di-programmazione-con-le-categorie)
  - [Una categoria per TypeScript](#una-categoria-per-typescript)
  - [Il problema centrale della composizione di funzioni](#il-problema-centrale-della-composizione-di-funzioni)
- [Funtori](#funtori)
  - [Funzioni come programmi](#funzioni-come-programmi)
  - [Un vincolo che conduce ai funtori](#un-vincolo-che-conduce-ai-funtori)
  - [I funtori compongono](#i-funtori-compongono)
  - [Funtori controvarianti](#funtori-controvarianti)
  - [Funtori in `fp-ts`](#funtori-in-fp-ts)
  - [I funtori risolvono il problema centrale?](#i-funtori-risolvono-il-problema-centrale)
- [Funtori applicativi](#funtori-applicativi)
  - [Currying](#currying)
  - [L'astrazione `Apply`](#lastrazione-apply)
  - [L'astrazione `Applicative`](#lastrazione-applicative)
  - [I funtori applicativi compongono](#i-funtori-applicativi-compongono)
  - [I funtori applicativi risolvono il problema centrale?](#i-funtori-applicativi-risolvono-il-problema-centrale)
- [Monadi](#monadi)
  - [Il problema dei contesti innestati](#il-problema-dei-contesti-innestati)
  - [Definizione di monade](#definizione-di-monade)
  - [La categoria di Kleisli](#la-categoria-di-kleisli)
  - [Definizione di `chain` passo dopo passo](#definizione-di-chain-passo-dopo-passo)
  - [Manipolazione di programmi](#manipolazione-di-programmi)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

**Setup**

```sh
git clone https://github.com/gcanti/functional-programming.git
cd functional-programming
npm i
```

# Che cos'è la programmazione funzionale

> Functional Programming is programming with pure functions. Mathematical functions.

Una rapida ricerca su internet vi può portare alla seguente definizione:

> Una funzione pura è una procedura che dato lo stesso input restituisce sempre lo stesso output e non ha alcun side effect osservabile.

Il termine "side effect" non ha ancora un significato preciso (vedremo in seguito come darne una definizione formale), ciò che conta per ora è averne una qualche intuizione, pensate per esempio ad aprire un file per leggerne il contenuto, oppure scrivere su un database.

Ma com'è strutturato un programma che usa solo funzioni pure?

Un programma in stile funzionale tende ad essere scritto come una **pipeline**:

```ts
const program = pipe(
  input,
  f1, // funzione pura
  f2, // funzione pura
  f3, // funzione pura
  ...
)
```

Ciò che accade è che `input` viene passato come input alla prima funzione `f1`, la quale restituisce un valore in output che viene passato come input alla seconda funzione `f2`, la quale restituisce un valore in output che viene passato come input alla terza funzione `f3`, e così di seguito.

**Demo**

[`00_pipe_and_flow.ts`](src/00_pipe_and_flow.ts)

Vedremo come la programmazione funzionale ci fornisce i mezzi per strutturare il nostro codice in questo stile.

Oltre a capire cosa sia la programmazione funzionale, è altrettanto fondamentale capire quale sia il suo scopo.

L'obbiettivo della programmazione funzionale è **dominare la complessità di un sistema** usando modelli formali e ponendo particolare attenzione alle **proprietà del codice** e alla facilità di refactoring.

> Functional programming will help teach people the mathematics behind program construction:
> - how to write composable code
> - how to reason about side effects
> - how to write consistent, general, less ad-hoc APIs

Che vuol dire porre attenzione alle proprietà del codice? Vediamo un esempio

**Esempio**

Perché possiamo dire che la funzione `map` di `Array` è "più funzionale" di un ciclo `for`?

```ts
// input
const xs: Array<number> = [1, 2, 3]

// trasformazione
const double = (n: number): number => n * 2

// risultato: voglio un array con tutti gli elementi di `xs` raddoppiati
const ys: Array<number> = []
for (let i = 0; i < xs.length; i++) {
  ys.push(double(xs[i]))
}
```

Un ciclo `for` è molto flessibile, posso modificare:

- l'indice di partenza
- la condizione di fine
- il passo

Ma ciò vuol dire anche che ci sono più possibilità di introdurre **errori** e non ho alcuna **garanzia sul risultato**.

**Quiz**. Avete controllato che io abbia scritto bene il ciclo?

Vediamo ora come si utilizza `map`

```ts
// risultato: voglio un array con tutti gli elementi di `xs` raddoppiati
const ys = xs.map(double)
```

Notate come `map` sia meno flessibile, tuttavia dà più garanzie:

- gli elementi dell'input verrano processati tutti dal primo all'ultimo
- qualunque sia l'operazione che viene fatta nella callback, il risultato sarà sempre un array con lo stesso numero di elementi
dell'array in input

Dal punto di vista funzionale, ambito in cui sono importanti le proprietà del codice piuttosto che i dettagli implementativi, l'operazione `map` è interessante **proprio in quanto limitata**.

Pensate per esempio a quanto sia più facile la review di una PR che coinvolga una `map` rispetto ad un ciclo `for`.

# I due pilastri della programmazione funzionale

La programmazione funzionale si appoggia a questi due pilastri:

- trasparenza referenziale
- composizione come design pattern universale

Tutto ciò che vedremo in seguito nel corso deriva direttamente o indirettamente da questi due punti.

Incominciamo dalla trasparenza referenziale.

## Trasparenza referenziale

> **Definition**. An **expression** is said to be _referentially transparent_ if it can be replaced with its corresponding value without changing the program's behavior

**Esempio** (la trasparenza referenziale implica l'uso di funzioni pure)

```ts
const double = (n: number): number => n * 2

const x = double(2)
const y = double(2)
```

L'espressione `double(2)` gode della proprietà di trasparenza referenziale perché posso sostituirla con il suo valore `4`.

Posso perciò tranquillamente procedere con il seguente refactoring

```ts
const x = 4
const y = x
```

Non tutte le espressioni godono della proprietà di trasparenza referenziale, vediamo qualche esempio

**Esempio** (la trasparenza referenziale implica non lanciare eccezioni)

```ts
const inverse = (n: number): number => {
  if (n === 0) throw new Error('cannot divide by zero')
  return 1 / n
}

const x = inverse(0) + 1
```

Non posso sostituire l'espressione `inverse(0)` con il suo valore, perciò l'espressione non gode della proprietà di trasparenza referenziale.

**Esempio** (la trasparenza referenziale implica l'utilizzo di strutture dati immutabili)

```ts
const xs = [1, 2, 3]

const append = (xs: Array<number>): void => {
  xs.push(4)
}

append(xs)

const ys = xs
```

Nell'ultima riga non posso sostituire l'espressione `xs` con il suo valore iniziale `[1, 2, 3]` dato che il suo valore attuale è stato cambiato dalla chiamata alla funzione `append`.

Perché è così importante la trasparenza referenziale? Perché permette di:

- **ragionare localmente** sul codice (ovvero non ho bisogno di conoscere un contesto più ampio per capire un frammento di codice)
- **rifattorizzare** senza cambiare il comportamento del programma (per la definizione stessa di trasparenza referenziale)

**Quiz**. Supponiamo di avere il seguente programma:

```ts
// In TypeScript `declare` permette di introdurre una definizione senza specificarne l'implementazione.
declare const question: (message: string) => Promise<string>

const x = await question('What is your name?')
const y = await question('What is your name?')
```

Posso rifattorizzarlo in questo modo? Il comportamento del programma è lo stesso o è cambiato?

```ts
const x = await question('What is your name?')
const y = x
```

Come potete vedere il refactoring di un programma che contiene espressioni che non godono della proprietà di trasparenza referenziale va affontato con molta cautela. Nella programmazione funzionale, ove ogni espressione gode della proprietà di trasparenza referenziale, il carico cognitivo in fase di refactoring è ridotto.

Parliamo ora del secondo pilastro, la composizione.

## Composizione

Il pattern fondamentale della programmazione funzionale è la _componibilità_, ovvero la costruzione di piccole unità
che fanno qualcosa di specifico in grado di essere combinate tra loro al fine di ottenere entità più grandi e complesse.

Come esempi, e in un percorso dal "più piccolo al più grande", possiamo pensare:

- alla composizione di due semplici valori (come due numeri o due stringhe)
- oppure alla composizione di funzioni
- o anche alla composizione di interi programmi

In questo ultimo caso possiamo parlare di "programmazione modulare":

> By modular programming I mean the process of building large programs by gluing together smaller programs - Simon Peyton Jones

Vediamo nella pratica come è possibile tendere verso questo stile di programmazione attraverso l'uso di quelli che vengono chiamati combinatori.

Il termine **combinatore** si riferisce al [combinator pattern](https://wiki.haskell.org/Combinator):

> A style of organizing libraries centered around the idea of combining things. Usually there is some type `T`, some "primitive" values of type `T`, and some "combinators" which can combine values of type `T` in various ways to build up more complex values of type `T`

Il concetto di combinatore è piuttosto sfumato e si può presentare in diverse forme, ma la sua forma più semplice è questa:

```ts
combinator: Thing -> Thing
```

**Esempio**. Possiamo pensare alla funzione `double` come ad un combinatore di numeri.

Lo scopo di un combinatore è quello di creare nuove "cose" da "cose" definite precedentemente.

Notate che il risultato del combinatore può essere nuovamente passato come input, si ottiene perciò una esplosione combinatoria di possibilità, il che rende questo pattern molto potente.

**Esempio**

```ts
import { pipe } from 'fp-ts/function'

const double = (n: number): number => n * 2

console.log(pipe(2, double, double, double)) // => 16
```

Perciò il design generale che potete spesso trovare in un modulo funzionale è questo:

- un modello per `T`
- un insieme di semplici "primitive" di tipo `T`
- un insieme di combinatori per combinare le primitive in strutture più complesse

Proviamo ad implementare un modulo di questo tipo:

**Demo**

[`01_retry.ts`](src/01_retry.ts)

Come potete vedere dalla demo precedente, con sole tre primitive e due combinatori siamo stati in grado di esprimere una policy piuttosto complessa.

Pensate a come, aggiungendo anche una sola nuova primitiva (o un nuovo combinatore) a quelli già definiti, le possibilità espressive aumentano esponenzialmente.

Dei due combinatori definiti in `01_retry.ts` una menzione speciale va a `concat` dato che è possibile collegarlo ad una importante astrazione della programmazione funzionale: i semigruppi.

# Modellare la composizione con i semigruppi

Un semigruppo è una ricetta per combinare due (o più) valori.

Tecnicamente un semigruppo è un'algebra, in generale con il termine "algebra" si intende una particolare combinazione di:

- uno o più insiemi
- una o più operazioni sugli insiemi precedenti
- una o più leggi a cui devono obbedire le operazioni precedenti

Le algebre sono il modo in cui i matematici catturano un concetto nel modo più diretto eliminando tutto ciò che è superfluo.

> Quando si manipola un'algebra sono permesse solo le operazioni definite dall'algebra stessa e in conformità alle sue leggi

L'equivalente delle algebre in programmazione sono le **interfacce**:

> Quando si manipola una interfaccia sono permesse solo le operazioni definite dall'interfaccia stessa e in conformità alle sue leggi.

Prima di affrontare i semigruppi vediamo un primo semplice esempio di algebra che li precede: il magma.

## Definizione di magma

Possiamo usare una `interface` di TypeScript per modellare un magma:

```ts
interface Magma<A> {
  readonly concat: (y: A) => (x: A) => A
}
```

Abbiamo quindi un'operazione `concat` che prende due valori di un certo tipo `A` e restituisce un nuovo valore dello stesso tipo (proprietà di chiusura). Dato che il risultato può a sua volta essere utilizzato come input l'operazione può essere ripetuta a piacimento. In altre parole `concat` è un [combinatore](#composizione) per il tipo `A`.

**Quiz**. Il fatto che una operazione sia chiusa non è una proprietà banale, potete fare un esempio di operazione sui numeri naturali (ovvero i numeri interi positivi) per cui la proprietà di chiusura non vale?

Per avere una istanza concreta di magma per un determinato tipo occorre perciò definire un oggetto conforme a questa interfaccia.

**Esempio** (una istanza di `Magma` per il tipo `number`)

```ts
import { Magma } from 'fp-ts/Magma'

const MagmaSub: Magma<number> = {
  concat: (y) => (x) => x - y
}

// esempio di utilizzo

import { pipe } from 'fp-ts/function'

console.log(
  pipe(
    10,
    MagmaSub.concat(2),
    MagmaSub.concat(3),
    MagmaSub.concat(1),
    MagmaSub.concat(2)
  )
) // => 2
```

Notate che la definizione di `concat` è stata concepita per agevolarne l'uso con `pipe`.

**Quiz**. Consideriamo la seguente funzione che trasforma una lista in un dizionario, perché si richiede un `Magma` come parametro?

```ts
import { Magma } from 'fp-ts/Magma'

declare const fromReadonlyArray: <A>(
  M: Magma<A>
) => (as: ReadonlyArray<readonly [string, A]>) => Record<string, A>

// esempio di utilizzo

const MagmaSub: Magma<number> = {
  concat: (y) => (x) => x - y
}

console.log(
  fromReadonlyArray(MagmaSub)([
    ['a', 1],
    ['b', 2]
  ])
) // => { a: 1, b: 2 }
console.log(
  fromReadonlyArray(MagmaSub)([
    ['a', 1],
    ['b', 2],
    ['a', 3]
  ])
) // => { a: -2, b: 2 }
```

Un `Magma<A>` è un'algebra molto semplice:

- un insieme (`A`)
- una operazione (`concat`)
- nessuna legge

vediamo ora un'algebra che definisce una legge: i semigruppi.

## Definizione di semigruppo

Se l'operazione `concat` di un `Magma` è anche **associativa** allora parliamo di semigruppo.

Un'operazione binaria `*` si dice "associativa" se vale:

```ts
(x * y) * z = x * (y * z)
```

per ogni `x`, `y`, `z`.

L'associatività ci dice che non dobbiamo preoccuparci delle parentesi nelle espressioni e che, volendo, possiamo scrivere semplicemente `x * y * z` (non c'è ambiguità).

**Esempio**

La concatenazione di stringhe (`+`) gode della proprietà associativa.

```ts
("a" + "b") + "c" = "a" + ("b" + "c") = "abc"
```

Ogni semigruppo è un magma, ma non ogni magma è un semigruppo.

<center>
<img src="images/semigroup.png" width="300" alt="Magma vs Semigroup" />
</center>

**Esempio**

Il magma `MagmaSub` che abbiamo visto nella sezione precedente non è un semigruppo poiché la sua operazione `concat` non è associativa:

```ts
import { pipe } from 'fp-ts/function'
import { Magma } from 'fp-ts/Magma'

const MagmaSub: Magma<number> = {
  concat: (second) => (first) => first - second
}

const lhs = pipe(1, MagmaSub.concat(2), MagmaSub.concat(3))
const rhs = pipe(1, MagmaSub.concat(pipe(2, MagmaSub.concat(3))))

console.log(lhs) // => -4
console.log(rhs) // => 2
```

I semigruppi catturano l'essenza delle operazioni parallelizzabili.

Infatti se sappiamo che una data operazione `*` gode della proprietà associativa possiamo suddividere una computazione in due sotto computazioni, ognuna delle quali può essere ulteriormente suddivisa

```ts
a * b * c * d * e * f * g * h = ((a * b) * (c * d)) * ((e * f) * (g * h))
```

Le sotto computazioni possono essere distribuite ed eseguite parallelamente per poi raccoglierne i risultati parziali e comporre il risultato finale.

Come già successo per `Magma`, i semigruppi possono essere modellati con una `interface` di TypeScript:

```ts
interface Semigroup<A> {
  readonly concat: (second: A) => (first: A) => A
}
```

Come vedete la definizione è identica a quella di `Magma` ma c'è una differenza importante, deve valere la seguente legge (che purtroppo non può essere codificata nel type system di TypeScript):

**Associativity**

```ts
(x |> concat(y)) |> concat(z) = x |> concat(y |> concat(z))
```

per ogni `x`, `y`, `z` in `A`

**Esempio**

Implementiamo un semigruppo per `ReadonlyArray<string>`

```ts
import * as Se from 'fp-ts/Semigroup'

const Semigroup: Se.Semigroup<ReadonlyArray<string>> = {
  concat: (second) => (first) => first.concat(second)
}
```

Come potete vedere il nome `concat` ha particolarmente senso per i `ReadonlyArray` ma, in base al contesto e al tipo `A` per il quale stiamo implementando una istanza, l'operazione di semigruppo `concat` può essere interpretata con diversi significati:

- "concatenare"
- "combinare"
- "merging"
- "fondere"
- "selezionare"
- "sommare"
- "sostituire"

e altri ancora.

**Esempio**

Ecco come implementare il semigruppo `(number, +)` dove `+` è l'usuale addizione di numeri:

```ts
import * as Se from 'fp-ts/Semigroup'

/** number `Semigroup` under addition */
const SemigroupSum: Se.Semigroup<number> = {
  concat: (second) => (first) => first + second
}
```

**Quiz**. Il combinatore `concat` definito nella demo [`01_retry.ts`](src/01_retry.ts) può essere utilizzato per definire una istanza di `Semigroup` per il tipo `RetryPolicy`?

Si noti che, fissato un tipo, si possono definire **molteplici istanze** dell'interfaccia `Semigroup`.

Per esempio, considerando ancora il tipo `number`, possiamo definire il semigruppo `(number, *)` dove `*` è l'usuale moltiplicazione di numeri:

```ts
import * as Se from 'fp-ts/Semigroup'

/** number `Semigroup` under multiplication */
const SemigroupProduct: Se.Semigroup<number> = {
  concat: (second) => (first) => first * second
}
```

Un'altro esempio, con le stringhe questa volta:

```ts
import * as Se from 'fp-ts/Semigroup'

const SemigroupString: Se.Semigroup<string> = {
  concat: (second) => (first) => first + second
}
```

E ancora altri due esempi, con `boolean`:

```ts
import * as Se from 'fp-ts/Semigroup'

const SemigroupAll: Se.Semigroup<boolean> = {
  concat: (second) => (first) => first && second
}

const SemigroupAny: Se.Semigroup<boolean> = {
  concat: (second) => (first) => first || second
}
```

## La funzione `concatAll`

Per definizione `concat` combina solo due elementi di `A` alla volta, è possibile combinare più elementi?

La funzione `concatAll` prende in input una istanza di semigruppo, un valore iniziale e un array di elementi da combinare:

```ts
import * as Se from 'fp-ts/Semigroup'
import * as N from 'fp-ts/number'

const sum = Se.concatAll(N.SemigroupSum)(2)

console.log(sum([1, 2, 3, 4])) // => 12

const product = Se.concatAll(N.SemigroupProduct)(3)

console.log(product([1, 2, 3, 4])) // => 72
```

**Quiz**. Perché ho bisogno di un valore iniziale?

**Esempio**

Come altri esempi di applicazione di `concatAll`, possiamo reimplementare alcune popolari funzioni della standard library di JavaScript:

```ts
import * as B from 'fp-ts/boolean'
import * as Se from 'fp-ts/Semigroup'

const every = <A>(predicate: (a: A) => boolean) => (
  as: ReadonlyArray<A>
): boolean => Se.concatAll(B.SemigroupAll)(true)(as.map(predicate))

const some = <A>(predicate: (a: A) => boolean) => (
  as: ReadonlyArray<A>
): boolean => Se.concatAll(B.SemigroupAny)(false)(as.map(predicate))

const assign: (as: ReadonlyArray<object>) => object = Se.concatAll(
  Se.object<object>()
)({})
```

**Quiz**. La seguente istanza è "legale" (ovvero rispetta le leggi dei semigruppi)?

```ts
import * as Se from 'fp-ts/Semigroup'

/** Always return the first argument */
const first = <A>(): Se.Semigroup<A> => ({
  concat: () => (a) => a
})
```

**Quiz**. La seguente istanza è legale?

```ts
import * as Se from 'fp-ts/Semigroup'

/** Always return the second argument */
const last = <A>(): Se.Semigroup<A> => ({
  concat: (a) => () => a
})
```

## Il semigruppo duale

Data una istanza di semigruppo, è possibile ricavarne un'altra semplicemente scambiando l'ordine in cui sono combinati gli elementi:

```ts
import { pipe } from 'fp-ts/function'
import * as Se from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'

// questo è un combinatore di semigruppi...
const reverse = <A>(S: Se.Semigroup<A>): Se.Semigroup<A> => ({
  concat: (second) => (first) => pipe(second, S.concat(first))
})

console.log(pipe('a', S.Semigroup.concat('b'))) // => 'ab'
console.log(pipe('a', reverse(S.Semigroup).concat('b'))) // => 'ba'
```

**Quiz**. Questo combinatore ha senso perché in generale l'operazione `concat` non è **commutativa**, ovvero non è detto che valga sempre `x |> concat(y) = y |> concat(x)`, potete portare un esempio in cui `concat` non è commutativa? E uno in cui è commutativa?

## Non riesco a trovare una istanza!

Cosa accade se, dato un particolare tipo `A`, non si riesce a trovare una operazione associativa su `A`?

Potete **sempre** definire una istanza di semigruppo per un **qualsiasi** tipo costruendo una istanza di semigruppo non per `A` ma per `ReadonlyNonEmptyArray<A>` chiamata il **semigruppo libero** di `A`

```ts
import * as Se from 'fp-ts/Semigroup'

type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & {
  readonly 0: A
}

const getSemigroup = <A>(): Se.Semigroup<ReadonlyNonEmptyArray<A>> => ({
  concat: (second) => (first) => [first[0], ...first.slice(1), ...second]
})
```

e poi mappare gli elementi di `A` ai "singoletti" di `ReadonlyNonEmptyArray<A>`, ovvero un array con un solo elemento:

```ts
const of = <A>(a: A): ReadonlyNonEmptyArray<A> => [a]
```

Il semigruppo libero di `A` quindi non è altro che il semigruppo in cui gli elementi sono tutte le possibili sequenze finite e non vuote di elementi di `A`.

Il semigruppo libero di `A` può essere visto come un modo *lazy* di concatenare elementi di `A`, mantenendo in tal modo tutto il contenuto informativo.

**Esempio**

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray'
import * as Se from 'fp-ts/Semigroup'

// eseguo subito la concatenazione di 1, 2, 3
console.log(pipe(1, N.SemigroupSum.concat(2), N.SemigroupSum.concat(3))) // => 6

// impacchetto 1, 2, 3 in un ReadonlyNonEmptyArray...
const as: ReadonlyNonEmptyArray<number> = [1, 2, 3]

// ...ed eseguo la concatenazione solo in un secondo momento
console.log(Se.concatAll(N.SemigroupSum)(0)(as)) // => 6
```

Anche se ho a disposizione una istanza di semigruppo per `A`, potrei decidere di usare ugualmente il suo semigruppo libero perché:

- evita di eseguire computazioni possibilmente inutili
- evita di passare in giro l'istanza di semigruppo
- permette al consumer delle mie API di stabilire la strategia di merging

## Semigruppo prodotto

Proviamo a definire delle istanze di semigruppo per tipi più complessi:

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as Se from 'fp-ts/Semigroup'

// modella un vettore che parte dall'origine
type Vector = {
  readonly x: number
  readonly y: number
}

// modella la somma di due vettori
const SemigroupVector: Se.Semigroup<Vector> = {
  concat: (second) => (first) => ({
    x: pipe(first.x, N.SemigroupSum.concat(second.x)),
    y: pipe(first.y, N.SemigroupSum.concat(second.y))
  })
}
```

**Esempio**

```ts
const v1: Vector = { x: 1, y: 1 }
const v2: Vector = { x: 1, y: 2 }

console.log(pipe(v1, SemigroupVector.concat(v2))) // => { x: 2, y: 3 }
```

<center>
<img src="images/semigroupVector.png" width="300" alt="SemigroupVector" />
</center>

Troppo boilerplate? La buona notizia è che **la teoria matematica** che sta dietro al concetto di semigruppo ci dice che possiamo costruire una istanza di semigruppo per una struct come `Vector` se siamo in grado di fornire una istanza di semigruppo per ogni suo campo.

Convenientemente il modulo `fp-ts/Semigroup` esporta una combinatore `struct`:

```ts
// modella la somma di due vettori
const SemigroupVector: Se.Semigroup<Vector> = Se.struct({
  x: N.SemigroupSum,
  y: N.SemigroupSum
})
```

**Nota**. Esiste un combinatore simile a `struct` ma che lavora con le tuple: `tuple`

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as Se from 'fp-ts/Semigroup'

// modella un vettore che parte dall'origine
type Vector = readonly [number, number]

// modella la somma di due vettori
const SemigroupVector: Se.Semigroup<Vector> = Se.tuple(
  N.SemigroupSum,
  N.SemigroupSum
)

const v1: Vector = [1, 1]
const v2: Vector = [1, 2]

console.log(pipe(v1, SemigroupVector.concat(v2))) // => [2, 3]
```

**Quiz**. E' vero che dato un semigruppo per `A` e scelto un qualsiasi elemento `middle` di `A`, se lo infilo tra i due parametri di `concat`, ottengo ancora un semigruppo?

```ts
import { pipe } from 'fp-ts/function'
import * as Se from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'

export const intercalate = <A>(middle: A) => (
  S: Se.Semigroup<A>
): Se.Semigroup<A> => ({
  concat: (second) => (first) => pipe(first, S.concat(middle), S.concat(second))
})

const SemigroupIntercalate = pipe(S.Semigroup, intercalate('|'))

console.log(
  pipe('a', SemigroupIntercalate.concat('b'), SemigroupIntercalate.concat('c'))
) // => 'a|b|c'
```

## Semigruppi derivabili da un ordinamento

Dato che `number` è **totalmente ordinabile** (ovvero dati due qualsiasi numeri `x` e `y`, una tra le seguenti condizioni vale: `x <= y` oppure `y <= x`) possiamo definire due sue ulteriori istanze di semigruppo usando `min` e `max` come operazioni:

```ts
import * as Se from 'fp-ts/Semigroup'

const SemigroupMin: Se.Semigroup<number> = {
  concat: (second) => (first) => Math.min(first, second)
}

const SemigroupMax: Se.Semigroup<number> = {
  concat: (second) => (first) => Math.max(first, second)
}
```

**Quiz**. Perché è importante che `number` sia *totalmente* ordinabile?

Sarebbe utile poter definire questi due semigruppi (`SemigroupMin` e `SemigroupMax`) anche per altri tipi oltre a `number`.

È possibile catturare la nozione di totalmente ordinabile per altri tipi? Per farlo dobbiamo prima di tutto catturare la nozione di *uguaglianza*.

# Modellare l'uguaglianza con `Eq`

Ancora una volta possiamo modellare la nozione di uguaglianza tramite una `interface` di TypeScript:

```ts
interface Eq<A> {
  readonly equals: (second: A) => (first: A) => boolean
}
```

Intuitivamente:

- se `x |> equals(y)` è uguale a `true` allora diciamo che `x` e `y` sono uguali
- se `x |> equals(y)` è uguale a `false` allora diciamo che `x` e `y` sono diversi

**Esempio**

Proviamo a definire una istanza di `Eq` per il tipo `number`:

```ts
import * as E from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'

const EqNumber: E.Eq<number> = {
  equals: (second) => (first) => first === second
}

console.log(pipe(1, EqNumber.equals(1))) // => true
console.log(pipe(1, EqNumber.equals(2))) // => false
```

Devono valere le seguenti leggi:

1. **Reflexivity**: `a |> equals(a) === true`, per ogni `a` in `A`
2. **Symmetry**: `a |> equals(b) === b |> equals(a)`, per ogni `a`, `b` in `A`
3. **Transitivity**: se `a |> equals(b) === true` e `b |> equals(c) === true`, allora `a |> equals(c) === true`, per ogni `a`, `b`, `c` in `A`

**Esempio**

Come primo esempio di utilizzo dell'astrazione `Eq` definiamo una funzione `elem` che indica se un dato valore è un elemento di un `ReadonlyArray`:

```ts
import * as E from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'

// restituisce `true` se l'elemento `a` compare nella lista `as`
const elem = <A>(E: E.Eq<A>) => (a: A) => (as: ReadonlyArray<A>): boolean =>
  as.some(E.equals(a))

console.log(pipe([1, 2, 3], elem(N.Eq)(2))) // => true
console.log(pipe([1, 2, 3], elem(N.Eq)(4))) // => false
```

Ma perché non usare il metodo nativo `includes` degli array?

```ts
console.log([1, 2, 3].includes(2)) // => true
console.log([1, 2, 3].includes(4)) // => false
```

Per avere una risposta proviamo a definire una istanza per un tipo più complesso:

```ts
import * as E from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'

type Point = {
  readonly x: number
  readonly y: number
}

const EqPoint: E.Eq<Point> = {
  equals: (second) => (first) => first.x === second.x && first.y === second.y
}

console.log(pipe({ x: 1, y: 2 }, EqPoint.equals({ x: 1, y: 2 }))) // => true
console.log(pipe({ x: 1, y: 2 }, EqPoint.equals({ x: 1, y: -2 }))) // => false
```

e utilizzare fianco a fianco `elem` e `includes`

```ts
const points = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 2 }
]

console.log(points.includes({ x: 1, y: 1 })) // => false :(
console.log(pipe(points, elem(EqPoint)({ x: 1, y: 1 }))) // => true :)
```

**Quiz** (JavaScript). Come mai usando `includes` ottengo `false`?

Aver catturato il concetto di uguaglianza è fondamentale, soprattutto in un linguaggio come JavaScript in cui alcune strutture dati possiedono delle API poco usabili rispetto ad un concetto di uguaglianza custom. E' anche il caso di `Set` per esempio:

```ts
type Point = {
  readonly x: number
  readonly y: number
}

const points: Set<Point> = new Set([{ x: 0, y: 0 }])

points.add({ x: 0, y: 0 })

console.log(points)
// => Set { { x: 0, y: 0 }, { x: 0, y: 0 } }
```

Dato che `Set` utilizza `===` ("strict equality") come concetto di uguaglianza (fisso), `points` ora contiene **due copie identiche** di `{ x: 0, y: 0 }`, un risultato certo non voluto. Conviene perciò definire una nuova API che sfrutti l'astrazione `Eq`.

**Quiz**. Che firma potrebbe avere questa nuova API?

Per definire `EqPoint` occorre troppo boilerplate? La buona notizia è che la teoria ci dice che possiamo costruire una istanza di `Eq` per una struct come `Point` se siamo in grado di fornire una istanza di `Eq` per ogni suo campo.

Convenientemente il modulo `fp-ts/Eq` esporta un combinatore `struct`:

```ts
import * as N from 'fp-ts/number'

const EqPoint: E.Eq<Point> = E.struct({
  x: N.Eq,
  y: N.Eq
})
```

**Nota**. Esiste un combinatore simile a `struct` ma che lavora con le tuple: `tuple`

```ts
import * as E from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'

type Point = readonly [number, number]

const EqPoint: E.Eq<Point> = E.tuple(N.Eq, N.Eq)

console.log(pipe([1, 2], EqPoint.equals([1, 2]))) // => true
console.log(pipe([1, 2], EqPoint.equals([1, -2]))) // => false
```

Ci sono altri combinatori messi a disposizione da `fp-ts`, ecco un combinatore che permette di derivare una istanza di `Eq` per i `ReadonlyArray`:

```ts
import * as RA from 'fp-ts/ReadonlyArray'

const EqPoints: E.Eq<ReadonlyArray<Point>> = RA.getEq(EqPoint)
```

Come succede con i semigrouppi, potete definire più di una istanza di `Eq` per lo stesso tipo. Supponiamo di aver modellato un utente con il seguente tipo

```ts
type User = {
  readonly id: number
  readonly name: string
}
```

possiamo definire una istanza di `Eq` "standard" usando il combinatore `struct`:

```ts
import * as E from 'fp-ts/Eq'
import * as N from 'fp-ts/number'
import * as S from 'fp-ts/string'

type User = {
  readonly id: number
  readonly name: string
}

const EqStandard: E.Eq<User> = E.struct({
  id: N.Eq,
  name: S.Eq
})
```

**Nota**. In un linguaggio come Haskell l'istanza di `Eq` standard per una struct come `User` può essere prodotta automaticamente dal compilatore.

```haskell
data User = User Int String
     deriving (Eq)
```

Potremmo però avere delle situazioni particolari in cui ci può interessare avere un tipo di uguaglianza tra utenti differente, per esempio potremmo considerare due utenti uguali se hanno il campo `id` uguale

```ts
/** due utenti sono uguali se sono uguali il loro campi `id` */
const EqID: E.Eq<User> = {
  equals: (second) => (first) => N.Eq.equals(second.id)(first.id)
}
```

Avendo "reificato" l'azione di confrontare due valori, cioè l'abbiamo resa concreta rappresentandola come una struttura dati, possiamo **manipolare programmaticamente** le istanze di `Eq` come facciamo per altre strutture dati, vediamo un esempio.

**Esempio**. Invece di definire `EqId` "a mano", possiamo utilizzare l'utile combinatore `contramap`: data una istanza di `Eq` per `A` e una funzione da `B` ad `A`, possiamo derivare una istanza di `Eq` per `B`

```ts
import * as E from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as S from 'fp-ts/string'

type User = {
  readonly id: number
  readonly name: string
}

const EqStandard: E.Eq<User> = E.struct({
  id: N.Eq,
  name: S.Eq
})

const EqID: E.Eq<User> = pipe(
  N.Eq,
  E.contramap((_: User) => _.id)
)

console.log(
  pipe(
    { id: 1, name: 'Giulio' },
    EqStandard.equals({ id: 1, name: 'Giulio Canti' })
  )
) // => false (le proprietà `name` sono diverse)

console.log(
  pipe({ id: 1, name: 'Giulio' }, EqID.equals({ id: 1, name: 'Giulio Canti' }))
) // => true (nonostante le proprietà `name` siano diverse)

console.log(
  pipe({ id: 1, name: 'Giulio' }, EqID.equals({ id: 2, name: 'Giulio' }))
) // => false (nonostante le proprietà `name` siano uguali)
```

**Quiz**. Dato un tipo `A`, è possibile definire una istanza di semigruppo per `Eq<A>`? Cosa potrebbe rappresentare?

# Modellare l'ordinamento con `Ord`

Ora che abbiamo modellato il concetto di uguaglianza, vediamo in questo capitolo come modellare il concetto di **ordinamento**.

Una relazione d'ordine totale può essere modellata in TypeScript con i seguenti tipi:

```ts
import * as E from 'fp-ts/Eq'

type Ordering = -1 | 0 | 1

interface Ord<A> extends E.Eq<A> {
  readonly compare: (second: A) => (first: A) => Ordering
}
```

Intuitivamente:

- `x < y` se e solo se `x |> compare(y) = -1`
- `x = y` se e solo se `x |> compare(y) = 0`
- `x > y` se e solo se `x |> compare(y) = 1`

**Esempio**

Proviamo a definire una istanza di `Ord` per il tipo `number`:

```ts
import * as O from 'fp-ts/Ord'

const OrdNumber: O.Ord<number> = {
  equals: (second) => (first) => first === second,
  compare: (second) => (first) => (first < second ? -1 : first > second ? 1 : 0)
}
```

Devono valere le seguenti leggi:

1. **Reflexivity**: `x |> compare(x) <= 0`, per ogni `x` in `A`
2. **Antisymmetry**: se `x |> compare(y) <= 0` e `compare(y, x) <= 0` allora `x = y`, per ogni `x`, `y` in `A`
3. **Transitivity**: se `x |> compare(y) <= 0` e `compare(y, z) <= 0` allora `compare(x, z) <= 0`, per ogni `x`, `y`, `z` in `A`

In più `compare` deve essere compatibile con l'operazione `equals` di `Eq`:

`x |> compare(y) === 0` se e solo se `x |> equals(y) === true`, per ogni `x`, `y` in `A`

**Nota**. `equals` può essere derivato da `compare` nel modo seguente

```ts
equals: (second) => (first) => pipe(first, compare(second)) === 0
```

Perciò il modulo `fp-ts/Ord` esporta un comodo helper `fromCompare` che permette di definire una istanza di `Ord` semplicemente specificando la funzione `compare`:

```ts
import * as O from 'fp-ts/Ord'

const OrdNumber: O.Ord<number> = O.fromCompare((second) => (first) =>
  first < second ? -1 : first > second ? 1 : 0
)
```

**Quiz**. E' possibile definire un ordinamento per il gioco Sasso-Carta-Forbice compatibile con le mosse vincenti (ovvero `move1 <= move2` se `move2` batte `move1`)?

Come primo esempio di utilizzo definiamo una funzione `sort` che ordina gli elementi di un `ReadonlyArray`

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Ord'

export const sort = <A>(OA: O.Ord<A>) => (
  as: ReadonlyArray<A>
): ReadonlyArray<A> => as.slice().sort((a, b) => pipe(a, OA.compare(b)))

console.log(pipe([1, 2, 3], sort(N.Ord))) // => [1, 2, 3]
```

**Quiz** (JavaScript). Perché nell'implementazione viene chiamato il metodo `slice`?

Come altro esempio di utilizzo definiamo una funzione `min` che restituisce il minimo fra due valori:

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Ord'

const min = <A>(O: O.Ord<A>) => (second: A) => (first: A): A =>
  pipe(first, O.compare(second)) === 1 ? second : first

console.log(pipe(2, min(N.Ord)(1))) // => 1
```

## L'ordinamento duale

Così come possiamo invertire l'operazione `concat` per ottenere il semigruppo duale (con il combinatore [`reverse`](#il-semigruppo-duale)), così anche l'operazione `compare` può essere invertita per ottenere l'ordinamento duale.

Definiamo perciò il combinatore `reverse` per `Ord`:

```ts
import { pipe } from 'fp-ts/function'
import * as Or from 'fp-ts/Ord'

export const reverse = <A>(O: Or.Ord<A>): Or.Ord<A> =>
  Or.fromCompare((second) => (first) => pipe(second, O.compare(first)))
```

Come esempio di utilizzo di `reverse` possiamo ricavare la funzione `max` dalla funzione `min`:

```ts
import { flow, pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as Or from 'fp-ts/Ord'

// const max: <A>(O: Or.Ord<A>) => (second: A) => (first: A) => A
const max = flow(Or.reverse, Or.min)

console.log(pipe(2, max(N.Ord)(1))) // => 2
```

La **totalità** dell'ordinamento (ovvero dati due qualsiasi `x` e `y`, una tra le seguenti condizioni vale: `x <= y` oppure `y <= x`) può sembrare ovvia quando parliamo di numeri, ma non è sempre così. Consideriamo un caso più complesso

```ts
type User = {
  readonly name: string
  readonly age: number
}
```

Non è così chiaro stabilire quando un utente "è minore o uguale" ad un altro utente.

Come possiamo definire un `Ord<User>`?

Dipende davvero dal contesto, ma una possibile scelta potrebbe essere quella per esempio di ordinare gli utenti a seconda della loro età:

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Ord'
import * as N from 'fp-ts/number'

type User = {
  readonly name: string
  readonly age: number
}

const byAge: O.Ord<User> = O.fromCompare((second) => (first) =>
  pipe(first.age, N.Ord.compare(second.age))
)
```

Possiamo eliminare un po' di boilerplate usando il combinatore `contramap`: data una istanza di `Ord` per `A` e una funzione da `B` ad `A`, possiamo derivare una istanza di `Ord` per `B`:

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Ord'

type User = {
  readonly name: string
  readonly age: number
}

const byAge: O.Ord<User> = pipe(
  N.Ord,
  O.contramap((_: User) => _.age)
)
```

Ora possiamo ottenere il più giovane di due utenti usando la funzione `min` che abbiamo precedentemente definito

```ts
// const getYounger: (second: User) => (first: User) => User
const getYounger = min(byAge)

console.log(
  pipe({ name: 'Guido', age: 50 }, getYounger({ name: 'Giulio', age: 47 }))
) // { name: 'Giulio', age: 47 }
```

**Quiz**. Nel modulo `fp-ts/ReadonlyMap` è contenuta la seguente API

```ts
/**
 * Get a sorted `ReadonlyArray` of the keys contained in a `ReadonlyMap`.
 */
declare const keys: <K>(O: Ord<K>) => <A>(m: ReadonlyMap<K, A>) => ReadonlyArray<K>
```

per quale motivo questa API richiede un `Ord<K>`?

Torniamo finalmente al quesito iniziale: definire i due semigruppi `SemigroupMin` e `SemigroupMax` anche per altri tipi oltre a `number`:

```ts
import * as Se from 'fp-ts/Semigroup'

const SemigroupMin: Se.Semigroup<number> = {
  concat: (second) => (first) => Math.min(first, second)
}

const SemigroupMax: Se.Semigroup<number> = {
  concat: (second) => (first) => Math.max(first, second)
}
```

Ora che abbiamo a disposizione l'astrazione `Ord` possiamo farlo:

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Ord'
import { Semigroup } from 'fp-ts/Semigroup'

export const min = <A>(OA: O.Ord<A>): Semigroup<A> => ({
  concat: O.min(OA)
})

export const max = <A>(OA: O.Ord<A>): Semigroup<A> => ({
  concat: O.max(OA)
})

type User = {
  readonly name: string
  readonly age: number
}

const byAge: O.Ord<User> = pipe(
  N.Ord,
  O.contramap((_: User) => _.age)
)

console.log(
  pipe(
    { name: 'Guido', age: 50 },
    min(byAge).concat({ name: 'Giulio', age: 47 })
  )
) // => { name: 'Giulio', age: 47 }
console.log(
  pipe(
    { name: 'Guido', age: 50 },
    max(byAge).concat({ name: 'Giulio', age: 47 })
  )
) // => { name: 'Guido', age: 50 }
```

**Esempio**

Ricapitoliamo tutto con un esempio finale (adattato da [Fantas, Eel, and Specification 4: Semigroup](http://www.tomharding.me/2017/03/13/fantas-eel-and-specification-4/))

Supponiamo di dover costruire un sistema in cui, in un database, sono salvati dei record di un cliente, modellati nel seguente modo

```ts
interface Customer {
  readonly name: string
  readonly favouriteThings: ReadonlyArray<string>
  readonly registeredAt: number // since epoch
  readonly lastUpdatedAt: number // since epoch
  readonly hasMadePurchase: boolean
}
```

Per qualche ragione potreste finire per avere dei record duplicati per la stessa persona.

Abbiamo bisogno di una strategia di merging. Ma questo è proprio quello di cui si occupano i semigruppi!

```ts
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Ord'
import * as RA from 'fp-ts/ReadonlyArray'
import * as Se from 'fp-ts/Semigroup'

interface Customer {
  readonly name: string
  readonly favouriteThings: ReadonlyArray<string>
  readonly registeredAt: number // since epoch
  readonly lastUpdatedAt: number // since epoch
  readonly hasMadePurchase: boolean
}

const SemigroupCustomer: Se.Semigroup<Customer> = Se.struct({
  // keep the longer name
  name: Se.max(
    pipe(
      N.Ord,
      O.contramap((s: string) => s.length)
    )
  ),
  // accumulate things
  favouriteThings: RA.getSemigroup<string>(),
  // keep the least recent date
  registeredAt: Se.min(N.Ord),
  // keep the most recent date
  lastUpdatedAt: Se.max(N.Ord),
  // boolean semigroup under disjunction
  hasMadePurchase: B.SemigroupAny
})

console.log(
  pipe(
    {
      name: 'Giulio',
      favouriteThings: ['math', 'climbing'],
      registeredAt: new Date(2018, 1, 20).getTime(),
      lastUpdatedAt: new Date(2018, 2, 18).getTime(),
      hasMadePurchase: false
    },
    SemigroupCustomer.concat({
      name: 'Giulio Canti',
      favouriteThings: ['functional programming'],
      registeredAt: new Date(2018, 1, 22).getTime(),
      lastUpdatedAt: new Date(2018, 2, 9).getTime(),
      hasMadePurchase: true
    })
  )
)
/*
{ name: 'Giulio Canti',
  favouriteThings: [ 'math', 'climbing', 'functional programming' ],
  registeredAt: 1519081200000, // new Date(2018, 1, 20).getTime()
  lastUpdatedAt: 1521327600000, // new Date(2018, 2, 18).getTime()
  hasMadePurchase: true
}
*/
```

**Quiz**. Dato un tipo `A` è possibile definire una istanza di semigruppo per `Ord<A>`? Cosa potrebbe rappresentare?

**Demo**

[`02_ord.ts`](src/02_ord.ts)

# Modellare la composizione con i monoidi

Se aggiungiamo una condizione in più alla definizione di un semigruppo, ovvero che esista un elemento `empty` in `A`
tale che per ogni elemento `a` in `A` vale

- **Right identity**: `a |> concat(empty) = a`
- **Left identity**: `empty |> concat(a) = a`

allora parliamo di monoide e l'elemento `empty` viene detto **unità** (o "elemento neutro").

Come già successo per `Magma` e `Semigroup`, i monoidi possono essere modellati con una `interface` di TypeScript:

```ts
import * as Se from 'fp-ts/Semigroup'

interface Monoid<A> extends Se.Semigroup<A> {
  readonly empty: A
}
```

Molti dei semigruppi che abbiamo visto nelle sezioni precedenti possono essere arricchiti e diventare istanze di `Monoid`:

```ts
import * as Mo from 'fp-ts/Monoid'

/** number `Monoid` under addition */
const MonoidSum: Mo.Monoid<number> = {
  concat: (second) => (first) => first + second,
  empty: 0
}

/** number `Monoid` under multiplication */
const MonoidProduct: Mo.Monoid<number> = {
  concat: (second) => (first) => first * second,
  empty: 1
}

const MonoidString: Mo.Monoid<string> = {
  concat: (second) => (first) => first + second,
  empty: ''
}

/** boolean monoid under conjunction */
const MonoidAll: Mo.Monoid<boolean> = {
  concat: (second) => (first) => first && second,
  empty: true
}

/** boolean monoid under disjunction */
const MonoidAny: Mo.Monoid<boolean> = {
  concat: (second) => (first) => first || second,
  empty: false
}
```

**Quiz**. Nella sezione sui semigruppi abbiamo visto che `ReadonlyArray<string>` ammette una istanza di `Semigroup`:

```ts
import * as Se from 'fp-ts/Semigroup'

const Semigroup: Se.Semigroup<ReadonlyArray<string>> = {
  concat: (second) => (first) => first.concat(second)
}
```

esiste anche l'unità? E' possibile generalizzare il risultato per `ReadonlyArray<A>` per qualsiasi tipo `A`?


**Quiz** (difficile). Dato un monoide, è possibile che esista più di un elemento neutro?

Ogni monoide è un semigruppo, ma non ogni semigruppo è un monoide.

<center>
<img src="images/monoid.png" width="300" alt="Magma vs Semigroup vs Monoid" />
</center>

**Esempio**

Si consideri il seguente semigruppo:

```ts
import { pipe } from 'fp-ts/function'
import * as Se from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'

const SemigroupIntercalate = pipe(S.Semigroup, Se.intercalate('|'))

console.log(pipe('a', S.Semigroup.concat('b'))) // => 'ab'
console.log(pipe('a', SemigroupIntercalate.concat('b'))) // => 'a|b'
```

Notate come non sia possibile trovare un valore `empty` di tipo `string` tale che `a |> concat(empty) = a`.

Infine un esempio più "esotico", sulle funzioni:

**Esempio**

Un **endomorfismo** è una funzione in cui il tipo in input e il tipo in output coincidono:

```ts
type Endomorphism<A> = (a: A) => A
```

Dato un tipo `A`, gli endomorfismi su `A` sono un monoide, tale che:

- l'operazione `concat` è l'usuale composizione di funzioni
- l'unità è la funzione identità

```ts
import { flow, identity } from 'fp-ts/function'
import * as Mo from 'fp-ts/Monoid'

type Endomorphism<A> = (a: A) => A

export const getEndomorphismMonoid = <A>(): Mo.Monoid<
  Endomorphism<A>
> => ({
  concat: (second) => (first) => flow(first, second),
  empty: identity
})
```

## La funzione `concatAll`

Quando usiamo un monoide invece di un semigruppo, la concatenazione di più elementi è ancora più semplice: non è necessario fornire esplicitamente un valore iniziale.

**Quiz**. Perché non è necessario fornire un valore iniziale?

```ts
import * as Mo from 'fp-ts/Monoid'
import * as S from 'fp-ts/string'
import * as N from 'fp-ts/number'
import * as B from 'fp-ts/boolean'

console.log(Mo.concatAll(N.MonoidSum)([1, 2, 3, 4])) // => 10
console.log(Mo.concatAll(N.MonoidProduct)([1, 2, 3, 4])) // => 24
console.log(Mo.concatAll(S.Monoid)(['a', 'b', 'c'])) // => 'abc'
console.log(Mo.concatAll(B.MonoidAll)([true, false, true])) // => false
console.log(Mo.concatAll(B.MonoidAny)([true, false, true])) // => true
```

## Monoide prodotto

Come abbiamo già visto per i semigruppi, è possibile costruire una istanza di monoide per una struct se siamo in grado di fornire una istanza di monoide per ogni suo campo.

**Esempio**

```ts
import * as Mo from 'fp-ts/Monoid'
import * as N from 'fp-ts/number'

type Vector = {
  readonly x: number
  readonly y: number
}

const Monoid: Mo.Monoid<Vector> = Mo.struct({
  x: N.MonoidSum,
  y: N.MonoidSum
})
```

**Nota**. Esiste un combinatore simile a `struct` ma che lavora con le tuple: `tuple`.

```ts
import * as Mo from 'fp-ts/Monoid'
import * as N from 'fp-ts/number'

type Vector = readonly [number, number]

const Monoid: Mo.Monoid<Vector> = Mo.tuple(N.MonoidSum, N.MonoidSum)
```

**Demo** (implementare un sistema per disegnare forme geometriche su un canvas)

[`03_shapes.ts`](src/03_shapes.ts)

# Funzioni pure e funzioni parziali

Nel primo capitolo del corso abbiamo visto una definizione informale di funzione pura:

> Una funzione pura è una procedura che dato lo stesso input restituisce sempre lo stesso output e non ha alcun side effect osservabile.

Un tale enunciato può lasciare spazio a qualche dubbio (per esempio, che cos'è un "side effect"?)

Vediamo perciò una definizione formale:

Ricordiamo che se `X` e `Y` sono due insiemi, allora con `X × Y` si indica il loro _prodotto cartesiano_, ovvero l'insieme

```
X × Y = { (x, y) | x ∈ X, y ∈ Y }
```

**Definizione**. Una _funzione_ `f: X ⟶ Y` è un sottoinsieme `f` di `X × Y` tale che
per ogni `x ∈ X` esiste esattamente un `y ∈ Y` tale che la coppia `(x, y) ∈ f`.

L'insieme `X` si dice il _dominio_ di `f`, `Y` il suo _codominio_.

Si noti che l'insieme `f` deve essere descritto _staticamente_ in fase di definizione della funzione
(ovvero gli elementi di quell'insieme non possono variare nel tempo e per nessuna condizione interna o esterna).

**Esempio**

La funzione `double: Nat ⟶ Nat`, ove `Nat` è l'insieme dei numeri naturali, è il sottoinsieme del prodotto cartesiano `Nat × Nat` dato dalle coppie `{ (1, 2), (2, 4), (3, 6), ...}`.

In TypeScript `f` potrebbe essere definita così:

```ts
const f: Record<number, number> = {
  1: 2,
  2: 4,
  3: 6
  ...
}
```

Quella dell'esempio viene detta definizione _estensionale_ di una funzione, ovvero si enumerano uno per uno gli elementi del dominio e per ciascuno di essi si indica il corrispondente elemento del codominio.
Naturalmente quando l'insieme è infinito, come in questo caso, la definizione può risultare un po' "scomoda".

Si può ovviare a questo problema introducendo quella che viene detta definizione _intensionale_,
ovvero si esprime una condizione che deve valere per tutte le coppie `(x, y)` appartenenti all'insieme `f`, ovvero `y = x * 2`. Questa è la forma familiare con cui scriviamo la funzione `double` e come la definiamo in TypeScript:

```ts
const double = (x: number): number => x * 2
```

La definizione di funzione come sottoinsieme di un prodotto cartesiano mostra come in matematica tutte le funzioni siano pure:
non c'è azione, modifica di stato o modifica degli elementi (che sono considerati immutabili) degli insiemi coinvolti.
Nella programmazione funzionale l'implementazione delle funzioni deve tendere a questo modello ideale.

**Quiz**. Quali delle seguenti procedure sono funzioni pure?

```ts
const coefficient1 = 2
export const f1 = (n: number) => n * coefficient1

// ------------------------------------------------------

let coefficient2 = 2
export const f2 = (n: number) => n * coefficient2++

// ------------------------------------------------------

let coefficient3 = 2
export const f3 = (n: number) => n * coefficient3

// ------------------------------------------------------

export const f4 = (n: number) => {
  const out = n * 2
  console.log(out)
  return out
}

// ------------------------------------------------------

interface User {
  readonly id: number
  readonly name: string
}

export declare const f5: (id: number) => Promise<User>

// ------------------------------------------------------

import * as fs from 'fs'

export const f6 = (path: string): string =>
  fs.readFileSync(path, { encoding: 'utf8' })

// ------------------------------------------------------

export const f7 = (
  path: string,
  callback: (err: Error | null, data: string) => void
): void => fs.readFile(path, { encoding: 'utf8' }, callback)
```

Che una funzione sia pura non implica necessariamente che sia bandita la mutabilità, localmente è ammissibile
se non esce dai confini della implementazione.

![mutable / immutable](images/mutable-immutable.jpg)

**Esempio** (Implementazione della funzione `concatAll` dei monoidi)

```ts
import { pipe } from 'fp-ts/function'
import { Monoid } from 'fp-ts/Monoid'

const concatAll = <A>(M: Monoid<A>) => (as: ReadonlyArray<A>): A => {
  let out: A = M.empty // <= mutabilità locale
  for (const a of as) {
    out = pipe(out, M.concat(a))
  }
  return out
}
```

L'obbiettivo vero è sempre quello di garantire la proprietà fondamentale di **trasparenza referenziale**.

Il contratto che stipuliamo con l'utente della nostra API è definito dalla sua firma:

```ts
declare const concatAll: <A>(M: Monoid<A>) => (as: ReadonlyArray<A>) => A
```

e dalla promessa di rispettare la trasparenza referenziale, i dettagli tecnici di come la funzione è concretamente implementata non interessano e non sono sotto esame, c'è quindi la massima libertà.

Dunque come si definisce un "side effect"? Semplicemente negando la trasparenza referenziale:

> Una espressione contiene un "side effect" se non gode della trasparenza referenziale.

Non solo le funzioni appoggiano sul primo dei due pilastri della programmazione funzionale, ma sono un esempio
anche del secondo pilastro: la **composizione**.

Infatti le funzioni compongono:

**Definizione**. Siano `f: Y ⟶ Z` e `g: X ⟶ Y` due funzioni, allora la funzione `h: X ⟶ Z` definita da

```
h(x) = f(g(x))
```

si dice _composizione_ di `f` e `g` e si scrive `h = f ∘ g`

Si noti che affinché due funzioni `f` e `g` possano comporre, il dominio di `f` deve coincidere col codominio di `g`.

**Definizione**. Una funzione _parziale_ è una funzione che non è definita per tutti i valori del dominio.

Viceversa una funzione definita per tutti i valori del dominio è detta _totale_.

**Esempio**

```ts
// Get the first element of a `ReadonlyArray`
declare const head: <A>(as: ReadonlyArray<A>) => A
```

**Quiz**. Perché la funzione `head` è parziale?

**Quiz**. La funzione `JSON.parse` è totale?

```ts
parse: (text: string, reviver?: (this: any, key: string, value: any) => any) => any
```

**Quiz**. La funzione `JSON.stringify` è totale?

```ts
stringify: (value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number) => string
```

In ambito funzionale si tende a definire solo **funzioni pure e totali** (d'ora in poi userò il termine "funzione" come sinonimo di "funzione pura e totale"), quindi come ci si deve comportare se si ha a che fare con una funzione parziale?

Fortunatamente una funzione parziale `f: X ⟶ Y` può essere sempre ricondotta ad una funzione totale aggiungendo al codominio un valore speciale **non appartenente** a `Y`, chiamiamolo `None`, e associandolo ad ogni valore di `X` per cui `f` non è definita

```
f': X ⟶ Y ∪ None
```

Chiamiamo `Option(Y) = Y ∪ None`.

```
f': X ⟶ Option(Y)
```

E' possibile definire `Option(Y)` in TypeScript? Nei prossimi due capitoli vedremo come poterlo fare.

# Algebraic Data Types

Un buon primo passo quando si sta construendo una nuova applicazione è quello di definire il suo modello di dominio. TypeScript offre molti strumenti che aiutano in questo compito. Gli **Algebraic Data Types** (abbreviato in ADT) sono uno di questi strumenti.

## Che cos'è un algebraic Data Types?

> In computer programming, especially functional programming and type theory, an algebraic data type is a kind of composite type, i.e., a type formed by combining other types.

Due famiglie comuni di algebraic data types sono: **product types** e **sum types**.

<center>
<img src="images/adt.png" width="400" alt="ADT" />
</center>

Cominciamo da quelli più familiari: i product type.

## Product types

Un product type è una collezione di tipi T<sub>i</sub> inidicizzati da un insieme `I`.

Due membri comuni di questa famiglia sono le `n`-tuple, dove `I` è un intervallo di numeri naturali:

```ts
type Tuple1 = [string] // I = [0]
type Tuple2 = [string, number] // I = [0, 1]
type Tuple3 = [string, number, boolean] // I = [0, 1, 2]

// Accessing by index
type Fst = Tuple2[0] // string
type Snd = Tuple2[1] // number
```

e le struct, ove `I` è un insieme di label:

```ts
// I = {"name", "age"}
interface Person {
  name: string
  age: number
}

// Accessing by label
type Name = Person['name'] // string
type Age = Person['age'] // number
```

I product type possono essere **polimorfici**.

**Esempio**

```ts
//                ↓ type parameter
type HttpResponse<A> = {
  readonly code: number
  readonly body: A
}
```

### Da dove viene il nome "product types"?

Se indichiamo con `C(A)` il numero di abitanti del tipo `A` (ovvero la sua **cardinalità**) allora vale la seguente uguaglianza:

```ts
C([A, B]) = C(A) * C(B)
```

> la cardinalità del prodotto è il prodotto delle cardinalità

**Esempio**

Il tipo `null` ha cardinalità `1` perchè ha un solo abitante: `null`.

**Esempio**

Il tipo `boolean` ha cardinalità `2` perchè ha due abitanti: `true` e `false`.

**Esempio**

```ts
type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Period = 'AM' | 'PM'
type Clock = readonly [Hour, Period]
```

Il tipo `Hour` ha `12` abitanti.
Il tipo `Period` ha `2` abitanti.
Il tipo `Clock` ha `12 * 2 = 24` abitanti.

**Quiz**. Quanti abitanti ha il seguente tipo `Clock`?

```ts
// same as before
type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
// same as before
type Period = 'AM' | 'PM'

type Clock = {
  readonly hour: Hour
  readonly period: Period
}
```

### Quando posso usare un product type?

Ogniqualvolta le sue conponenti sono **indipendenti**.

```ts
type Clock = readonly [Hour, Period]
```

Qui `Hour` e `Period` sono indipendenti, ovvero il valore di `Hour` non influisce sul valore di `Period` e viceversa, tutte le coppie sono legali e hanno senso.

## Sum types

Un sum type è una struttura dati che contiene un valore che può assumere diversi tipi (ma fissi). Solo uno dei tipi può essere in uso in un dato momento, e un campo che fa da "tag" indica quale di questi è in uso.

Nella documentazione ufficiale di TypeScript sono indicati col nome [discriminated union](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html).

E' importante sottolineare che i membri dell'unione che forma un sum type devono essere **disgiunti**, ovvero non devono esistere valori che appartengono a più di un membro.

**Esempio**

Il tipo

```ts
type StringsOrNumbers = ReadonlyArray<string> | ReadonlyArray<number>
```

non è una unione disgiunta perché il valore `[]` (array vuoto) appartiene ad ambedue i membri dell'unione.

**Quiz**. La seguente unione è disgiunta?

```ts
type Member1 = { readonly a: string }
type Member2 = { readonly b: number }
type MyUnion = Member1 | Member2
```

In programmazione funzionale si tende ad usare sempre unioni disgiunte.

Fortunatamente in TypeScript c'è un modo sicuro per garantire che una unione sia disgiunta: aggiungere un apposito campo che fa da **tag**.

**Esempio** (redux actions)

```ts
export type Action =
  | {
      readonly type: 'ADD_TODO'
      readonly text: string
    }
  | {
      readonly type: 'UPDATE_TODO'
      readonly id: number
      readonly text: string
      readonly completed: boolean
    }
  | {
      readonly type: 'DELETE_TODO'
      readonly id: number
    }
```

Il campo `type`, essendo obbligatorio e avendo un tipo diverso per ogni membro dell'unione, può essere eletto come tag e assicura che i membri siano disgiunti.

**Nota**. Il nome del campo che fa da tag è a discrezione dello sviluppatore, non deve essere necessariamente "type" (in `fp-ts` per esempio, per convenzione si usa il nome "_tag").

Ora che abbiamo visto un po' di esempi possiamo riformulare in modo più esplicito che cos'è un algebraic data type:

> In general, an algebraic data type specifies a sum of one or more alternatives, where each alternative is a product of zero or more fields.

**Quiz** (TypeScript). Delle seguenti strutture dati dire se sono dei product type o dei sum type

- `ReadonlyArray<A>`
- `Record<string, A>`
- `Record<'k1' | 'k2', A>`
- `ReadonlyMap<string, A>`
- `ReadonlyMap<'k1' | 'k2', A>`

I sum type possono essere **polimorfici** e **ricorsivi**.

**Esempio** (linked lists)

```ts
//               ↓ type parameter
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> }
//                                                              ↑ recursion
```

### Costruttori

Un sum type con `n` membri necessita di (almeno) `n` **costruttori**, uno per ogni membro.

**Esempio** (redux action creators)

```ts
export type Action =
  | {
      readonly type: 'ADD_TODO'
      readonly text: string
    }
  | {
      readonly type: 'UPDATE_TODO'
      readonly id: number
      readonly text: string
      readonly completed: boolean
    }
  | {
      readonly type: 'DELETE_TODO'
      readonly id: number
    }

export const add = (text: string): Action => ({
  type: 'ADD_TODO',
  text
})

export const update = (id: number, text: string, completed: boolean): Action => ({
  type: 'UPDATE_TODO',
  id,
  text,
  completed
})

export const del = (id: number): Action => ({
  type: 'DELETE_TODO',
  id
})
```

**Esempio** (linked lists)

```ts
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> }

// a nullary constructor can be implemented as a constant
export const nil: List<never> = { _tag: 'Nil' }

export const cons = <A>(head: A, tail: List<A>): List<A> => ({
  _tag: 'Cons',
  head,
  tail
})

// equivalente ad un array [1, 2, 3]
const myList = cons(1, cons(2, cons(3, nil)))
```

### Pattern matching

JavaScript non ha il [pattern matching](https://github.com/tc39/proposal-pattern-matching) (e quindi neanche TypeScript) tuttavia possiamo simularlo tramite una funzione `match`.

**Esempio** (usando ancora `Action`)

```ts
export type Action =
  | {
      readonly type: 'ADD_TODO'
      readonly text: string
    }
  | {
      readonly type: 'UPDATE_TODO'
      readonly id: number
      readonly text: string
      readonly completed: boolean
    }
  | {
      readonly type: 'DELETE_TODO'
      readonly id: number
    }

export const match = <R>(
  onAdd: (text: string) => R,
  onUpdate: (id: number, text: string, completed: boolean) => R,
  onDelete: (id: number) => R
) => (fa: Action): R => {
  switch (fa.type) {
    case 'ADD_TODO':
      return onAdd(fa.text)
    case 'UPDATE_TODO':
      return onUpdate(fa.id, fa.text, fa.completed)
    case 'DELETE_TODO':
      return onDelete(fa.id)
  }
}

type State = { ... }

const reducer = (action: Action, state: State): State => pipe(action, match(
  onAdd: (text) => ...,
  onUpdate: (id, text, completed) => ...,
  onDelete: (id) => ...
))
```

**Esempio** (linked lists)

```ts
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> }

export const match = <R, A>(
  onNil: () => R,
  onCons: (head: A, tail: List<A>) => R
) => (fa: List<A>): R => {
  switch (fa._tag) {
    case 'Nil':
      return onNil()
    case 'Cons':
      return onCons(fa.head, fa.tail)
  }
}

// restituisce `true` se la lista è vuota
export const isEmpty = match(
  () => true,
  () => false
)

// restituisce il primo elemento della lista oppure `undefined`
export const head = match(
  () => undefined,
  (head, _tail) => head
)

// calcola la lunghezza di una lista (ricorsivamente)
export const length: <A>(fa: List<A>) => number = match(
  () => 0,
  (_, tail) => 1 + length(tail)
)
```

**Nota**. TypeScript offre una ottima feature legata ai sum type: **exhaustive check**. Ovvero il type checker è in grado di determinare se tutti i casi sono stati gestiti nello `switch`.

### Da dove viene il nome "sum types"?

Vale la seguente uguaglianza:

```ts
C(A | B) = C(A) + C(B)
```

> la cardinalità della somma è la somma delle cardinalità

**Esempio** (the `Option` type)

```ts
type Option<A> =
  | { readonly _tag: 'None' }
  | {
      readonly _tag: 'Some'
      readonly value: A
    }
```

Dalla formula generale `C(Option<A>) = 1 + C(A)` possiamo derivare per esempio la cardinalità di `Option<boolean>`: `1 + 2 = 3` abitanti.

### Quando dovrei usare un sum type?

Quando le sue componenti sarebbero **dipendenti** se implementate con un product type.

**Esempio** (`React` props)

```ts
interface Props {
  readonly editable: boolean
  readonly onChange?: (text: string) => void
}

class Textbox extends React.Component<Props> {
  render() {
    if (this.props.editable) {
      // error: Cannot invoke an object which is possibly 'undefined' :(
      this.props.onChange(...)
    }
  }
}
```

Il problema qui è che `Props` è modellato come un prodotto ma `onChange` **dipende** da `editable`.

Un sum type è una scelta migliore:

```ts
type Props =
  | {
      readonly type: 'READONLY'
    }
  | {
      readonly type: 'EDITABLE'
      readonly onChange: (text: string) => void
    }

class Textbox extends React.Component<Props> {
  render() {
    switch (this.props.type) {
      case 'EDITABLE' :
        this.props.onChange(...) // :)
      ...
    }
  }
}
```

**Esempio** (node callbacks)

```ts
declare function readFile(
  path: string,
  //         ↓ -------------------------- ↓ CallbackArgs
  callback: (err?: NodeJS.ErrnoException, data?: string) => void
): void
```

Il risultato è modellato con un prodotto:

```ts
type CallbackArgs = [NodeJS.ErrnoException | undefined, string | undefined]
```

tuttavia le sue componenti sono **dipendenti**: si riceve un errore **oppure** una stringa:

| err         | data        | legal? |
| ----------- | ----------- | ------ |
| `Error`     | `undefined` | ✓      |
| `undefined` | `string`    | ✓      |
| `Error`     | `string`    | ✘      |
| `undefined` | `undefined` | ✘      |

Un sum type sarebbe una scelta migliore, ma quale? Vediamo come si gestiscono gli errori in modo funzionale.

**Quiz**. Recentemente alle API a callback si preferiscono le API che restituiscono una `Promise`

```ts
declare function readFile(path: string): Promise<string>
```

potete indicare un contro di questa seconda soluzione quando si utilizza un linguaggio a tipi statici come TypeScript?

# Functional error handling

Vediamo come gestire gli errori in modo funzionale.

## Il tipo `Option`

Il tipo `Option` rappresenta l'effetto di una computazione che può fallire oppure restituire un valore di tipo `A`:

```ts
type Option<A> =
  | { readonly _tag: 'None' } // represents a failure
  | { readonly _tag: 'Some'; readonly value: A } // represents a success
```

Costruttori e pattern matching:

```ts
// a nullary constructor can be implemented as a constant
const none: Option<never> = { _tag: 'None' }

const some = <A>(value: A): Option<A> => ({ _tag: 'Some', value })

const match = <R, A>(onNone: () => R, onSome: (a: A) => R) => (fa: Option<A>): R =>
  fa._tag === 'None' ? onNone() : onSome(fa.value)
```

Il tipo `Option` può essere usato per evitare di lanciare eccezioni e/o rappresentare i valori opzionali, così possiamo passare da...

```ts
//                        this is a lie ↓
const head = <A>(as: ReadonlyArray<A>): A => {
  if (as.length === 0) {
    throw new Error('Empty array')
  }
  return as[0]
}

let s: string
try {
  s = String(head([]))
} catch (e) {
  s = e.message
}
```

...in cui il type system è all'oscuro di un possibile fallimento, a...

```ts
//                              ↓ the type system "knows" that this computation may fail
const head = <A>(as: Array<A>): Option<A> =>
  as.length === 0 ? none : some(as[0])

import { pipe } from 'fp-ts/function'

const s = pipe(
  head([]),
  match(() => 'Empty array', a => String(a))
)
```

...ove la possibilità di errore è codificata nel type system.

Ora supponiamo di voler fare un "merge" di due `Option<A>`, ci sono quattro casi:

| x        | y        | x \|> concat(y) |
| -------- | -------- | --------------- |
| none     | none     | none            |
| some(a1) | none     | none            |
| none     | some(a2) | none            |
| some(a1) | some(a2) | ?               |

C'è un problema nell'ultimo caso, ci occorre un modo per fare un "merge" di due `A`.

Ma questo è proprio il lavoro di `Semigroup`!

| x        | y        | x \|> concat(y)                          |
| -------- | -------- | ---------------------------------------- |
| some(a1) | some(a2) | some(pipe(a1.value, S.concat(a2.value))) |

Possiamo richiedere una istanza di semigruppo per `A` e quindi derivare una istanza di semigruppo per `Option<A>`

```ts
// l'implementazione è lasciata come esercizio
declare const getSemigroup: <A>(S: Semigroup<A>) => Semigroup<Option<A>>
```

**Quiz**. E' possibile definire una istanza di monoide per `Option<A>` che si comporta come il semigruppo precedente?

Possiamo derivare altri due monoidi per `Option<A>` (per ogni `A`)

1. `getFirstMonoid`...

Monoid returning the left-most non-`None` value:

| x        | y        | x \|> concat(y) |
| -------- | -------- | --------------- |
| none     | none     | none            |
| some(a1) | none     | some(a1)        |
| none     | some(a2) | some(a2)        |
| some(a1) | some(a2) | some(a1)        |

```ts
import { getFirstMonoid, some, none } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

const M = getFirstMonoid<number>()

console.log(pipe(some(1), M.concat(none))) // => some(1)
console.log(pipe(some(1), M.concat(some(2)))) // => some(1)
```

2. ...e il suo **duale**: `getLastMonoid`

Monoid returning the right-most non-`None` value:

| x        | y        | x \|> concat(y) |
| -------- | -------- | --------------- |
| none     | none     | none            |
| some(a1) | none     | some(a1)        |
| none     | some(a2) | some(a2)        |
| some(a1) | some(a2) | some(a2)        |

```ts
import { getLastMonoid, some, none } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

const M = getLastMonoid<number>()

console.log(pipe(some(1), M.concat(none))) // => some(1)
console.log(pipe(some(1), M.concat(some(2)))) // => some(2)
```

**Esempio**

`getLastMonoid` può essere utile per gestire valori opzionali:

```ts
import { Monoid, struct } from 'fp-ts/Monoid'
import { Option, some, none, getLastMonoid } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

/** VSCode settings */
interface Settings {
  /** Controls the font family */
  readonly fontFamily: Option<string>
  /** Controls the font size in pixels */
  readonly fontSize: Option<number>
  /** Limit the width of the minimap to render at most a certain number of columns. */
  readonly maxColumn: Option<number>
}

const monoidSettings: Monoid<Settings> = struct({
  fontFamily: getLastMonoid<string>(),
  fontSize: getLastMonoid<number>(),
  maxColumn: getLastMonoid<number>()
})

const workspaceSettings: Settings = {
  fontFamily: some('Courier'),
  fontSize: none,
  maxColumn: some(80)
}

const userSettings: Settings = {
  fontFamily: some('Fira Code'),
  fontSize: some(12),
  maxColumn: none
}

/** userSettings overrides workspaceSettings */
console.log(pipe(workspaceSettings, monoidSettings.concat(userSettings)))
/*
{ fontFamily: some("Fira Code"),
  fontSize: some(12),
  maxColumn: some(80) }
*/
```

## Il tipo `Either`

Un uso comune di `Either` è come alternativa ad `Option` per gestire l'effetto di una computazione che può fallire, potendo però specificare il motivo del fallimento.

In questo uso, `None` è sostituito da `Left` che contiene informazione utile relativa all'errore. `Right` invece sostituisce `Some`.

```ts
type Either<E, A> =
  | { readonly _tag: 'Left'; readonly left: E } // represents a failure
  | { readonly _tag: 'Right'; readonly right: A } // represents a success
```

Costruttori e pattern matching:

```ts
const left = <E, A>(left: E): Either<E, A> => ({ _tag: 'Left', left })

const right = <A, E>(right: A): Either<E, A> => ({ _tag: 'Right', right })

const match = <E, R, A>(onLeft: (left: E) => R, onRight: (right: A) => R) => (
  fa: Either<E, A>
): R => (fa._tag === 'Left' ? onLeft(fa.left) : onRight(fa.right))
```

Tornando all'esempio con la callback:

```ts
declare function readFile(
  path: string,
  callback: (err?: Error, data?: string) => void
): void

readFile('./myfile', (err, data) => {
  let message: string
  if (err !== undefined) {
    message = `Error: ${err.message}`
  } else if (data !== undefined) {
    message = `Data: ${data.trim()}`
  } else {
    // should never happen
    message = 'The impossible happened'
  }
  console.log(message)
})
```

possiamo cambiare la sua firma in:

```ts
declare function readFile(
  path: string,
  callback: (result: Either<Error, string>) => void
): void
```

e consumare l'API in questo modo:

```ts
import { flow } from 'fp-ts/function'

readFile(
  './myfile',
  flow(
    match(
      (err) => `Error: ${err.message}`,
      (data) => `Data: ${data.trim()}`
    ),
    console.log
  )
)
```

# Teoria delle categorie

Abbiamo visto che una pietra miliare della programmazione funzionale è la **composizione**.

> And how do we solve problems? We decompose bigger problems into smaller problems. If the smaller problems are still too big,
we decompose them further, and so on. Finally, we write code that solves all the small problems. And then comes the essence of programming: we compose those pieces of code to create solutions to larger problems. Decomposition wouldn't make sense if we weren't able to put the pieces back together. - Bartosz Milewski

Ma cosa significa esattamente? Quando possiamo dire che due cose *compongono*? E quando possiamo dire che due cose compongono *bene*?

> Entities are composable if we can easily and generally combine their behaviors in some way without having to modify the entities being combined. I think of composability as being the key ingredient necessary for acheiving reuse, and for achieving a combinatorial expansion of what is succinctly expressible in a programming model. - Paul Chiusano

Occorre poter fare riferimento ad una **teoria rigorosa** che possa fornire risposte a domande così fondamentali.
Ci occorre una **definizione formale** del concetto di composizione.

Fortunatamente da più di 70 anni un vasto gruppo di studiosi appartenenti al più longevo e mastodontico progetto open source nella storia
dell'umanità (la matematica) si occupa di sviluppare una teoria specificatamente dedicata a questo argomento: la **teoria delle categorie**, fondata da Saunders Mac Lane, insieme a Samuel Eilenberg (1945).

<center>
<img src="images/maclane.jpg" width="300" alt="Saunders Mac Lane" />

(Saunders Mac Lane)

<img src="images/eilenberg.jpg" width="300" alt="Samuel Eilenberg" />

(Samuel Eilenberg)
</center>

## Definizione

> Categories capture the essence of composition.

La definizione di categoria, anche se non particolarmente complicata, è un po' lunga perciò la dividerò in due parti:

- la prima è tecnica (prima di tutto dobbiamo definire i suoi costituenti)
- la seconda parte contiene ciò a cui siamo più interessati: una nozione di composizione

**Parte I (Costituenti)**

Una categoria è una coppia `(Objects, Morphisms)` ove:

- `Objects` è una collezione di **oggetti**
- `Morphisms` è una collezione di **morfismi** (dette anche "frecce") tra oggetti

<img src="images/objects-morphisms.png" width="300" alt="Objects and Morphisms" />

**Nota**. Il termine "oggetto" non ha niente a che fare con la OOP, pensate agli oggetti come a scatole nere che non potete ispezionare, oppure come a dei semplici placeholder utili a definire i morfismi.

Ogni morfismo `f` possiede un oggetto sorgente `A` e un oggetto target `B`, dove sia `A` che `B` sono contenuti in `Objects`. Scriviamo `f: A ⟼ B` e diciamo che "f è un morfismo da A a B"

<img src="images/morphism.png" width="300" alt="A morphism" />

**Nota**. Per semplicità d'ora in poi nei grafici userò solo le etichette per gli oggetti, omettendo il cerchietto.

**Parte II (Composizione)**

Esiste una operazione `∘`, chiamata "composizione", tale che valgono le seguenti proprietà:

(**composition of morphisms**) ogni volta che `f: A ⟼ B` and `g: B ⟼ C` sono due morfismi in `Morphisms` allora deve esistere un terzo morfismo `g ∘ f: A ⟼ C` in `Morphisms` che è detto la _composizione_ di `f` e `g`

<img src="images/composition.png" width="300" alt="composition" />

(**associativity**) se `f: A ⟼ B`, `g: B ⟼ C` e `h: C ⟼ D` allora `h ∘ (g ∘ f) = (h ∘ g) ∘ f`

<img src="images/associativity.png" width="500" alt="associativity" />

(**identity**) per ogni oggetto `X`, esiste un morfismo `idX: X ⟼ X` chiamato *il morfismo identità* di `X`, tale che per ogni morfismo `f: A ⟼ X` e ogni morfismo `g: X ⟼ B`, vale `idX ∘ f = f` e `g ∘ idX = g`.

<img src="images/identity.png" width="300" alt="identity" />

Vediamo un piccolo esempio

**Esempio**

<img src="images/category.png" width="300" alt="a simple category" />

Questa categoria è molto semplice, ci sono solo tre oggetti e sei morfismi (idA, idB, idC sono i morfismi identità di `A`, `B`, `C`).

## Modellare i linguaggi di programmazione con le categorie

Una categoria può essere interpretata come un modello semplificato di un **typed programming language**, ove:

- gli oggetto sono **tipi**
- i morfismi sono **funzioni**
- `∘` è l'usuale **composizione di funzioni**

Il diagramma:

<img src="images/category.png" width="300" alt="a simple programming language" />

può perciò essere interpretato come un immaginario (e molto semplice) linguaggio di programmazione con solo tre tipi e sei funzioni.

Per esempio potremmo pensare a:

- `A = string`
- `B = number`
- `C = boolean`
- `f = string => number`
- `g = number => boolean`
- `g ∘ f = string => boolean`

L'implementazione potrebbe essere qualcosa come:

```ts
const idA = (s: string): string => s

const idB = (n: number): string => n

const idC = (b: boolean): boolean => B

const f = (s: string): number => s.length

const g = (n: number): boolean => n > 2

// gf = g ∘ f
const gf = (s: string): boolean => g(f(s))
```

## Una categoria per TypeScript

Possiamo definire una categoria, chiamiamola *TS*, come modello semplificato del linguaggio TypeScript, ove:

- gli **oggetti** sono tutti i tipi di TypeScript: `string`, `number`, `Array<string>`, ecc...
- i **morfismi** sono tutte le funzioni di TypeScript: `(a: A) => B`, `(b: B) => C`, ecc... ove `A`, `B`, `C`, ... sono tipi di TypeScript
- i **morfismi identità** sono tutti codificati da una singola funzione polimorfica `const identity = <A>(a: A): A => a`
- la **composizione di morfismi** è l'usuale composizione di funzione (che è associativa)

Come modello di TypeScript, la categoria *TS* a prima vista può sembrare troppo limitata: non ci sono cicli, niente `if`, non c'è *quasi* nulla... e tuttavia questo modello semplificato è abbastanza ricco per soddisfare il nostro obbiettivo principale: ragionare su una nozione ben definita di composizione.

Ora che abbiamo un semplice modello per il nostro linguaggio di programmazione, affrontiamo il problema centrale della composizione.

## Il problema centrale della composizione di funzioni

In _TS_ possiamo comporre due funzioni generiche `f: (a: A) => B` and `g: (c: C) => D` fintanto che `C = B`

```ts
function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return (a) => g(f(a))
}
```

Ma che succede se `B != C`? Come possiamo comporre due tali funzioni? Dobbiamo lasciar perdere?

Nei prossimi capitoli vedremo sotto quali condizioni una tale composizione è possibile.

**Spoiler**

- per comporre `f: (a: A) => B` con `g: (b: B) => C` abbiamo solo bisogno della usuale composizione di funzioni
- per comporre `f: (a: A) => F<B>` con `g: (b: B) => C` abbiamo bisogno di una istanza di **funtore** per `F`
- per comporre `f: (a: A) => F<B>` con `g: (b: B) => (c: C) => D` abbiamo bisogno di una istanza di **funtore applicativo** per `F`
- per comporre `f: (a: A) => F<B>` con `g: (b: B) => F<C>` abbiamo bisogno di una istanza di **monade** per `F`

Cominciamo con i **funtori**.

# Funtori

Nell'ultimo capitolo ho presentato la categoria *TS* (la categoria di TypeScript) e il problema centrale con la composizione di funzioni:

> Come possiamo comporre due funzioni generiche `f: (a: A) => B` e `g: (c: C) => D`?

Ma perché trovare soluzioni a questo problema è così importante?

Perché, se è vero che le categorie possono essere usate per modellare i linguaggi di programmazione, i morfismi (ovvero le funzioni in *TS*) possono essere usate per modellare i **programmi**.

Perciò risolvere quel problema astratto significa anche trovare un modo di **comporre i programmi in modo generico**.
E *questo* sì che è molto interessante per uno sviluppatore, non è vero?

## Funzioni come programmi

Se vogliamo usare le funzioni per modellare i programmi dobbiamo affrontare subito un problema:

> Come è possibile modellare un programma che produce side effect con una funzione pura?

La risposta è modellare i side effect tramite quelli che vengono chiamati **effetti**, ovvero tipi che **rappresentano** i side effect.

Vediamo due tecniche possibili per farlo in JavaScript:

- definire un DSL (domain specific language) per gli effetti
- usare i *thunk*

La prima tecnica, usare cioè un DSL, significa modificare un programma come:

```ts
const log = (message: string): void => {
  console.log(message) // side effect
}
```

cambiando il suo codominio e facendo in modo che sia una funzione che restituisce una **descrizione** del side effect:

```ts
type DSL = ... // sum type di tutti i possibili effetti gestiti dal sistema

const log = (message: string): DSL => {
  return { _tag: 'log', message } // un effetto che descrive l'atto di scrivere sulla console
}
```

**Quiz**. La funzione `log` appena definita è davvero pura? Eppure `log('foo') !== log('foo')`!

Questa prima tecnica presuppone un modo per combinare gli effetti e la definizione di un interprete in grado di eseguire concretamente gli effetti quando si vuole eseguire il codice risultante.

Una seconda tecnica, più semplice, è racchiudere la computazione in un thunk:

```ts
interface IO<A> {
  (): A
}

const log = (message: string): IO<void> => {
  return () => console.log(message) // restituisce un thunk
}
```

Il programma `log`, quando viene eseguito, non provoca immediatamente il side effect ma restituisce **un valore che rappresenta la computazione**.

Vediamo un altro esempio che usa i thunk, leggere e scrivere sul `localStorage`:

```ts
const read = (name: string): IO<string | null> => () =>
  localStorage.getItem(name)

const write = (name: string, value: string): IO<void> => () =>
  localStorage.setItem(name, value)
```

Nella programmazione funzionale si tende a spingere i side effect (sottoforma di effetti) ai confini del sistema (ovvero la funzione `main`)
ove vengono eseguiti, si ottiene perciò il seguente pattern:

> system = pure core + imperative shell

Nei linguaggi *puramente funzionali* (come Haskell, PureScript o Elm) questa divisione è netta ed è imposta dal linguaggio stesso.

Anche con questa seconda tecnica (quella usata da `fp-ts`) occorre un modo per combinare gli effetti, il che ci riporta alla nostra volontà di comporre i programmi in modo generico, vediamo come fare.

Innanzi tutto un po' di terminologia: chiamiamo **programma puro** una funzione con la seguente firma:

```ts
(a: A) => B
```

Una tale firma modella un programma che accetta un input di tipo `A` e restituisce un risultato di tipo `B`, senza alcun effetto.

**Esempio**

Il programma `len`:

```ts
const len = (s: string): number => s.length
```

Chiamiamo **programma con effetti** una funzione con la seguente firma:

```ts
(a: A) => F<B>
```

per un qualche type constructor `F`.

Una tale firma modella un programma che accetta un input di tipo `A` e restituisce un risultato di tipo `B` insieme ad un **effetto** `F`.

Ricordiamo che un [type constructor](https://en.wikipedia.org/wiki/Type_constructor) è un operatore a livello di tipi `n`-ario che prende come argomento zero o più tipi e che restituisce un tipo (esempi: `Option`, `ReadonlyArray`).

**Esempio**

Il programma `head`

```ts
import { Option, some, none } from 'fp-ts/Option'

const head = (as: ReadonlyArray<string>): Option<string> =>
  as.length === 0 ? none : some(as[0])
```

è un programma con effetto `Option`.

Quando parliamo di effetti siamo interessati a type constructor `n`-ari con `n >= 1`, per esempio:

| Type constructor   | Effect (interpretation)                     |
| ------------------ | ------------------------------------------- |
| `ReadonlyArray<A>` | a non deterministic computation             |
| `Option<A>`        | a computation that may fail                 |
| `IO<A>`            | a synchronous computation with side effects |
| `Task<A>`          | an asynchronous computation                 |

ove

```ts
interface Task<A> {
  (): Promise<A>
}
```

Torniamo ora al nostro problema principale:

> Come possiamo comporre due funzioni generiche `f: (a: A) => B` e `g: (c: C) => D`?

Dato che il problema generale non è trattabile, dobbiamo aggiungere qualche **vincolo** a `B` e `C`.

Sappiamo già che se `B = C` allora la soluzione è l'usuale composizione di funzioni

```ts
function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return (a) => g(f(a))
}
```

Ma cosa fare negli altri casi?

## Un vincolo che conduce ai funtori

Consideriamo il seguente vincolo: `B = F<C>` per un qualche type constructor `F`, abbiamo perciò la seguente situazione:

- `f: (a: A) => F<B>` è un programma con effetti
- `g: (b: B) => C` è un programma puro

Per poter comporre `f` con `g` dobbiamo trovare un procedimento che permetta di tramutare `g` da una funzione `(b: B) => C` ad una funzione `(fb: F<B>) => F<C>` in modo tale che possiamo usare la normale composizione di funzioni (infatti in questo modo il codominio di `f` sarebbe lo stesso insieme che fa da dominio della nuova funzione).

<img src="images/map.png" width="500" alt="map" />

Abbiamo perciò tramutato il problema originale in uno nuovo e diverso: possiamo trovare una funzione, chiamiamola `map`, che agisce in questo modo?

Vediamo qualche esempio pratico:

**Esempio** (`F = ReadonlyArray`)

```ts
import { flow } from 'fp-ts/function'

const map = <B, C>(
  g: (b: B) => C
): ((fb: ReadonlyArray<B>) => ReadonlyArray<C>) => (fb) => fb.map(g)

declare const f: (a: string) => ReadonlyArray<number>
declare const g: (b: number) => boolean

// h: string => ReadonlyArray<string>
const h = flow(f, map(g))
```

**Esempio** (`F = Option`)

```ts
import { flow } from 'fp-ts/function'
import { isNone, none, Option, some } from 'fp-ts/Option'

const map = <B, C>(g: (b: B) => C): ((fb: Option<B>) => Option<C>) => (fb) =>
  isNone(fb) ? none : some(g(fb.value))

declare const f: (a: string) => Option<number>
declare const g: (b: number) => boolean

// h: string => Option<string>
const h = flow(f, map(g))
```

**Esempio** (`F = Task`)

```ts
import { flow } from 'fp-ts/function'
import { Task } from 'fp-ts/Task'

const map = <B, C>(g: (b: B) => C): ((fb: Task<B>) => Task<C>) => (fb) => () =>
  fb().then(g)

declare const f: (a: string) => Task<number>
declare const g: (b: number) => boolean

// h: string => Task<string>
const h = flow(f, map(g))
```

Più in generale, quando un certo type constructor `F` ammette una `map` che agisce in questo modo, diciamo che ammette una **istanza di funtore**.

Dal punto di vista matematico, i funtori sono delle **mappe tra categorie** che preservano la struttura categoriale, ovvero che preservano i morfismi identità e l'operazione di composizione.

Dato che le categorie sono costituite da due cose (gli oggetti e i morfismi) anche un funtore è costituito da due cose:

- una **mappa tra oggetti** che associa ad ogni oggetto in `X` in _C_ un oggetto `F<X>` in _D_
- una **mappa tra morfismi** che associa ad ogni morfismo `f` in _C_ un morfismo `map(f)` in _D_

ove _C_ e _D_ sono due categorie (aka due linguaggi di programmazione).

<img src="images/functor.png" width="500" alt="functor" />

Anche se una mappa tra due linguaggi di programmazione è un'idea intrigante, siamo più interessati ad una mappa in cui _C_ and _D_ coincidono (con la categoria *TS*). In questo caso parliamo di **endofuntori** ("endo" significa "dentro", "interno").

D'ora in poi, se non diversamente specificato, quando scrivo "funtore" intendo un endofuntore in *TS*.

Ora che sappiamo qual'è l'aspetto pratico che ci interessa dei funtori, vediamone la definizione formale.

**Definizione**. Un funtore è una coppia `(F, map)` ove:

- `F` è un type constructor `n`-ario (`n >= 1`) che mappa ogni tipo `X` in un tipo `F<X>` (**mappa tra oggetti**)
- `map` è una funzione con la seguente firma:

```ts
map: <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>)
```

che mappa ciascuna funzione `f: (a: A) => B` in una funzione `map(f): (fa: F<A>) => F<B>` (**mappa tra morfismi**)

Devono valere le seguenti proprietà:

- `map(1`<sub>X</sub>`)` = `1`<sub>F(X)</sub> (**le identità vanno in identità**)
- `map(g ∘ f) = map(g) ∘ map(f)` (**l'immagine di una composizione è la composizione delle immagini**)

**Demo**

[`04_functor.ts`](src/04_functor.ts)

## I funtori compongono

I funtori compongono, ovvero dati due funtori `F` e `G`, allora la composizione `F<G<A>>` è ancora un funtore e la `map` della composizione è la composizione delle `map`

**Esempio**

```ts
import { flow } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/ReadonlyArray'

export interface ReadonlyArrayOption<A> extends ReadonlyArray<O.Option<A>> {}

export const map: <A, B>(
  f: (a: A) => B
) => (fa: ReadonlyArrayOption<A>) => ReadonlyArrayOption<B> = flow(O.map, A.map)
```

## Funtori controvarianti

Prima di procedere voglio mostrarvi una variante del concetto di funtore che abbiamo visto nella sezione precedente: i **funtori controvarianti**.

Ad essere pignoli infatti quelli che abbiamo chiamato semplicemente "funtori" dovrebbero essere più propriamente chiamati **funtori covarianti**.

La definizione di funtore controvariante è del tutto analoga a quella di funtore covariante, eccetto per la firma della sua operazione fondamentale (che viene chiamata `contramap` invece di `map`)

```ts
import { HKT } from 'fp-ts/HKT'

// funtore covariante
export interface Functor<F> {
  readonly map: <A, B>(f: (a: A) => B) => (fa: HKT<F, A>) => HKT<F, B>
}

// funtore controvariante
export interface Contravariant<F> {
  readonly contramap: <B, A>(f: (b: B) => A) => (fa: HKT<F, A>) => HKT<F, B>
}
```

**Nota**: il tipo `HKT` è il modo in cui `fp-ts` rappresenta un generico type constructor (una tecnica proposta nel paper [Lightweight higher-kinded polymorphism](https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf)) perciò quando vedete `HKT<F, X>` potete pensarlo come al type constructor `F` applicato al tipo `X` (ovvero `F<X>`).

Vi ricordo che abbiamo già visto due tipi notevoli che ammettono una istanza di funtore controvariante: `Eq` e `Ord`.

## Funtori in `fp-ts`

Come facciamo a definire una istanza di funtore in `fp-ts`? Vediamo qualche esempio pratico.

La seguente dichiarazione definisce il modello di una risposta di una chiamata ad una API:

```ts
interface Response<A> {
  readonly url: string
  readonly status: number
  readonly headers: Record<string, string>
  readonly body: A
}
```

Notate che il campo `body` è parametrico, questo fatto rende `Response` un buon candidato per cercare una istanza di funtore dato che `Response` è un type constructor `n`-ario con `n >= 1` (una condizione necessaria).

Per poter definire una istanza di funtore per `Response` dobbiamo definire una funzione `map` insieme ad alcuni [dettagli tecnici](https://gcanti.github.io/fp-ts/recipes/HKT.html) resi necessari da `fp-ts`.

```ts
// `Response.ts` module

import { Functor1 } from 'fp-ts/Functor'

export type URI = 'Response'

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Response: Response<A>
  }
}

export interface Response<A> {
  readonly url: string
  readonly status: number
  readonly headers: Record<string, string>
  readonly body: A
}

export const map = <A, B>(f: (a: A) => B) => (fa: Response<A>): Response<B> => ({
  ...fa,
  body: f(fa.body)
})

// functor instance for `Response<A>`
export const Functor: Functor1<URI> = {
  map
}
```

## I funtori risolvono il problema centrale?

Non ancora. I funtori ci permettono di comporre un programma con effetti `f` con un programma puro `g`, ma `g` deve essere una funzione **unaria**, ovvero una funzione che accetta un solo argomento. Cosa succede se `g` accetta due o più argomenti?

| Program f | Program g               | Composition   |
| --------- | ----------------------- | ------------- |
| pure      | pure                    | `g ∘ f`       |
| effectful | pure (unary)            | `map(g) ∘ f` |
| effectful | pure (`n`-ary, `n > 1`) | ?             |

Per poter gestire questa circostanza abbiamo bisogno di qualcosa in più, nel prossimo capitolo vedremo un'altra importante astrazione della programmazione funzionale: i **funtori applicativi**.

# Funtori applicativi

Nella sezione riguardante i funtori abbiamo visto che possiamo comporre un programma con effetti `f: (a: A) => F<B>` con un programma puro `g: (b: B) => C` tramite una trasformazione di `g` in una funzione `map(g): (fb: F<B>) => F<C>`, ammesso che `F` ammetta una istanza di funtore.

| Program f | Program g    | Composition   |
| --------- | ------------ | ------------- |
| pure      | pure         | `g ∘ f`       |
| effectful | pure (unary) | `map(g) ∘ f` |

Tuttavia `g` deve essere unaria, ovvero deve accettare un solo parametro in input. Che succede se `g` accetta due parametri? Possiamo ancora trasformare `g` usando solo l'istanza di funtore? Proviamoci!

## Currying

Prima di tutto dobbiamo modellare una funzione che accetta due parametri, diciamo di tipo `B` e `C` (possiamo usare una tupla per questo) e restituisce un valore di tipo `D`:

```ts
g: (bc: [B, C]) => D
```

Possiamo riscrivere `g` usando una tecnica chiamata **currying**.

> Currying is the technique of translating the evaluation of a function that takes multiple parameters into evaluating a sequence of functions, **each with a single parameter**. For example, a function that takes two parameters, one from `B` and one from `C`, and produces outputs in `D`, by currying is translated into a function that takes a single parameter from `C` and produces as outputs functions from `B` to `C`.

(source: [currying on wikipedia.org](https://en.wikipedia.org/wiki/Currying))

Perciò, tramite currying, possiamo riscrivere `g` come:

```ts
g: (b: B) => (c: C) => D
```

Quello che vogliamo è una trasformazione, chiamiamola `liftA2` per distinguerla dalla nostra vecchia `map` dei funtori, che restituisca una funzione con la seguente firma

```ts
liftA2(g): (fb: F<B>) => (fc: F<C>) => F<D>
```

<img src="images/liftA2.png" width="500" alt="liftA2" />

Come facciamo ad ottenerla? Siccome `g` è unaria, possiamo usare l'istanza di funtore e la nostra vecchia `map`:

```ts
map(g): (fb: F<B>) => F<(c: C) => D>
```

<img src="images/liftA2-first-step.png" width="500" alt="liftA2 (first step)" />

Ma ora siamo bloccati: non c'è alcuna operazione legale fornita dall'istanza di funtore che ci permette di "spacchettare" il tipo `F<(c: C) => D>` nel tipo `(fc: F<C>) => F<D>`.

## L'astrazione `Apply`

Introduciamo perciò una nuova astrazione `Apply` che possiede una tale operazione di spacchettamento (chiamata `ap`):

```ts
export interface Apply<F> extends Functor<F> {
  readonly ap: <C>(fa: HKT<F, C>) => <D>(fab: HKT<F, (c: C) => D>) => HKT<F, D>
}
```

**Nota**. Come mai il nome "ap"? Perché può essere vista come una sorta di applicazione di funzione

```ts
// `apply` applica una funzione ad un valore
const apply = <A, B>(f:     (a: A) => B)  => (a:    A):    B  => f(a)

const ap =    <A, B>(fab: F<(a: A) => B>) => (fa: F<A>): F<B> => ...
// `ap` applica una funzione racchiusa in un contesto ad un valore racchiuso in un contesto
```


Ora, data una istanza di `Apply` per un certo type constructor `F`, possiamo definire `liftA2`?

```ts
import { HKT } from 'fp-ts/HKT'
import { Apply } from 'fp-ts/Apply'
import { pipe } from 'fp-ts/lib/function'

type Curried2<B, C, D> = (b: B) => (c: C) => D

const liftA2 = <F>(F: Apply<F>) => <B, C, D>(
  g: Curried2<B, C, D>
): Curried2<HKT<F, B>, HKT<F, C>, HKT<F, D>> => (fb) => (fc) =>
  pipe(fb, F.map(g), F.ap(fc))
```

Vediamo qualche esempio pratico:

**Esempio** (`F = ReadonlyArray`)

```ts
import { flow, pipe } from 'fp-ts/function'
import { Apply1 } from 'fp-ts/lib/Apply'
import * as A from 'fp-ts/ReadonlyArray'

export const Apply: Apply1<A.URI> = {
  ...A.Functor,
  ap: <A>(fa: ReadonlyArray<A>) => <B>(fab: ReadonlyArray<(a: A) => B>) => {
    const out: Array<B> = []
    for (const f of fab) {
      for (const a of fa) {
        out.push(f(a))
      }
    }
    return out
  }
}

type Curried2<B, C, D> = (b: B) => (c: C) => D

const liftA2 = <B, C, D>(
  g: Curried2<B, C, D>
): Curried2<ReadonlyArray<B>, ReadonlyArray<C>, ReadonlyArray<D>> => (fb) => (
  fc
) => pipe(fb, Apply.map(g), Apply.ap(fc))

declare const f: (a: string) => ReadonlyArray<number>
declare const g: (b: number) => (c: boolean) => Date

// const h: (a: string) => (c: ReadonlyArray<boolean>) => ReadonlyArray<Date>
const h = flow(f, liftA2(g))
```

**Esempio** (`F = Option`)

```ts
import { flow, pipe } from 'fp-ts/function'
import { Apply1 } from 'fp-ts/lib/Apply'
import * as O from 'fp-ts/Option'

export const Apply: Apply1<O.URI> = {
  ...O.Functor,
  ap: (fa) => (fab) =>
    O.isSome(fab) && O.isSome(fa) ? O.some(fab.value(fa.value)) : O.none
}

type Curried2<B, C, D> = (b: B) => (c: C) => D

const liftA2 = <B, C, D>(
  f: Curried2<B, C, D>
): Curried2<O.Option<B>, O.Option<C>, O.Option<D>> => (fb) => (fc) =>
  pipe(fb, Apply.map(f), Apply.ap(fc))

declare const f: (a: string) => O.Option<number>
declare const g: (b: number) => (c: boolean) => Date

// const h: (a: string) => (c: O.Option<boolean>) => O.Option<Date>
const h = flow(f, liftA2(g))
```

**Esempio** (`F = Task`)

```ts
import { flow, pipe } from 'fp-ts/function'
import { Apply1 } from 'fp-ts/lib/Apply'
import * as T from 'fp-ts/Task'

export const Apply: Apply1<T.URI> = {
  ...T.Functor,
  ap: (fa) => (fab) => () => Promise.all([fab(), fa()]).then(([f, a]) => f(a))
}

type Curried2<B, C, D> = (b: B) => (c: C) => D

const liftA2 = <B, C, D>(
  f: Curried2<B, C, D>
): Curried2<T.Task<B>, T.Task<C>, T.Task<D>> => (fb) => (fc) =>
  pipe(fb, Apply.map(f), Apply.ap(fc))

declare const f: (a: string) => T.Task<number>
declare const g: (b: number) => (c: boolean) => Date

// const h: (a: string) => (c: T.Task<boolean>) => T.Task<Date>
const h = flow(f, liftA2(g))
```

Abbiamo visto che con una istanza di `Apply` possiamo gestire funzioni con due parametri, ma che succede con le funzioni che accettano **tre** parametri? Abbiamo bisogno di *un'altra astrazione ancora*?

La buona notizia è che la risposta è no, `Apply` è sufficiente:

```ts
import { pipe } from 'fp-ts/function'
import { HKT } from 'fp-ts/HKT'
import { Apply } from 'fp-ts/lib/Apply'

type Curried3<B, C, D, E> = (b: B) => (c: C) => (d: D) => E

const liftA3 = <F>(F: Apply<F>) => <B, C, D, E>(
  g: Curried3<B, C, D, E>
): Curried3<HKT<F, B>, HKT<F, C>, HKT<F, D>, HKT<F, E>> => {
  return (fb) => (fc) => (fd) => pipe(fb, F.map(g), F.ap(fc), F.ap(fd))
}
```

In realtà data una istanza di `Apply` possiamo scrivere con lo stesso pattern una funzione `liftAn`, per **qualsiasi** `n >= 1`!

**Nota**. `liftA1` non è altro che `map`, l'operazione fondamentale di `Functor`.

```ts
import { HKT } from 'fp-ts/HKT'
import { Apply } from 'fp-ts/Apply'

const liftA1 = <F>(
  F: Apply<F>
): (<B, C>(g: (b: B) => C) => (fb: HKT<F, B>) => HKT<F, C>) => F.map
```

Ora possiamo aggiornare la nostra "tabella di composizione":

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |

ove `liftA1 = map`

## L'astrazione `Applicative`

Ora sappiamo che se possediamo un valore di tipo `F<(a: A) => B>` e un valore di tipo `F<A>` possiamo ottenere un valore di tipo `F<B>`. Ma che succede se invece di un valore di tipo `F<A>` abbiamo un valore di tipo `A`?

Sarebbe utile un'operazione che sia in grado di trasformare un valore di tipo `A` in un valore di tipo `F<A>`, in modo che si possa poi usare `ap`.

Introduciamo perciò l'astrazione `Applicative` che arricchisce `Apply` con una tale operazione (chiamata `of`):

```ts
interface Applicative<F> extends Apply<F> {
  readonly of: <A>(a: A) => HKT<F, A>
}
```

In letteratura si parla di **funtori applicativi** per i type constructor che ammettono una istanza di `Applicative`.

Vediamo qualche esempio pratico:

**Esempio** (`F = ReadonlyArray`)

```ts
import { Applicative1 } from 'fp-ts/lib/Applicative'
import * as A from 'fp-ts/ReadonlyArray'

export const Applicative: Applicative1<A.URI> = {
  ...A.Apply,
  of: (a) => [a]
}

import { pipe } from 'fp-ts/function'

const sum = (a: number) => (b: number): number => a + b

console.log(pipe(Applicative.of(sum), Applicative.ap([1]), Applicative.ap([2]))) // => [3]
```

**Esempio** (`F = Option`)

```ts
import { Applicative1 } from 'fp-ts/lib/Applicative'
import * as O from 'fp-ts/Option'

export const Applicative: Applicative1<O.URI> = {
  ...O.Apply,
  of: O.some
}

import { pipe } from 'fp-ts/function'

const sum = (a: number) => (b: number): number => a + b

console.log(
  pipe(
    Applicative.of(sum),
    Applicative.ap(O.some(1)),
    Applicative.ap(O.some(2))
  )
) // => O.some(3)
```

**Esempio** (`F = Task`)

```ts
import { Applicative1 } from 'fp-ts/lib/Applicative'
import * as T from 'fp-ts/Task'

export const Applicative: Applicative1<T.URI> = {
  ...T.ApplyPar,
  of: (a) => () => Promise.resolve(a)
}

import { pipe } from 'fp-ts/function'

const sum = (a: number) => (b: number): number => a + b

pipe(
  Applicative.of(sum),
  Applicative.ap(() => Promise.resolve(1)),
  Applicative.ap(() => Promise.resolve(2))
)().then(console.log) // => 3
```

**Demo**

[`05_applicative.ts`](src/05_applicative.ts)

## I funtori applicativi compongono

I funtori applicativi compongono, ovvero dati due funtori applicativi `F` e `G`,
allora la loro composizione `F<G<A>>` è ancora un funtore applicativo.

**Esempio**

```ts
import * as A from 'fp-ts/ReadonlyArray'
import * as O from 'fp-ts/Option'
import { flow } from 'fp-ts/function'

export interface ReadonlyArrayOption<A> extends ReadonlyArray<O.Option<A>> {}

export const Applicative = {
  map: flow(O.map, A.map),
  of: flow(O.of, A.of),
  ap: <A>(
    fa: ReadonlyArrayOption<A>
  ): (<B>(fab: ReadonlyArrayOption<(a: A) => B>) => ReadonlyArrayOption<B>) =>
    flow(
      A.map((gab) => (ga: O.Option<A>) => O.ap(ga)(gab)),
      A.ap(fa)
    )
}
```

## I funtori applicativi risolvono il problema centrale?

Non ancora. C'è ancora un ultimo importante caso da considerare: quando **entrambi** i programmi sono con effetti.

Ancora una volta abbiamo bisogno di qualche cosa in più, nel capitolo seguente parleremo di una delle astrazioni più importanti in programmazione funzionale: le **monadi**.

# Monadi

<center>
<img src="images/moggi.jpg" width="300" alt="Heinrich Kleisli" />

(Eugenio Moggi is a professor of computer science at the University of Genoa, Italy. He first described the general use of monads to structure programs)

<img src="images/wadler.jpg" width="300" alt="Heinrich Kleisli" />

(Philip Lee Wadler is an American computer scientist known for his contributions to programming language design and type theory)
</center>

Nell'ultimo capitolo abbiamo visto che possiamo comporre un programma con effetti `f: (a: A) => M<B>` con un programma `n`-ario puro `g`, ammesso che `M` ammetta una istanza di funtore applicativo:

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |

ove `liftA1 = lift`

Tuttavia dobbiamo risolvere un ultimo (e frequente) caso: quando **entrambi** i programmi sono con effetto.

```ts
f: (a: A) => M<B>
g: (b: B) => M<C>
```

Qual'è la composizione di `f` e `g`?

Per poter gestire questo ultimo caso abbiamo bisogno di qualcosa di più potente di `Functor` dato che è piuttosto semplice ritrovarsi con contesti innestati.

## Il problema dei contesti innestati

Per mostrare meglio perché abbiamo bisogno di qualcosa in più, vediamo qualche esempio pratico.

**Esempio** (`M = Array`)

Supponiamo di voler ricavare i follower dei follower di un utente Twitter:

```ts
import { pipe } from 'fp-ts/function'
import * as A from 'fp-ts/ReadonlyArray'

interface User {
  readonly followers: ReadonlyArray<User>
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers

declare const user: User

const followersOfFollowers: ReadonlyArray<ReadonlyArray<User>> = pipe(
  user,
  getFollowers,
  A.map(getFollowers)
)
```

C'è qualcosa che non va, `followersOfFollowers` ha tipo `ReadonlyArray<ReadonlyArray<User>>` ma noi vorremmo `ReadonlyArray<User>`.

Abbiamo bisogno di appiattire (**flatten**) gli array innestati.

La funzione `flatten: <A>(mma: ReadonlyArray<ReadonlyArray<A>>) => ReadonlyArray<A>` esportata da `fp-ts` fa al caso nostro:

```ts
const followersOfFollowers: ReadonlyArray<User> = pipe(
  user,
  getFollowers,
  A.map(getFollowers),
  A.flatten
)
```

Bene! Vediamo con un'altra struttura dati:

**Esempio** (`M = Option`)

Supponiamo di voler calcolare il reciproco del primo elemento di un array numerico:

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/ReadonlyArray'

const inverse = (n: number): O.Option<number> =>
  n === 0 ? O.none : O.some(1 / n)

const inverseHead: O.Option<O.Option<number>> = pipe(
  [1, 2, 3],
  A.head,
  O.map(inverse)
)
```

Opss, è successo di nuovo, `inverseHead` ha tipo `Option<Option<number>>` ma noi vogliamo `Option<number>`.

Abbiamo bisogno di appiattire le `Option` innestate.

La funzione `flatten: <A>(mma: Option<Option<A>>) => Option<A>` esportata da `fp-ts` fa al caso nostro:

```ts
const inverseHead: O.Option<number> = pipe(
  [1, 2, 3],
  A.head,
  O.map(inverse),
  O.flatten
)
```

Tutte quelle funzioni `flatten`... Non sono una coincidenza, c'è un pattern funzionale dietro le quinte: ambedue i type constructor `ReadonlyArray` e `Option` (e molti altri) ammettono una **istanza di monade** e

> `flatten` is the most peculiar operation of monads

Dunque cos'è una monade?

Ecco come spesso sono presentate...

## Definizione di monade

**Definizione**. Una monade è definita da tre cose:

(1) un type constructor `M` che ammette una istanza di funtore

(2) una funzione `of` con la seguente firma:

```ts
of: <A>(a: A) => HKT<M, A>
```

(3) una funzione `chain` (possibile sinonimo **flatMap**) con la seguente firma:

```ts
chain: <A, B>(f: (a: A) => HKT<M, B>) => ((ma: HKT<M, A>) => HKT<M, B>)
```

**Nota**: ricordiamo che il tipo `HKT` è il modo in cui `fp-ts` rappresenta un generico type constructor, perciò quando vedete`HKT<M, X>` potete pensare al type constructor `M` applicato al tipo `X` (ovvero `M<X>`).

Le funzioni `of` e `chain` devono obbedire a tre leggi:

- `chain(of) ∘ f = f` (**Left identity**)
- `chain(f) ∘ of = f` (**Right identity**)
- `chain(h) ∘ (chain(g) ∘ f) = chain((chain(h) ∘ g)) ∘ f` (**Associativity**)

ove `f`, `g`, `h` sono tutte funzioni con effetto e `∘` è l'usuale composizione di funzioni.

Quando vidi per la prima volta questa definizione la mia prima reazione fu di sconcerto.

Avevo in testa molte domande:

- perché proprio quelle due operazioni e perché hanno quella firma?
- come mai il nome "flatMap"?
- perché devono valere quelle leggi? Che cosa significano?
- ma soprattutto, dov'è la mia `flatten`?

Questo capitolo cercherà di rispondere a tutte queste domande.

Ora torniamo al nostro problema centrale: che cos'è la composizione di due funzioni `f` e `g` con effetto?

<img src="images/kleisli_arrows.png" alt="two Kleisli arrows, what's their composition?" width="450px" />

<center>(due Kleisli arrow)</center>

**Nota**. Una funzione con effetto è anche chiamata **Kleisli arrow**.

Per ora non so nemmeno che **tipo** abbia una tale composizione.

Un momento... abbiamo già incontrato una astrazione che parla specificatamente di composizione. Vi ricordate cosa ho detto a proposito delle categorie?

> Categories capture the essence of composition

Possiamo trasformare il nostro problema in un problema categoriale, ovvero: possiamo trovare una categoria che modella la composizione delle Kleisli arrows?

## La categoria di Kleisli

<center>
<img src="images/kleisli.jpg" width="300" alt="Heinrich Kleisli" />

(Heinrich Kleisli, Swiss mathematician)
</center>

Cerchiamo di costruire una categoria *K* (chiamata **categoria di Kleisli**) che contenga *solo* Kleisli arrow:

- gli **oggetti** sono gli stessi oggetti della categoria *TS*, ovvero tutti i tipi di TypeScript.
- i **morfismi** sono costruiti così: ogni volta che c'è una Kleisli arrow `f: A ⟼ M<B>` in _TS_ tracciamo una freccia `f': A ⟼ B` in _K_

<center>
<img src="images/kleisli_category.png" alt="above the TS category, below the K construction" width="400px" />

(sopra la categoria _TS_, sotto la costruzione di _K_)
</center>

Dunque cosa sarebbe la composizione di `f` e `g` in *K*? E' la freccia rossa chiamata `h'` nell'immagine qui sotto:

<center>
<img src="images/kleisli_composition.png" alt="above the composition in the TS category, below the composition in the K construction" width="400px" />

(sopra la categoria _TS_, sotto la costruzione di _K_)
</center>

Dato che `h'` è una freccia che va da `A` a `C` in `K`, possiamo far corrispondere una funzione `h` che va da `A` a `M<C>` in `TS`.

Quindi un buon candidato per la composizione di `f` e `g` in *TS* è ancora una Kleisli arrow con la seguente firma: `(a: A) => M<C>`.

Come facciamo a costruire concretamente una tale funzione? Beh, proviamoci!

## Definizione di `chain` passo dopo passo

Il punto (1) della definizione di monade ci dice che `M` ammette una istanza di funtore, percò possiamo usare `map` per trasformare la funzione `g: (b: B) => M<C>` in una funzione `map(g): (mb: M<B>) => M<M<C>>`

<center>
<img src="images/flatMap.png" alt="where chain comes from" width="450px" />

(come ottenere la funzione `h`)
</center>

Ma ora siamo bloccati: non c'è alcuna operazione legale della istanza di funtore che ci permette di appiattire un valore di tipo `M<M<C>>` in un valore di tipo `M<C>`, abbiamo bisogno di una operazione addizionale, chiamiamola `flatten`.

Se riusciamo a definire una tale operazione allora possiamo ottenere la composizione che stavamo cercando:

```
h = flatten ∘ map(g) ∘ f
```

Ma aspettate... contraendo `flatten ∘ map(g)` otteniamo "flatMap", ecco da dove viene il nome!

Dunque possiamo ottenere `chain` in questo modo

```
chain = flatten ∘ map(g)
```

<center>
<img src="images/chain.png" alt="come agisce `chain` sulla funzione `g`" width="400px" />

(come agisce `chain` sulla funzione `g`)
</center>

Ora possiamo aggiornare la nostra "tabella di composizione"

| Program f | Program g     | Composition      |
| --------- | ------------- | ---------------- |
| pure      | pure          | `g ∘ f`          |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f`  |
| effectful | effectful     | `chain(g) ∘ f` |

ove `liftA1 = map`

E per quanto riguarda l'operazione `of`? Ebbene, `of` proviene dai morfismi identità in *K*: per ogni morfismo identità 1<sub>A</sub> in _K_ deve esserci una corrispondente funzione da `A` a `M<A>` (ovvero `of: <A>(a: A) => M<A>`).

<center>
<img src="images/of.png" alt="where of comes from" width="300px" />

(come ottenere `of`)
</center>

Ultima domanda: da dove nascono le leggi? Esse non sono altro che le leggi categoriali in *K* tradotte in *TS*:

| Law            | _K_                               | _TS_                                                    |
| -------------- | --------------------------------- | ------------------------------------------------------- |
| Left identity  | 1<sub>B</sub> ∘ `f'` = `f'`       | `chain(of) ∘ f = f`                                     |
| Right identity | `f'` ∘ 1<sub>A</sub> = `f'`       | `chain(f) ∘ of = f`                                     |
| Associativity  | `h' ∘ (g' ∘ f') = (h' ∘ g') ∘ f'` | `chain(h) ∘ (chain(g) ∘ f) = chain((chain(h) ∘ g)) ∘ f` |

TODO qualche esempio di istanze di `Monad`...

Se adesso torniamo agli esempi che mostravano il problema con i contesti innestati possiamo risolverli usando `chain`:

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/ReadonlyArray'

interface User {
  readonly followers: ReadonlyArray<User>
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers

declare const user: User

const followersOfFollowers: ReadonlyArray<User> = pipe(
  user,
  getFollowers,
  A.chain(getFollowers)
)

const inverse = (n: number): O.Option<number> =>
  n === 0 ? O.none : O.some(1 / n)

const inverseHead: O.Option<number> = pipe([1, 2, 3], A.head, O.chain(inverse))
```

## Manipolazione di programmi

Vediamo ora come, grazie alla trasparenza referenziale e al concetto di monade, possiamo manipolare i programmi programmaticamente.

Ecco un piccolo programma che legge / scrive su un file

```ts
import { log } from 'fp-ts/Console'
import { IO, chain } from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'
import * as fs from 'fs'

//
// funzioni di libreria
//

const readFile = (filename: string): IO<string> => () =>
  fs.readFileSync(filename, 'utf-8')

const writeFile = (filename: string, data: string): IO<void> => () =>
  fs.writeFileSync(filename, data, { encoding: 'utf-8' })

//
// programma
//

const program1 = pipe(
  readFile('file.txt'),
  chain(log),
  chain(() => writeFile('file.txt', 'hello')),
  chain(() => readFile('file.txt')),
  chain(log)
)
```

L'azione:

```ts
pipe(
  readFile('file.txt'),
  chain(log)
)
```

è ripetuta due volte nel programma, ma dato che vale la trasparenza referenziale possiamo mettere a fattor comune l'azione assegnandone l'espressione ad una costante.

```ts
const read = pipe(readFile('file.txt'), chain(log))

const program2 = pipe(
  read,
  chain(() => writeFile('file.txt', 'hello')),
  chain(() => read)
)
```

Possiamo persino definire un combinatore e sfruttarlo per rendere più compatto il codice:

```ts
const interleave = <A, B>(a: IO<A>, b: IO<B>): IO<A> =>
  pipe(
    a,
    chain(() => b),
    chain(() => a)
  )

const program3 = interleave(read, writeFile('file.txt', 'foo'))
```

Un altro esempio: implementare una funzione simile a `time` di Unix (la parte relativa al tempo di esecuzione reale) per `IO`.

```ts
import * as IO from 'fp-ts/IO'
import { now } from 'fp-ts/Date'
import { log } from 'fp-ts/Console'
import { pipe } from 'fp-ts/function'

export const time = <A>(ma: IO.IO<A>): IO.IO<A> =>
  pipe(
    now,
    IO.chain((start) =>
      pipe(
        ma,
        IO.chain((a) =>
          pipe(
            now,
            IO.chain((end) =>
              pipe(
                log(`Elapsed: ${end - start}`),
                IO.map(() => a)
              )
            )
          )
        )
      )
    )
  )
```

Esempio di utilizzo

```ts
import * as IO from 'fp-ts/IO'
import { randomInt } from 'fp-ts/Random'
import { Monoid, concatAll } from 'fp-ts/Monoid'
import { replicate } from 'fp-ts/ReadonlyArray'
import { pipe } from 'fp-ts/function'
import { log } from 'fp-ts/Console'

const fib = (n: number): number => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2))

const printFib: IO.IO<void> = pipe(
  randomInt(30, 35),
  IO.chain((n) => log([n, fib(n)]))
)

const monoidIO: Monoid<IO.IO<void>> = {
  concat: (second) => (first) => () => {
    first()
    second()
  },
  empty: IO.of(undefined)
}

const replicateIO = (n: number, mv: IO.IO<void>): IO.IO<void> =>
  concatAll(monoidIO)(replicate(n, mv))

time(replicateIO(3, printFib))()
/*
[ 31, 2178309 ]
[ 33, 5702887 ]
[ 30, 1346269 ]
Elapsed: 89
*/
```

Stampando anche i parziali

```ts
time(replicateIO(3, time(printFib)))()
/*
[ 33, 5702887 ]
Elapsed: 54
[ 30, 1346269 ]
Elapsed: 13
[ 32, 3524578 ]
Elapsed: 39
Elapsed: 106
*/
```

**Demo**

[`06_game.ts`](src/06_game.ts)
