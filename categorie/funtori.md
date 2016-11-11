# Funtori

Di fronte ad un nuovo oggetto di studio come le categorie, il matematico ha davanti due percorsi di indagine: il primo, che chiamerò, "ricerca in profondità", mira a studiare le proprietà di una singola categoria. Il secondo (ed è quello che interessa a noi), che chiamerò "ricerca in ampiezza", mira a studiare quando due categorie possono essere dette "simili". Per iniziare questo secondo tipo di indagine dobbiamo introdurre un nuovo strumento: le mappe tra categorie (pensate a "mappa" come ad un sinonimo di "funzione").

## Mappe tra categorie

Se `C` e `D` sono due categorie, cosa vuol dire costruire una "mappa F tra C e D"? Essenzialmente vuol dire costruire una associazione tra le parti costituenti di `C` e le parti costituenti di `D`. Siccome una categoria è composta da due cose, i suoi oggetti e i suoi morfismi, per avere una "buona" mappa non devo mischiarle, devo cioè fare in modo che agli oggetti di `C` vengano associati degli oggetti di `D` e che ai morfismi di `C` vengano associati dei morfismi di `D`. La costruzione di una buona mappa implica che oggetti e morfismi viaggiano su "strade separate" e non si mischiano tra loro.

Ma mi interessano proprio tutte le mappe che posso costruire così? No davvero, molte di quelle che posso costruire non sarebbero affatto interessanti: quello che voglio è perlomeno preservare la "struttura di categoria", ovvero che le leggi rimangano valide anche dopo aver applicato la mappa.

**Nota**. ora è il momento di ripassare le leggi se non l'avete già fatto.

Specifichiamo in modo formale che cosa vuol dire per una mappa preservare la struttura di categoria.

## Definizione di funtore

Siano `C` e `D` due categorie, allora una mappa `F` si dice "funtore" se valgono le seguenti proprietà:

- ad ogni oggetto `X` in `C`, `F` associa un oggetto `F(X)` in `D`
- ad ogni morfismo `f: A -> B`, `F` associa un morfismo `F(f): F(A) -> F(B)` in `D`
- `F(idX)` = `idF(X)` per ogni oggetto `X` in `C`
- `F(g . f)` = `F(g) . F(f)` per tutti i morfismi `f: A -> B` e `g: B -> C` di `C`

Le prime due proprietà formalizzano il requisito che oggetti e morfismi viaggiano su strade separate. Gli ultimi due formalizzano il requisito che la "struttura categoriale" sia preservata.

```
 +---------------- F(g . f) ---------------+
 |                                         |
 |                                         |
`F(A) ---- F(f) ----> F(B) ---- F(g) ----> F(B)  <= categoria D
 ^         ^          ^         ^          ^
 |         |          |         |          |
 |         |          |         |          |
 A ------- f -------> B ------- g -------> C    <= categoria C
 |                                         ^
 |                                         |
 +----------------- g . f -----------------+
```

L'associazione tra `f` e `F(f)` si chiama "lifting" della funzione `f`.

Quando `C` e `D` coincidono, si parla di "endofuntori" ("endo" proviene dal greco e significa "dentro")

## Funtori in informatica

Producendo software avete sicuramente già utilizzato i funtori, invece è più raro cha abbiate avuto a che fare con tanti esemplari diversi di categorie. Tipicamente si lavora sempre dentro la stessa: la categoria `JS`.

# La categoria JS

Come ogni categoria, la categoria **JS** è composta da oggetti e morfismi:

- gli oggetti sono i tipi (per esempio `number`, `string`, `boolean`, `Array<number>`, `Array<Array<number>>`, etc...)
- i morfismi sono funzioni tra tipi (per esempio `number -> number`, `string -> number`, `Array<number> -> Array<number>`, etc...)

Inoltre l'operazione di composizione `.` è l'usuale composizione di funzioni.

**Esercizio**. Dimostrare che `JS` è effettivamente una categoria verificando che valgono tutte le leggi.

## Endofuntori in `JS`

Definire un (endo)funtore **F** nella categoria `JS` significa nella pratica due cose:

- per ogni tipo `A` stabilire a quale tipo corrisponde `F(A)`
- per ogni funzione `f: A -> B` stabilire a quale funzione corrisponde `F(f)`

Quindi un funtore è una coppia **F** = `(F<A>, lift)` ove

- `F<A>` è una "procedura" che, dato un qualsiasi tipo `A` produce un tipo `F<A>`
- `lift` è una funzione con la seguente firma

```js
lift(f: (a: A) => B): (fa: F<A>) => F<B>
```

**Nota**. La funzione `lift` è meglio conosciuta sottoforma di una sua variante **equivalente** e più popolare chiamata `map`

```js
map(f: (a: A) => B, fa: F<A>): F<B>
```

## Definizione di una `interface` per i funtori

```js
// versione funzionale
interface Functor<F> {
  map<A, B>(f: (a: A) => B, fa: F<A>): F<B>;
}

// versione OOP
interface Functor<A> {
  map<B>(f: (a: A) => B): Functor<B>;
}
```

## Esempi

### Id (Funtore identità)

**Id** = `(Id<A>, lift)` ove

```js
type Id<A> = A;
```

- `Id<A>` manda un tipo `A` ancora in `A`
- `lift = (f) => (f)`

### Maybe

**Maybe** = `(?A, lift)` ove

```js
type Maybe<A> = ?A;
```

- `?A` manda un tipo `A` nell'unione `A | null`
- `lift = (f) => (fa => fa === null ? null : f(fa))`

### Array

**Array** = `(Array<A>, lift)` ove

- `Array<A>` manda un tipo `A` nella lista di elementi di tipo `A`
- `lift = (f) => (fa => fa.map(f))`

### Promise

**Promise** = `(Promise<A>, lift)` ove

- `Promise<A>` manda un tipo `A` in una promise che, una volta risolta, produce un valore di tipo `A`
- `lift = (f) => (fa => fa.then(a => f(a))`

### Eff (rappresenta i side effect)

**Eff** = `(Eff<A>, lift)` ove

```js
type Eff<A> = () => A;
```

- `Eff<A>` manda un tipo `A` nel tipo `() => A`
- `lift = (f) => ( a => () => f(a) )`

## I funtori "compongono"

Siano `F` e `G` due funtori, allora possiamo costruire un nuovo funtore `F(G)`

```
F(G(A))---> F(G(f)) ---> F(G(B))  <= categoria E
 ^            ^            ^
 |            |            |
 |            |            |
G(A) ------- G(f) -----> G(B)     <= categoria D
 ^            ^            ^
 |            |            |
 |            |            |
 A ---------- f ---------> B      <= categoria C
```

- (oggetti) `F(G)` manda un tipo `A` nel tipo `F(G(A))`
- (morfismi) `mapFG = (f) => mapF . mapG`

**Nota**. L'ultima riga si legge "la map del funtore composizione è la composizione delle map dei funtori". Il fatto che anche in italiano si scambino i nomi e il loro ordine tra destra e sinistra è sintomo forte che si è in presenza di buone proprietà di composizione.

## Esercizi

1) Definire un funtore per il seguente albero binario

```js
// @flow

export class Leaf<A> {
  value: A;
  constructor(value: A) {
    this.value = value
  }
  toString() {
    return `Leaf(${String(this.value)})`
  }
}

export class Node<A> {
  value: A;
  left: Tree<A>;
  right: Tree<A>;
  constructor(value: A, left: Tree<A>, right: Tree<A>) {
    this.value = value
    this.left = left
    this.right = right
  }
  toString() {
    return `Branch(${String(this.value)}, ${this.left.toString()}, ${this.right.toString()})`
  }
}

export type Tree<A> = Leaf<A> | Node<A>;
```
