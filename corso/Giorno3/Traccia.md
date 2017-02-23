# Programma

Giorno III

- Come si gestiscono i side effect?
- Monadi
  - A cosa servono e definizione
  - Capire le monadi attraverso le categorie di Kleisli
- Hands on
  - definiamo e implementiamo le monadi più comuni

# Come si gestiscono i side effect?

A parte alcune tipologie di programmi come i compilatori, che possono essere pensato come pure (entra del codice => esce altro codice), quasi tutti i programmi che scriviamo per essere utili devono avere side effect.

L'unica alternativa per descrivere una funzione non pura è modellarla con una funzione pura, ci sono due modi per farlo:

1) modo dichiarativo: la funzione restituisce, oltre che al normale valore, anche una descrizione dell'effetto

Questa è una funzione impura

```ts
function sum(a: number, b: number): number {
  console.log(a, b) // <= side effect
  return a + b
}
```

per modellarla come funzione pura modifico il codominio e restituisco una descrizione del side effect

```ts
function sum(a: number, b: number): [number, string] {
  return [a + b, `log: ${a}, ${b}`]
}
```

fondamentalmente si crea un DSL per gli effetti.

2) modo lazy: la computazione viene racchiusa bel body di una funzione

```ts
function sum(a: number, b: number): () => number {
  return () => {
    console.log(a, b)
    return a + b
  }
}
```

Dunque la procedura non esegue immediatamente il side effect ma resituisce un valore che ne rappresenta il contenuto. Analogamente `Promise<A>` rappresenta un valore che sarà a disposizione nel funturo.

Introduciamo un type alias per rendere più esplicito il fatto che la funzione restituisce una "azione"

```ts
type IO<A> = () => A;

function sum(a: number, b: number): IO<number> {
  return () => {
    console.log(a, b)
    return a + b
  }
}
```

In questo modo siamo riusciti a codificare il concetto astratto di procedura che esegue side effect nel type system.

Vediamo un altro esempio: leggere e scrivere sul `localStorage`

```ts
function read(name: string): IO<string | undefined> {
  return () => localStorage.getItem(name)
}

function write(name: string, value: string): IO<void> {
  return () => localStorage.setItem(name, value)
}
```

Ritorneremo più avanti a occuparci di `IO` dato che è possibile associare una istanza di *monade*.

In programmazione funzionale si tende a spingere la descrizione dei side effect al confine del sistema (la funzione `main`) e solo allora vengono eseguiti da un interprete.

```
system = pure core + imperative shell
```

Nei linguaggi *puramente* funzionali (come Haskell o PureScript) questo schema è imposto dal linguaggio stesso.

> Un intero programma che produce un valore di tipo `A` è rappresentato da una funzione il cui codominio è `IO<A>`

La programmazione funzionale ci suggerisce che un intero programma può essere modellato con una funzione

```ts
function main(world: World): World {
  ...
}
```

Come faccio (teoricamente) a modellare lo stato? Con un ciclo

```ts
const w1: World = ...
const w2 = main(w1)
const w3 = main(w2)
...
```

Come faccio a scrivere la funzione `main`? Davvero si pretende di scrivere tutta l'applicazione in una unica funzione?

E' possibile applicare la tecnica: "divide et impera": ovvero decomporre un problema in sotto problemi più piccoli, per poi ricomporre le soluzioni trovate per i sotto problemi

Cosa c'è di nuovo però? Il fatto che in programmazione funzionale come decomporre e come ricomporre il problema non è lasciato all'istinto del programmatore: la metodologia suggerita è quella di descrivere il programma tramite strutture algebriche (monoidi, categorie, funtori, etc...) che godono di buone proprietà di composizione.

**Ma che due funzioni compongano è un evento raro!**

Il dominio di `f` **deve** essere il codominio di `g`

```
g: A -> B
f: B -> C
```

Ma in generale non è così.

E in particolare non sappiamo ancora come comporre i side effect

```ts
function head<A>(as: Array<A>): Maybe<A> {
  return new Maybe(as.length ? as[0] : null)
}

const inverse = (n: number): Maybe<number> => new Maybe(n !== 0 ? 1 / n : null)

// program :: Maybe<Maybe<number>>
const program = head([2, 3]).map(inverse)
```

Qui il risultato è incapsulato due volte in un `Maybe`, circostanza affatto desiderabile. Vediamo se è possibile definire una funzione che "appiattisce" il risultato, chiamiamola `flatten`

```ts
export class Maybe<A> {
  value: A | null;
  constructor(value: A | null) {
    this.value = value
  }
  map<B>(f: (a: A) => B): Maybe<B> {
    return this.value == null ? none : new Maybe(f(this.value))
  }
  inspect() {
    return `Maybe(${this.value})`
  }
  fold<B>(f: () => B, g: (a: A) => B) {
    return this.value == null ? f() : g(this.value)
  }
  static flatten<B>(mmb: Maybe<Maybe<B>>): Maybe<B> {
    return mmb.fold(() => none, m => m)
  }
}

export const none: Maybe<any> = new Maybe(null)

// program :: Maybe<number>
const program = Maybe.flatten(head([2, 3]).map(inverse))
```

Vediamo un altro esempio: scrivere la funzione `echo` in stile funzionale

```ts
export class IO<A> {
  constructor(private value: () => A) {}
  run(): A {
    return this.value()
  }
  map<B>(f: (a: A) => B): IO<B> { // <= IO è un funtore
    return new IO(() => f(this.run()))
  }
}

function getLine(): IO<string> {
  return new IO(() => process.argv[2])
}

function putStrLn(s: string): IO<void> {
  return new IO(() => console.log(s))
}

// program :: IO<IO<void>>
const program = getLine().map(putStrLn)
```

Anche in questo caso possiamo definire una funzione `flatten`

```ts
flatten<B>(mmb: IO<IO<B>>): IO<B> {
  return mmb.run()
}

// program :: IO<void>
const program = IO.flatten(getLine().map(putStrLn))

program.run()
```

Cosa dire di `Either`, `Array` e gli altri funtori? E' possibile individuare un nuovo pattern funzionale?

Si, ma ci occorre una nuova astrazione: le monadi.

# Monadi

## Un po' di storia

**Philip Wadler**

Philip Lee "Phil" Wadler is an American computer scientist known for his contributions to programming language design and type theory

![Philip Wadler](https://dreamsongs.com/OOPSLA2007/Photos/Impressions%20Pix/wadler.gif)

**Eugenio Moggi**

Eugenio Moggi is a professor of computer science at the University of Genoa, Italy. He first described the general use of monads to structure programs

![Eugenio Moggi](http://4.bp.blogspot.com/--bnwGqunTcQ/Vfuly4Mkm0I/AAAAAAAADQI/wXt-DDDWXCY/s1600/Eugenio%2B-%2BPhoto.jpg)

**Saunders Mac Lane**

![Saunders Mac Lane](https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Saunders_MacLane.jpg/220px-Saunders_MacLane.jpg)

**Samuel Eilenberg**

![Samuel Eilenberg](https://gilkalai.files.wordpress.com/2008/12/eilenberg.jpg)

## Digressione: un mito sulle monadi

> Le monadi incorporano l'essenza di una computazione sequenziale

No. E' la composizione di funzioni che incorpora l'essenza di sequenzialità

```js
const x1 = ...
const x2 = g(x1)
const x3 = f(x2)

const x3 = f(g(x1)) = compose(f, g)(x1)
```

# Definizione

Una monade `M` è un (endo)funtore con due operazioni in più (oltre a `map`)

```ts
interface Monad<M<?>> { // <= fantasy syntax
  of<A>(a: A): M<A> // static
  chain<A, B>(f: (a: A) => M<B>, ma: M<A>): M<B>
}
```

Inoltre devono valere le seguenti leggi:

- Left identity: `chain(of, u) = u`
- Right identity: `chain(f, of(a)) = f(a)`
- Associativity: `chain(g, chain(f, u)) = chain(x => chain(g, f(x)), u)`

Nota.

- sinonimi di `of` sono `return` (Haskell o PureScript), `pure` (Scala), `point`
- sinonimi di `chain` sono `bind` (Haskell o PureScript), `flatMap` (Scala).

Domande:

- perchè ci sono esattamente due funzioni `of` e `chain`?
- perchè hanno quelle firme?
- perchè devono valere quelle leggi?

Per avere una risposta a queste domande possiamo introdurre un concetto equivalente a quello di monade: la categorie di Kleisli.

# Categorie di Kleisli

Heinrich Kleisli was a Swiss mathematician. He is the namesake of several constructions in category theory, including the Kleisli category and Kleisli triples.

![Kleisli](https://upload.wikimedia.org/wikipedia/commons/5/5a/Heinrich-Kleisli-1987.jpeg)

Sia `F` un endofuntore sulla categoria `C` e si considerino i due morfismi `g: A -> F[B]`, `f: B -> F[C]`

```
     F[B]   F[C]
    /      /
 g /    f /
  /      /
 /      /
A      B      C
```

Chiamiamo i morfismi come `g` ed `f` (ovvero il cui target è l'immagine di `F`) *Kleisli arrows*

Ovviamente due Kleisli arrows `g` e `f` in generale non compongono rispetto a `.` (l'operazione di composizione di `C`) poichè `F[B] != B`. Si consideri allora la seguente costruzione (chiamiamola `K(C)`)

```
   g      f
A ---> B ---> C
```

ove

- `A, B, C, ...` sono gli oggetti di `C`
- si ha una freccia `A -> B` in `K(C)` se e solo se esiste un morfismo `A -> F[B]` in `C`

Affermo ora che

> definire una buona operazione di composizione (chiamiamola `>=>`) per le Kleisli arrows in `C` vuol dire imporre che `K(C)` sia una categoria

1) composizione

Sappiamo che in `K(C)` deve esistere un morfismo `f . g: A -> C`, ma allora la composizione `g >=> f` deve essere un morfismo `A -> F[C]`. Proviamo a costruirlo.

E' possibile applicare un lifting a `f` ottenendo `F[f]: F[B] -> F[F[C]]`. Ora `F[f]` e `g` compongono in un morfismo `A -> F[[C]]` ma qui rimango bloccato.

Occorre perciò introdurre una nuova operazione, chiamiamola `flatten: F[F[C]] -> F[C]` (sinonimo `join` in Haskell o PureScript).

Il risultato finale è una operazione `chain` composta prima da una `map` e poi da una `flatten`, ovvero `flatten . map` (da cui il nome `flatMap`).

2) morfismi identità

Sappiamo che per ogni `A` in `K(C)` deve esistere un morfismo `idA: A -> A`, il che equivale a pretendere che esista un morfismo `of: A -> F[A]` in `C`.

3) identità sinistra e destra

- `IdB . f = f` implica `of >=> f = f` ovvero `chain(of, u) = u`
- `f . IdC = f` implica `f >=> of = f` ovvero `chain(f, of(a)) = f(a)`

4) associatività

`h >=> (f >=> g) = (h >=> f) >=> g` ovvero `chain(h, chain(f, u)) = chain(x => chain(h, f(x)), u)`

# Esempi

**Identity**

```ts
export class Identity<A> {
  static of<B>(b: B): Identity<B> {
    return new Identity(b)
  }
  constructor(private value: A) {}
  map<B>(f: (a: A) => B): Identity<B> {
    return new Identity(f(this.value))
  }
  chain<B>(f: (a: A) => Identity<B>): Identity<B> {
    return f(this.value)
  }
}
```

**Maybe**

```ts
export class Maybe<A> {
  static of<B>(b: B): Maybe<B> {
    return new Maybe(b)
  }
  value: A | null;
  constructor(value: A | null) {
    this.value = value
  }
  map<B>(f: (a: A) => B): Maybe<B> {
    return this.value == null ? none : new Maybe(f(this.value))
  }
  chain<B>(f: (a: A) => Maybe<B>): Maybe<B> {
    return this.fold(() => none, f)
  }
}
```

**IO**

```ts
export class IO<A> {
  static of<B>(b: B): IO<B> {
    return new IO(() => b)
  }
  constructor(private value: () => A) {}
  run(): A {
    return this.value()
  }
  map<B>(f: (a: A) => B): IO<B> {
    return new IO(() => f(this.run()))
  }
  chain<B>(f: (a: A) => IO<B>): IO<B> {
    return f(this.run())
  }
}
```

**Array**

```ts
export class Arr<A> {
  static of<B>(b: B): Arr<B> {
    return new Arr([b])
  }
  constructor(public value: Array<A>) {}
  map<B>(f: (a: A) => B): Arr<B> {
    return new Arr(this.value.map(f))
  }
  chain<B>(f: (a: A) => Arr<B>): Arr<B> {
    return new Arr(this.value.reduce((acc: Array<B>, a) => acc.concat(f(a).value), []))
  }
}
```

**Task**

```ts
export class Task<A> {
  static of<B>(b: B): Task<B> {
    return new Task(() => Promise.resolve(b))
  }
  constructor(public value: () => Promise<A>) {}
  run(): Promise<A> {
    return this.value()
  }
  map<B>(f: (a: A) => B): Task<B> {
    return new Task(() => this.run().then(f))
  }
  chain<B>(f: (a: A) => Task<B>): Task<B> {
    return new Task(() => this.value().then(a => f(a).run()))
  }
}
```
