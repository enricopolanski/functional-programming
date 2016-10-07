# Categorie e funtori

## Introduzione

Nell'ambito informatico è esperienza ormai comune che "lavorare a componenti", avere API "componibili", costruire nuovi oggetti tramite "composizione" sono proprietà positive del software.

Ma cosa vuol dire esattamente "componibile"? Quando possiamo davvero dire che due cose "compongono"? E se compongono quando possiamo dire che lo fanno in un modo "buono"?

Sarebbe assai utile poter fare riferimento ad una teoria **rigorosa** che ci possa fornire le risposte a queste importanti domande. Fortunatamente da più di 60 anni un vasto gruppo di studiosi appartenenti al più longevo e mastodontico progetto open source nella storia dell'umanità si occupa di sviluppare una teoria specificatamente dedicata a questo argomento: la **componibilità**.

Il progetto open source si chiama "matematica" e questa teoria sulla componibilità ha preso il curioso nome di "Teoria delle categorie".

Studiare la teoria delle categorie non è perciò un passatempo astratto, ma va dritto al cuore di ciò che facciamo tutti i giorni quando vogliamo sviluppare (buon) software.

## Definizione

Una categoria `C` è una coppia `(Oggetti, Morfismi)` ove

- `Oggetti`, (inglese "objects") è un insieme di oggetti, non meglio specificati. Considerate un oggetto come un corpo imperscrutabile, senza proprietà distintive se non la sua identità (ovvero considerati due oggetti sappiamo solo che sono diversi ma non il perchè).
- `Morfismi` ("morphisms") è un insieme di "frecce" che collegano gli oggetti. Tipicamente un morfismo `f` è denotato con `f: A -> B` per rendere chiaro che è una freccia che parte da `A` detta "sorgente" ("source") e arriva a `B` detta "destinazione" ("target").

Mentre gli oggetti non hanno ulteriori proprietà da soddisfare, per i morfismi devono valere alcune condizioni note come "leggi" ("laws")

## Leggi

**Nota**. Non è importante memorizzare le leggi da subito ma lo sarà poco più avanti, quindi per ora se volete potete saltate questo paragrafo, ci torneremo quando sarà strettamente necessario.

### Prima legge: morfismi identità

Per ogni oggetto `X` deve esistere un morfismo `idX` (chiamato "morfismo identità per X") tale che `idX: X -> X`

### Seconda legge: composizione di morfismi

Deve esistere una operazione, indichiamola con il simbolo `.`, detta "composizione" tale che per ogni coppia di morfismi `f: B -> C` e `g: A -> B` associa un terzo morfismo `f . g: A -> C`. Inoltre l'operazione `.` di composizione deve soddisfare le seguenti proprietà:

- (*associatività*) se `f: A -> B`, `g: B -> C` e `h: C -> D`, allora `h . (g . f) = (h . g) . f`
- (*identità*) per ogni morfismo `f: A -> B` vale `idB . f = f = f . idA` (ove `idB` e `idA` sono rispettivamente morfismi identità di `A` e `B`)

*Esempio di categoria*

![esempio di categoria](https://upload.wikimedia.org/wikipedia/commons/f/ff/Category_SVG.svg)

## Funtori

Di fronte ad un nuovo oggetto di studio come le categorie, il matematico ha davanti due percorsi di indagine: il primo, che chiamerò, "ricerca in profondità", mira a studiare le proprietà di una singola categoria. Il secondo (ed è quello che interessa a noi), che chiamerò "ricerca in ampiezza", mira a studiare quando due categorie possono essere dette "simili". Per iniziare questo secondo tipo di indagine dobbiamo introdurre un nuovo strumento: le mappe tra categorie (pensate a "mappa" come ad un sinonimo di "funzione").

### Mappe tra categorie

Se `C` e `D` sono due categorie, cosa vuol dire costruire una "mappa F tra C e D"? Essenzialmente vuol dire costruire una associazione tra le parti costituenti di `C` e le parti costituenti di `D`. Siccome una categoria è composta da due cose, i suoi oggetti e i suoi morfismi, per avere una "buona" mappa non devo mischiarle, devo cioè fare in modo che agli oggetti di `C` vengano associati degli oggetti di `D` e che ai morfismi di `C` vengano associati dei morfismi di `D`. La costruzione di una buona mappa implica che oggetti e morfismi viaggiano su "strade separate" e non si mischiano tra loro.

Ma mi interessano proprio tutte le mappe che posso costruire così? No davvero, molte di quelle che posso costruire non sarebbero affatto interessanti: quello che voglio è perlomeno preservare la "struttura di categoria", ovvero che le leggi rimangano valide anche dopo aver applicato la mappa.

**Nota**. ora è il momento di ripassare le leggi se non l'avete già fatto.

Specifichiamo in modo formale che cosa vuol dire per una mappa preservare la struttura di categoria.

## Definizione

Siano `C` e `D` due categorie, allora una mappa `F` si dice "funtore" se valgono le seguenti proprietà:

- ad ogni oggetto `X` in `C`, `F` associa un oggetto `F(X)` in `D`
- ad ogni morfismo `f: A -> B`, `F` associa un morfismo `F(f): F(A) -> F(B)` in `D`
- `F(idX)` = `idF(X)` per ogni oggetto `X` in `C`
- `F(g . f)` = `F(g) . F(f)` per tutti i morfismi `f: A -> B` e `g: B -> C` di `C`

Le prime due proprietà formalizzano il requisito che oggetti e morfismi viaggiano su strade separate. Gli ultimi due formalizzano il requisito che la "struttura categoriale" sia preservata.

```
F(A) ---- F(f) ----> F(B)  <= categoria D
 ^         ^          ^
 |         |          |
 |         |          |
 A ------- f -------> B    <= categoria C
```

L'associazione tra `f` e `F(f)` si chiama "lifting" della funzione `f`.

Quando `C` e `D` coincidono, si parla di "endofuntori" ("endo" proviene dal greco e significa "dentro")

## Funtori in informatica

Producendo software avete sicuramente già utilizzato i funtori, invece è più raro cha abbiate avuto a che fare con tanti esemplari diversi di categorie. Tipicamente si lavora sempre dentro la stessa: la categoria `JS`.

### La categoria `JS`

Come ogni categoria, la categoria `JS` è composta da oggetti e morfismi:

- gli oggetti sono i tipi (per esempio `number`, `string`, `boolean`, `Array<number>`, `Array<Array<number>>`, etc...)
- i morfismi sono funzioni tra tipi (per esempio `number -> number`, `string -> number`, `Array<number> -> Array<number>`, etc...)

Inoltre l'operazione di composizione `.` è l'usuale composizione di funzioni.

**Esercizio**. Dimostrare che `JS` è effettivamente una categoria verificando che valgono tutte le leggi.

### Esempi di endofuntori di `JS`

Definire un (endo)funtore `F` nella categoria `JS` significa nella pratica due cose:

- per ogni tipo `A` stabilire a quale tipo corrisponde `F(A)`
- per ogni funzione `f: A -> B` stabilire a quale funzione corrisponde `F(f)`

Quindi un funtore è sempre una **coppia** `(F, lift)` ove

- `F` è una "procedura" che, dato un qualsiasi tipo `A` produce un tipo `F<A>`
- `lift` è una funzione con la seguente firma

```js
lift(f: (a: A) => B): (fa: F<A>) => F<B>
```

**Nota**. La funzione `lift` è conosciuta sottoforma di una sua variante **equivalente** più popolare chiamata `map`

```js
map(f: (a: A) => B, fa: F<A>): F<B>
```

#### `Array`

Il più tipico esempio di funtore è `Array = (Array<A>, liftArray)` ove

- `Array<A>` manda un tipo `A` nella lista di elementi di tipo `A`
- `liftArray = (f) => (fa => fa.map(f))`

#### `Maybe`

`Maybe = (?A, liftMaybe)` ove

- `?A` manda un tipo `A` nell'unione `A | null`
- `liftMaybe = (f) => (fa => fa === null ? null : f(fa))`

#### `Promise`

`Promise = (Promise<A>, liftPromise)` ove

- `Promise<A>` manda un tipo `A` in una promise che, una volta risolta, produce un valore di tipo `A`
- `liftPromise = (f) => (fa => fa.then(a => f(a))`
