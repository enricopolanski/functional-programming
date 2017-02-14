# Programma

Giorno I

- funzioni pure e funzioni parziali
- error handling funzionale
- categorie
- funtori

Giorno II

- cos'è una algebra
- introduzione ai tipi statici
- semigruppi
- monoidi

Giorno III

- come si gestiscono i side effect
- monadi

Giorno IV

- funtori applicativi
- ADT (Algebraic Data Types)

# Cosa vuol dire "programmazione funzionale"?

Quando si parla di programmazione funzionale si menzionano i seguenti termini

- Higher-order functions (`map`, `reduce`, `filter`)
- Functions are pure
- Functions use immutable data
- Functions guarantee referential transparency
- Functions are first-class entities

Sono tutti concetti e strumenti necessari per fare programmazione funzionale.

Ma per capire cosa *sia* la programmazione funzionale occorre andare oltre ad un elenco di feature, ovvero chiedersi a cosa serve e qual'è il suo obiettivo principale?

Torneremo su questa domanda anche in seguito, per ora propongo questa interpretazione:

> la programmazione funzionale mira ad avere un *modello formale* dal quale derivare le modalità di implementazione.

O, più brevemente, e spingendo il concetto al limite:

> La programmazione funzionale è matematica applicata (all'informatica).

Facciamo due esempi che ci saranno utili anche in seguito

- come catturare il concetto di computazione parallelizzabile?
- che cos'è una funzione "pura"?

## Computazioni parallelizzabili

Un particolare tipo di computazione parallelizzabile (e distribuibile) può essere catturato dalla nozione di operazione associativa.

Sia `A` un insieme, una operazione `*: A x A -> A` si dice *associativa* se per ogni `a, b, c ∈ A` vale

```
(a * b) * c = a * ( b * c )
```

In altre parole la proprietà associativa garantisce che non importa l'ordine con cui vengono fatte le operazioni, il risultato sarà lo stesso.

**Esempio**. La somma di interi gode della proprietà associativa.

Se sappiamo che una data operazione gode della proprietà associativa, possiamo suddividere la computazione in due sotto computazioni, ognuna delle quali può essere ulteriormente suddivisa

```
computazione = a * b * c * d * e * f * g * h
             = ( ( a * b ) * ( c * d ) ) * ( ( e * f ) * ( g * h ) )
```

Le sotto computazioni possono essere distribuite ed eseguite contemporaneamente.

## Funzioni pure

> Una funzione (pura e totale) `f: A -> B` è il sottoinsieme `f` di `A x B` tale che per ogni `a ∈ A` esiste esattamente un `b ∈ B` tale che `(a, b) ∈ f`

`A` si dice *dominio* di `f`, `B` il suo *codominio*.

Se si realizza che il sottinsieme `f` deve essere descritto "staticamente" in fase di definizione della funzione (ovvero quel sottoinsieme non può variare nel tempo o per nessuna condizione esterna) ecco che viene esclusa ogni forma di side effect e la funzione viene detta "pura".

**Esempio**. La funzione "raddoppia" sugli interi è il sottoinsieme delle coppie `Intero x Intero` dato da `{ (1, 2), (2, 4), (3, 6), ... }`. Questa è quella che viene chiamata definizione *estensionale*, cioè si enumerano uno per uno gli elementi dell'insieme. Ovviamente quando l'insieme è infinito come in questo caso, la definizione può risultare un po' scomoda.

Si può ovviare a questo problema introducendo quella che si chiama definizione *intensionale*, ovvero si esprime una condizione che deve valere per tutte le coppie `(x, y)` che è `y = x * 2`. Questa è la familiare forma con cui conosciamo la funzione raddoppia e come la scriviamo in JavaScript

```js
const double = x => x * 2
```

La definizione di funzione come sottoinsieme di un prodotto cartesiano evidenzia perchè in matematica, e quindi in programmazione funzionale, tutte le funzioni sono (devono essere) pure. Non c'è azione, modifica di stato o modifica degli elementi (che sono considerati immutabili) degli insiemi coinvolti.

**Nota**. Che una funzione sia pura non implica necessariamente che sia bandita la mutabilità ("localmente" è ammissibile). La scopo fondamentale è garantirne le proprietà fondamentali (purezza e referential transparency).

# Funzioni parziali

Una funzione *parziale* è una funzione che non è definita per tutti i valori del dominio.

**Esempio**

```js
const inverse = x => 1 / x
```

La funzione `inverse: number -> number` non è definita per `x = 0`.

Una funzione parziale può essere sempre ricondotta ad una funzione totale aggiungendo un valore speciale, chiamiamolo `Nothing`, al codominio

```
f: A -> (B U Nothing)
```

Chiamiamo `Maybe(B)` l'insieme `B U Nothing`.

Ecco come viene implementato l'insieme `Maybe(B)` in vari linguaggi:

- `Option[B]` in Scala
- `Maybe b` in Haskell, PureScript e Elm
- `B | null` in Flow o TypeScript

> In ambito funzionale un programmatore dovrebbe ambire ad avere tutte funzioni totali

# Error-handling funzionale

```js
const inverse = x => 1 / x

inverse(2) // 0.5
```

cosa succede se...

```js
inverse(0) // => ouch!
```

Come soluzione potremmo lanciare un'eccezione

```js
const inverse = x => {
  if (x !== 0) return 1 / x
  throw new Error('cannot divide by zero')
}
```

ma la funzione non sarebbe più pura. Allora proviamo ad estendere il codominio con `null` ottenendo `Maybe(number)`

```js
// inverse: number -> Maybe(number)
const inverse = x => {
  if (x !== 0) return 1 / x
  return null
}
```

Il tipo `Maybe(A)` può dunque sostituire le eccezioni (un particolare tipo di side effect) quando la computazione può fallire.

Ma c'è un problema...

```js
// calcola l'inverso e poi moltiplica per 2
function doubleInverse(x) {
  const y = inverse(x)
  return double(y)
}
```

L'implementazione non è corretta, cosa succede se `y = null`? Occorre tenerne conto

```js
function doubleInverse(x) {
  const y = inverse(x)
  if (y !== null) return double(y)
  return null
}
```

`Maybe` è "contagioso", se usato nel body di una funzione il suo codominio viene modificato di conseguenza.

Svantaggi:

- poco leggibile
- poco manutenibile
- prono ad errori (è facile dimenticarsi di gestire il caso di fallimento)
- molto boilerplate
- il branching non è espresso nel type system
- le API non "compongono"

## Il tipo `Maybe`

```js
const Maybe = x => ({
  map: f => Maybe(x == null ? null : f(x))
})

const inverse = x => Maybe(x === 0 ? null : 1 / x)

// no boilerplate
inverse(2).map(double) // Maybe(1)
inverse(0).map(double) // Maybe(null)

const inc = x => x + 1

// composizione
inverse(0).map(double).map(inc) // Maybe(null)
inverse(4).map(double).map(inc) // Maybe(1.5)
// analogo a
inverse(4).map(compose(inc, double))
```

`Maybe` mi permette di concentrarmi solo sul path "di successo".

### Branching tramite la funzione `fold`

Prima o poi però dovrò affrontare il problema di stabilire cosa fare in caso di fallimento. La funzione `fold` permette di gestire i due casi

```js
const Maybe = x => ({
  map: f => Maybe(x == null ? null : f(x)),
  fold: (f, g) => x == null ? f() : g(x)
})

const f = () => 'error'
const g = x => `ok: ${x}`

console.log(inverse(2).fold(f, g)) // => 'ok: 0.5'
console.log(inverse(0).fold(f, g)) // => 'error'
```

Notate come gli `if` sono racchiusi nella definizione di `Maybe`, mentre durante l'utilizzo vengono usate solo funzioni.

Inoltre le funzioni `f` e `g` sono generiche e riutilizzabili.

## Il tipo `Either`

`Maybe` è utile quando c'è un solo modo evidente per il quale una computazione può fallire.

Se esistono molteplici ragioni di fallimento e mi interessa tenerle distinte, oppure se voglio avere una descrizione del fallimento, posso usare `Either`.

```js
// in caso di fallimento
const Left = x => ({
  map: () => Left(x) // qui f è semplicemente ignorata
})

// in caso di successo
const Right = x => ({
  map: f => Right(f(x))
})

const inverse = x => x === 0 ? Left('cannot divide by zero') : Right(1 / x)

inverse(2).map(double) // Right(1)
inverse(0).map(double) // Left(cannot divide by zero)
inverse(0).map(double).map(inc) // Left(cannot divide by zero)
inverse(4).map(double).map(inc) // Right(1.5)
```

Le qualità di cui stiamo parlando non sono esclusive di `Maybe` e `Either`, ecco un primo pattern funzionale

> `Maybe` e `Either` sono esempi di *funtori*

Cosa sono quindi i funtori, in generale? Per parlare di funtori dobbiamo prima introdurre una astrazione da cui dipendono: le *categorie*.

# Teoria delle categorie

## A cosa serve?

Nell'ambito informatico è esperienza ormai comune che "lavorare a componenti", avere API "componibili", costruire nuovi oggetti tramite "composizione" sono proprietà positive del software.

Ma cosa vuol dire esattamente "componibile"? Quando possiamo davvero dire che due cose "compongono"? E se compongono quando possiamo dire che lo fanno in un modo "buono"?

Sarebbe assai utile poter fare riferimento ad una teoria **rigorosa** che ci possa fornire buone risposte a queste domande fondamentali. Fortunatamente da più di 60 anni un vasto gruppo di studiosi appartenenti al più longevo e mastodontico progetto open source nella storia dell'umanità si occupa di sviluppare una teoria specificatamente dedicata a questo argomento: la **componibilità**.

Il progetto open source si chiama "matematica" e la teoria sulla componibilità ha preso il nome di "Teoria delle categorie".

Studiare teoria delle categorie non è perciò un passatempo astratto, ma va dritto al cuore di ciò che facciamo tutti i giorni quando vogliamo sviluppare (buon) software.

## Definizione

Una categoria `C` è una coppia `(Oggetti, Morfismi)` ove

- `Oggetti`, è una collezione di entità, non meglio specificate. Considerate un oggetto come un corpo imperscrutabile, senza struttura né proprietà distintive, a meno della sua identità (ovvero considerati due oggetti sappiamo solo se sono uguali oppure diversi ma non il perchè).
- `Morfismi` è una collezione di "frecce" che collegano gli oggetti. Tipicamente un morfismo `f` è denotato con `f: A -> B` per rendere chiaro che è una freccia che parte da `A` detta "sorgente" e arriva a `B` detta "destinazione".

Mentre gli oggetti non hanno ulteriori proprietà da soddisfare, per i morfismi devono valere alcune condizioni note come "leggi"

## Leggi

### Prima legge: morfismi identità

Per ogni oggetto `X` deve esistere un morfismo `idX: X -> X` (chiamato "morfismo identità per X")

### Seconda legge: composizione di morfismi

Deve esistere una operazione, indichiamola con il simbolo `.`, detta "composizione" tale che per ogni coppia di morfismi `f: B -> C` e `g: A -> B` associa un terzo morfismo `f . g: A -> C`. Inoltre l'operazione `.` di composizione deve soddisfare le seguenti proprietà:

- (*associatività*) se `f: A -> B`, `g: B -> C` e `h: C -> D`, allora `h . (g . f) = (h . g) . f`
- (*identità*) per ogni morfismo `f: A -> B` vale `idB . f = f = f . idA` (ove `idB` e `idA` sono rispettivamente i morfismi identità di `A` e `B`)

**Esempio**.

![esempio di categoria](https://upload.wikimedia.org/wikipedia/commons/f/ff/Category_SVG.svg)

> Le categorie possono essere interpretate come linguaggi di programmazione: gli oggetti rappresentano i tipi mentre i morfismi rappresentano le funzioni.

# Funtori

Di fronte ad un nuovo oggetto di studio come le categorie, il matematico ha davanti due percorsi di indagine: il primo, che chiamerò, "ricerca in profondità", mira a studiare le proprietà di una singola categoria. Il secondo (ed è quello che interessa a noi), che chiamerò "ricerca in ampiezza", mira a studiare quando due categorie possono essere dette "simili". Per iniziare questo secondo tipo di indagine dobbiamo introdurre un nuovo strumento: le mappe tra categorie (pensate a "mappa" come ad un sinonimo di "funzione").

## Mappe tra categorie

Se `C` e `D` sono due categorie, cosa vuol dire costruire una "mappa F tra C e D"? Essenzialmente vuol dire costruire una associazione tra le parti costituenti di `C` e le parti costituenti di `D`. Siccome una categoria è composta da due cose, i suoi oggetti e i suoi morfismi, per avere una "buona" mappa non devo mischiarle, devo cioè fare in modo che agli oggetti di `C` vengano associati degli oggetti di `D` e che ai morfismi di `C` vengano associati dei morfismi di `D`. La costruzione di una buona mappa implica che oggetti e morfismi viaggiano su "strade separate" e non si mischiano tra loro.

Ma mi interessano proprio tutte le mappe che posso costruire così? No davvero, molte di quelle che posso costruire non sarebbero affatto interessanti: quello che voglio è perlomeno preservare la "struttura di categoria", ovvero che le leggi rimangano valide anche dopo aver applicato la mappa.

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
 A ------- f -------> B ------- g -------> C     <= categoria C
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

## Endofuntori in `JS`

Definire un (endo)funtore **F** nella categoria `JS` significa nella pratica due cose:

- per ogni tipo `A` stabilire a quale tipo corrisponde `F(A)`
- per ogni funzione `f: A -> B` stabilire a quale funzione corrisponde `F(f)`

Quindi un funtore è una coppia **F** = `(F<?>, lift)` ove

- `F<?>` è una "procedura" che, dato un qualsiasi tipo `A` produce un tipo `F<A>`
- `lift` è una funzione con la seguente firma

```js
lift(f: (a: A) => B): (fa: F<A>) => F<B>
```

La funzione `lift` è meglio conosciuta sottoforma di una sua variante **equivalente** e più popolare chiamata `map`

```js
map(f: (a: A) => B, fa: F<A>): F<B>
```

Sia `Maybe` che `Either` implementano l'*interfaccia* funtore nella sua variante OOP (l'argomento `fa` scompare dalla firma di `map`)

```js
const Maybe = x => ({
  // map: (f, fa) => Maybe(x == null ? null : f(fa))
  map: f => Maybe(x == null ? null : f(x))
})

const Left = x => ({
  map: () => Left(x) // qui f è semplicemente ignorata
})

const Right = x => ({
  map: f => Right(f(x))
})
```

# Esercizi

## `fold`

1) Implementare la funzione `fold` per `Either`.

## Funtori

1) Implementare il funtore `Identity`

`Identity<A>` manda un tipo `A` ancora in `A`

2) Implementare il funtore `Array`

`Array<A>` manda un tipo `A` nella lista di elementi di tipo `A`

3) Implementare il funtore `Promise`

`Promise<A>` manda un tipo `A` in una promise che, una volta risolta, produce un valore di tipo `A`

4) Implementare il funtore `IO`

`IO<A>` manda un tipo `A` nel tipo `() => A`

5) Implementare il funtore `Tuple`

`Tuple<C, A>` manda il tipo `A` nel tipo `[C, A]`

6) Implementare un albero binario e definire un'istanza di funtore

# Soluzioni

## `fold`

1)

```js
const Left = x => ({
  map: () => Left(x),
  fold: (f, g) => f(x)
})

const Right = x => ({
  map: f => Right(f(x)),
  fold: (f, g) => g(x)
})
```

## Funtori

1)

```js
const Identity = x => ({
  map: f => Identity(f(x))
})

console.log(Identity(1)) // => Identity(1)
```

2)

```js
export const Arr = x => ({
  map: f => Arr(x.map(f))
})

console.log(Arr([1, 2, 3]).map(x => x * 2)) // => Arr(2,4,6)
```

3)

```js
export const Pro = x => ({
  x,
  map: f => Pro(x.then(f))
})

Pro(Promise.resolve(1)).map(x => x * 2).x.then(x => console.log(x)) // => 2
```

4)

```js
const IO = x => ({
  map: f => IO(() => f(x())),
  run: () => x()
})

console.log(IO(() => {
  console.log('IO called')
  return 1
}).map(x => x * 2).run()) // => 'IO called' \n 2
```

5)

```js
export const Tuple = x => ({
  map: f => Tuple([x[0], f(x[1])]),
  inspect: () => `Tuple(${x})`
})

console.log(Tuple(['a', 1]).map(x => x * 2)) // => Tuple(a,2)
```

6)

```js
export const Leaf = x => ({
  map: f => Leaf(f(x)),
  inspect: () => `Leaf(${x})`
})

export const Node = (left, x, right) => ({
  map: f => Node(left.map(f), f(x), right.map(f)),
  inspect: () => `Node(${left.inspect()}, ${x}, ${right.inspect()})`
})

const tree = Node(Node(Leaf(1), 2, Leaf(3)), 4, Leaf(5))

console.log(tree.map(x => x * 2)) // => Node(Node(Leaf(2), 4, Leaf(6)), 8, Leaf(10))
```

# Appendice

## Funtori controvarianti

```js
// funtori covarianti
map<A, B>(f: (a: A) => B, fa: F<A>): F<B>

// funtori controvarianti
map<A, B>(f: (b: B) => A, fa: F<A>): F<B>;
```

Esempio di funtore controvariante: le componenti React

```js
import React from 'react'
import ReactDOM from 'react-dom'

const ComponentA = a => <div>Hello {a.fullName}</div>

ReactDOM.render(<ComponentA fullName="Giulio Canti" />, document.getElementById('app'))

const f = b => ({ fullName: `${b.name} ${b.surname}` })

const ComponentB = b => ComponentA(f(b))

ReactDOM.render(<ComponentB name="Giulio" surname="Canti" />, document.getElementById('app'))
```

> React components are just contravariant endofuntors in the category of JS, what's the problem?

## Composizione di funtori

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
- (morfismi) `liftFG = (f) => liftF(liftG(f))`

**Nota**. L'ultima riga si legge "la lift del funtore composizione è la composizione delle lift dei funtori". Il fatto che anche in italiano si scambino i nomi e il loro ordine tra destra e sinistra è sintomo forte che si è in presenza di buone proprietà di composizione.

### Esercizi

9) Implementare il funtore `Parser`

`Parser<A>` manda il tipo `A` nel tipo `(input: string) => Maybe<[string, A]>`
