# Programma

Giorno IV

- Funtori applicativi
- ADT (Algebraic Data Types)
  - Make impossible states irrepresentable
  - Phantom types and smart constructors

# Funtori applicativi

Nel capitolo sui funtori abbiamo visto come "liftare" una generica funzione `f: A -> B` con un solo argomento.

Se usiamo il funtore `Maybe`, possiamo interpretare il lifting di `f` come il trasportare la computazione di `f` che non fallisce mai in una computazione
`F(f)` che può fallire, per esempio se è fallito il recupero del valore di input:

```ts
function lift<A, B>(f: (a: A) => B): (fa: Maybe<A>) => Maybe<B> {
  return fa => fa.map(f)
}

function compose<A, B, C>(f: (b: B) => C, g: (a: A) => B): (a: A) => C {
  return a => f(g(a))
}

function head<A>(as: Array<A>): Maybe<A> {
  return new Maybe(as.length ? as[0] : null)
}

const double = (n: number) => n * 2

// compose(double, head) // <= type error

compose(lift(double), head) // <= ok
```

Ma `lift` funziona solo per funzioni unarie.

Cosa succede se abbiamo una funzione con due o più argomenti? Possiamo ancora effettuare una operazione che sia simile al "lifting" che già conosciamo?

Consideriamo una funzione con due argomenti

```
f: A x B -> C
```

ove `A x B` indica il prodotto cartesiano degli insiemi `A` e `B`. La funzione `f` può essere riscritta in modo che sia una composizione di due funzioni, ognuna con un solo parametro

```
f: A -> B -> C
```

Questo processo di riscrittura prende il nome di *currying*.

Nota: It was introduced by Gottlob Frege (filosofo, logico e matematico tedesco), developed by Moses Schönfinkel (logico e matematico russo), and further developed by Haskell Curry (logico e matematico americano).

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

Proviamo a costruire `F(f)` con i soli mezzi che abbiamo a disposizione. Siccome sappiamo che la composizione di funzioni è associativa possiamo evidenziare il secondo elemento della composizione di `f` vedendola come una funzione che accetta un solo parametro di tipo `A` e restituisce un valore di tipo `B -> C` (anche le funzioni hanno un loro tipo).

```
f: A -> ( B -> C )
```

adesso che ci siamo ricondotti ad avere una funzione con un solo parametro, possiamo liftarla tramite `F`

```
F(f): F(A) -> F(B -> C)
```

Ma a questo punto siamo bloccati. Perchè non c'è nessuna operazione lecita che ci permette di passare dal tipo `F(B -> C)` al tipo `F(B) -> F(C)`.

Che `F` sia solo un funtore non basta, deve avere una proprietà in più, quella cioè di possedere una operazione che permette di "spacchettare" il tipo delle funzioni da `B` a `C` mandandolo nel tipo delle funzioni da `F(B)` a `F(C)`. Questa operazione si indica comunemente con `ap`.

Inoltre è necessario avere un'altra operazione che, dato un elemento di `A` associa un elemento di `F(A)`. In questo modo, una volta ottenuta la funzione `F(f) = F(A) -> F(B) -> F(C)` e avendo a disposizione un valore di tipo `F(A)` (magari ottenuto da un'altra funzione) e un valore di tipo `B`, sono in grado di eseguire la computazione di `F(f)`.

Questa operazione si chiama `of` (sinonimi sono `pure`, `point`, `return`) ed è la stessa operazione `of` delle monadi.

## Definizione

Sia `F` un funtore tra le categorie `C` e `D`, allora `F` si dice *funtore applicativo* se esistono due funzioni

```purescript
class Applicative f where
  pure :: forall a. a -> f a
  apply :: forall a b. f (a -> b) -> f a -> f b
```

```ts
interface Applicative<F<?>> extends Funtor<F<?>> {
  of<A>(a: A): M<A> // static
  ap<A, B>(f: F<(a: A) => B>, fa: F<A>): F<B>
}
```

tali che valgono le seguenti leggi

- Associative composition: `ap(ap(map(compose, f), g), h) = ap(f, ap(g, h))`
- Identity: `ap(of(identity), x) = x`
- Composition: `ap(ap(ap(of(compose), f), g), h) = ap(f, ap(g, h))`
- Homomorphism: `ap(of(f), of(x)) = of(f(x))`
- Interchange: `ap(f, of(g)) = ap(of(x => g(x)), f)`

## Significato delle leggi

La normale applicazione di funzione può essere vista come una funzione binaria

```ts
// $ :: (a -> b) -> a -> b
function $<A, B>(f: (a: A) => B): (a: A) => B {
  return a => f(a)
}
```

Se si interpreta `ap` come un particolare tipo di applicazione di funzione ad un valore (ove sia funzione che il valore sono contenuti nel contesto funtoriale) allora:

Associative composition: ci dice che `ap` è associativa

Identity: ci dice che `ap` e `of` si comportano in modo sensato rispetto alla funzione identità

Composition: ci sice che `ap` e `of` si comportano in modo sensato rispetto alla composizione di funzioni

Homomorphism: dati `f: A -> B` e `a ∈ A` ho due modi per arrivare ad un valore di tipo `F(B)` e voglio che siano uguali

```
of(a)    ap(of(f))     ap(of(f), of(a)) = of(f(a))
F(A) ----------------> F(B)
^                       ^
|                       |
|                       |
A --------------------> B
a            f         f(a)
```

Interchange: ???

## Un esempio: `Maybe`

```ts
export class Maybe<A> {
  static of<B>(b: B): Maybe<B> {
    return new Maybe(b)
  }
  value: A | null | undefined;
  constructor(value: A | null | undefined) {
    this.value = value
  }
  map<B>(f: (a: A) => B): Maybe<B> {
    return this.value == null ? none : new Maybe(f(this.value))
  }
  chain<B>(f: (a: A) => Maybe<B>): Maybe<B> {
    return this.fold(() => none, f)
  }
  ap<B>(fab: Maybe<(a: A) => B>): Maybe<B> {
    const v = this.value
    return v == null ? none : fab.map(f => f(v))
  }
}
```

## Lifting manuale

```js
const sum = (a: number) => (b: number): number => a + b

const sumA2 = (fa: Maybe<number>) => (fb: Maybe<number>): Maybe<number> => fb.ap(fa.ap(Maybe.of(msum)))
// or
const sumA2 = (fa: Maybe<number>) => (fb: Maybe<number>): Maybe<number> => fb.ap(fa.map(msum))

sumA2(some(1))(some(2)) // Maybe(3)
sumA2(some(1))(none) // none
```

Per comodità vengono definite una serie di funzioni di utility al fine di evitare il lifting manuale

## `liftA2`

```js
function liftA2<A, B, C>(f: (a: A, b: B) => C): (fa: Maybe<A>, fb: Maybe<B>) => Maybe<C> {
  const curried = (a: A) => (b: B): C => f(a, b)
  return (fa, fb) => fb.ap(fa.map(curried))
}

sumA2(some(1), some(2)) // Maybe(3)
sumA2(some(1), none) // none
```

Analogamente è possibile definire `liftA3`, `liftA4`, etc...

Nota. E' utile notare che mentre abbiamo avuto bisogno di una nuova astrazione per poter liftare una funzione binaria, per liftare una funzione `n`-aria il funtore applicativo è sufficiente.

Nota. La funzione `liftA2` che abbiamo appena definito non è del tutto soddisfacente dato che si limita a gestire un particolare caso di funtore applicativo: `Maybe`.

## Derivare `ap` da `chain`

Così come a volte per definire la funzione `chain` delle monadi è più comodo derivarla dalla definizione di `flatten`, così a volte `ap` è semplice da definire come derivazione di `chain`

```ts
ap<B>(fab: F<(a: A) => B>): F<B> {
  return fab.chain(f => this.map(f))
}
```

Si veda il file `code/Array.ts` per un esempio pratico di applicazione.

## Esempi

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
  ap<B>(fab: Identity<(a: A) => B>): Identity<B> {
    return new Identity(fab.value(this.value))
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
  ap<B>(fab: Arr<(a: A) => B>): Arr<B> {
    return new Arr(fab.value.reduce((acc, f) => acc.concat(this.map(f).value), [] as Array<B>))
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
  static flatten<B>(mmb: IO<IO<B>>): IO<B> {
    return mmb.run()
  }
  chain<B>(f: (a: A) => IO<B>): IO<B> {
    return new IO(() => f(this.run()).run())
  }
  ap<B>(fab: IO<(a: A) => B>): IO<B> {
    return new IO(() => fab.run()(this.run()))
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
  ap<B>(fab: Task<(a: A) => B>): Task<B> {
    return new Task(() => {
      const p1 = fab.run()
      const p2 = this.run()
      return Promise.all([p1, p2]).then(([f, a]) => f(a))
    })
  }
}
```

## Esecuzione parallela o sequenziale

```ts
export function liftA2<A, B, C>(f: (a: A, b: B) => C): (fa: Task<A>, fb: Task<B>) => Task<C> {
  const curried = (a: A) => (b: B): C => f(a, b)
  return (fa, fb) => fb.ap(fa.map(curried))
}

const sum = (a: number, b: number): number => a + b

const sumA2 = liftA2(sum)

const delay = <A>(n: number, a: A): Task<A> => new Task(() => new Promise(resolve => {
  setTimeout(() => resolve(a), n)
}))

const fa = delay(1000, 1)
const fb = delay(1000, 2)

sumA2(fa, fb).run().then(x => console.log(x))
```

Eseguendo il codice mostrando il tempo di esecuzione otteniamo

```
$ time ts-node Task.ts

3

real    0m1.383s
user    0m0.327s
sys     0m0.058s
```

Se però come implementazione di `ap` per `Task` scegliamo quella derivata da `chain` otteniamo

```
$ time ts-node Task.ts -f
3

real    0m2.402s
user    0m0.342s
sys     0m0.063s
```

Nota: l'implementazione di `ap` derivata da `chain` è sempre sequenziale.

# ADT (Algebraic Data Types)

In programmazione funzionale un Algebraic Data Type è un tipo composto, ovvero un tipo formato dalla *combinazione* di altri tipi.

Tre tipologie di ADT molto comuni sono

- product Types
- sum Types
- exponential types

## Product types

I valori (o *abitanti*) di un product type tipicamente contengono diversi valori, chiamati *fields* (o *properties*).

Tutti gli abitanti di quel tipo hanno la stessa combinazione di fields types.

L'insieme di tutti i possibli valori del product type è il prodotto cartesiano dei valori dei fields type.

Esempio. Il product type `Person`

```ts
type Person = {
  name: string,
  age: number
}
```

è associabile al prodotto cartesiano `string X number`.

### Tuple

Ogni tupla è considerata un product type, ove l'accesso ai fields avviene tramite indice invece che tramite nome del fields

```ts
type PersonTuple = [string, number]
```

`Person` e `PersonTuple` sono isomorfi. E' possibile rendere esplicito l'isomorfismo definendo una coppia di funzioni `f` e `g` tali che `f . g = identity`

```ts
const f = ([name, age]: PersonTuple): Person => ({ name, age })

const g = ({ name, age }: Person): PersonTuple => [name, age]
```

Notate che `f` può essere scritto anche sotto forma di costruttore

```ts
const constructor = (name: string, age: number): Person => ({ name, age })

// or

class Person {
  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
}
```

### Array (con lunghezza finita)

Gli array di lunghezza finita sono dei product type dato che possono essere interpretati come tuple

```ts
type Array1<A> = [A]
type Array2<A> = [A, A]
type Array3<A> = [A, A, A]
...
```

### Perchè si chiamano "product" types?

Se indichiamo con `|A|` (detta *cardinalità* o *ordine* di `A`) il numero di elementi dell'insieme `A` è facile convincersi che vale la seguente formula

```
|A X B| = |A| x |B|
```

ovvero "la cardinalità del prodotto cartesiano è il prodotto delle cadinalità".

```ts
type Bool = true | false // <= il simbolo | indica l'unione
type Num = 1 | 2 | 3

type BoolNum = [Bool, Num]
```

Quanti abitanti ha il tipo `BoolNum`?

Quanti abitanti ha il tipo `Array2<Bool>`? `Array3<Bool>`?

## Sum types

Così come i product types sono analoghi ai prodotti cartesiani di insieme, i sum types sono analoghi alle unioni di insiemi.

```ts
type Bool = true | false
type NumberOrString = number | string
type Num = 1 | 2 | 3
type BoolOrNum = Bool | Num
```

### Array

Gli array di qualsiasi lunghezza possono essere interpretati come sum type

```ts
type Array<A> = [] | Array1<A> | Array2<A> | Array3<A> | ...
```

### List

Un modo per codificare un sum type in TypeScript (o Flow) è usare le *tagged unions* (o *Discriminated Unions*)

```ts
type List<A> =
  | { tag: 'Nil' }
  | { tag: 'Cons', head: A, tail: List<A> }
```

Nota. Le action usate con Redux possono essere pensate come tagged unions dove il campo che costituisce il tag convenzionalmente viene chiamato `type`.

Una feature molto utile (sia per lo sviluppo che per il refactoring) associata alle tagged unions è il *Exhaustiveness checking*

```ts
function h<A>(x: List<A>): string {
  switch (x.tag) {
    case 'Nil' :
      return 'Nil'
    case 'Cons' :
      return 'Cons'
  }
  // il type checker sa che tutti i casi sono stati esaminati
}
```

### Binary tree

```ts
type Tree<A> =
  | { tag: 'Empty' }
  | { tag: 'Leaf', value: A }
  | { tag: 'Node', left: Tree<A>, right: Tree<A> }
```

Si noti come sia possibile definire un'istanza di funtore (e altre algebre) per `Tree`

```ts
function map<A, B>(f: (a: A) => B, fa: Tree<A>): Tree<B> {
  switch (fa.tag) {
    case 'Empty' :
      return fa as any
    case 'Leaf' :
      return { tag: 'Leaf', value: f(fa.value) }
    case 'Node' :
      return { tag: 'Node', left: map(f, fa.left), right: map(f, fa.right) }
  }
}
```

### Perchè si chiamano "sum" types?

E' facile vedere che la cadinalità di un tipo prodotto è la somma delle cardinalità dei suoi membri

```ts
type Bool = true | false // |Bool| = 2
type Num = 1 | 2 | 3     // |Num| = 3

//                2   +  3
type BoolOrNum = Bool | Num // |BoolOrNum| = 5
```

> Quando di parla di ADT generalmente di intende un tipo composto da product e/o sum types, anche innestati.

## Exponential types

Il tipo della funzione `f: A -> B` si dice *Exponential type*.

Da dove deriva il nome? Ancora una volta è legato al numero di abitanti

```
|A -> B| = |B| ^ |A|
```

Esempio

```ts
type Bool = true | false // |Bool| = 2
type Num = 1 | 2 | 3     // |Num| = 3

type Function1<A, B> = (a: A) => B

// |Function1<Num, Bool>| = 2 ^ 3 = 8
```

Infatti ho 2 scelte su dove mandare `1`, 2 scelte su dove mandare `2` e due scelte su dove mandare `3`. Essendo le scelte indipendenti, il numero delle possibilità totali è il prodotto di tutti i casi

```
2 x 2 x 2
```

# Make impossible states irrepresentable

Vediamo un'altra tecnica per ottenere type safety, questa volta addirittura per costruzione.

Sappiamo che la funzione `head` è unsafe

```ts
function head<A>(as: Array<A>): A {
  return as[0]
}
```

e che per renderla safe occorre modificare il codominio

```ts
function head<A>(as: Array<A>): Maybe<A> {
  return new Maybe(as[0])
}
```

Ma questo ci obbliga a trattare `Maybe`. Un'altra opzione è quella di restringere il dominio invece che estendere il codominio

## NonEmptyArray

```ts
class NonEmptyArray<A> {
  head: A;
  tail: Array<A>;
  constructor(head: A, tail: Array<A>) {
    this.head = head
    this.tail = tail
  }
}

function head<A>(as: NonEmptyArray<A>): A {
  return as.head
}
```

## Zipper

Supponiamo di dover modellare il seguente problema

> una lista non vuota di elementi di cui uno è considerata la selezionate corrente

Un modello semplice potrebbe essere questo

```ts
type SelectedArray<A> = {
  items: Array<A>, // <= lista di items
  current: number  // <= indice dell'item selezionato
}
```

Questo modello ha diversi difetti

- la lista può essere vuota
- l'indice può essere out of range

Uno `Zipper` invece è un modello perfetto e type safe per il problema in oggetto

```ts
type Zipper<A> = {
  prev: Array<A>,
  current: A,
  next: Array<A>
}
```

## Phantom types and smart constructors

Un *phantom type* è un tipo parametrico i cui parametri non appaiono nel lato destro della sua definizione

```ts
class Data<M> {
  value: string;
  constructor(value: string) {
    this.value = value
  }
}
```

Qui `Data` è un phantom type dato che il parametro `M` non appare nella sua implementazione. Data la natura strutturale del type system di TypeScript la definizione di phantom type deve essere leggermente modificata

```ts
class Data<M> {
  m: M
  value: string;
  constructor(value: string) {
    this.value = value
  }
}
```

Il field `m` non è mai valorizzato a runtime, serve solo al type checker.

La class `Data` appare strana dato che a prima vista il type parameter non è usato e potrebbe essere qualsiasi cosa, senza influenzare il valore contenuto. Infatti è possibile definire la seguente funzione

```ts
function changeType<A, B>(data: Data<A>): Data<B> {
  return new Data<B>(data.value)
}
```

e trasformare un qualsiasi tipo in un altro. Tuttavia se il costruttore non è esportato, l'utente di una libreria che contiene la definizione di `Data` non può definire funzioni come quella sopra, quindi il type parameter può essere impostato o cambiato solo dalle funzioni interne alla libreria

```ts
// phantom.ts
import { Maybe, some, none } from './Maybe'

type Validated = 'Validated'
type Unvalidated = 'Unvalidated'
type Status = Validated | Unvalidated

class Data<M extends Status> {
  m: M
  value: string
  constructor(value: string) {
    this.value = value
  }
}

export function make(input: string): Data<Unvalidated> {
  return new Data<Unvalidated>(input)
}

declare function isAlpha(s: string): boolean

export function validate(data: Data<Unvalidated>): Maybe<Data<Validated>> {
  return new Maybe(isAlpha(data.value) ? new Data<Validated>(data.value) : null)
}

// can only be fed the result of a call to validate!
export function use(data: Data<Validated>): void {
  console.log('using ' + data.value)
}
```

Adesso proviamo ad usare la libreria in modo non corretto

```ts
import { make, validate, use } from './phantom'

const data = make('hello')
use(data) // called without validating the input
          // error: Type '"Unvalidated"' is not assignable to type '"Validated"'
```

Se si chiama `validate` invece

```ts
validate(data).map(data => use(data))
```

nessun errore!

Un'ultima cosa, che succede se proviamo a validate **due volte** l'input

```ts
validate(data).map(data => validate(data)) // error: Type '"Validated"' is not assignable to type '"Unvalidated"'
```

Questa tecnica è perfetta per validare l'input utente in una applicazione web.

Ci assicuriamo con un overhead pressochè nullo che i dati siano validati **una e una volta sola**, altrimenti otteniamo un errore **in fase di compilazione**.
