# Introduzione

## Cosa vuol dire "programmazione funzionale"?

Quando si parla di programmazione funzionale si menzionano i seguenti termini

- higher-order functions (map, reduce, filter)
- immutability
- pure functions (referential transparency)

Questi sono strumenti necessari ma è più importante chiedersi: a cosa serve?

La programmazione funzionale mira ad avere un modello formale dal quale attingere le modalità di implementazione.

> La programmazione funzionale è matematica applicata.

Per spiegare meglio il significato di questa frase facciamo due esempi che ci saranno molto utili anche in seguito

- come catturare il concetto di computazione parallelizzabile?
- che cos'è una funzione "pura"?

### Computazioni parallelizzabili

Un particolare tipo di computazione parallelizzabile (e distribuibile) può essere catturato dalla nozione di operazione associativa.

Sia `A` un insieme, una operazione `*: A x A -> A` si dice *associativa* se per ogni `a, b, c ∈ A` vale

```
(a * b) * c = a * ( b * c )
```

In altre parole la proprietà associativa garantisce che non importa l'ordine con cui vengono fatte le operazioni.

**Esempio**. La somma di interi gode della properietà associativa.

Se sappiamo che una data operazione gode della proprietà associativa, possiamo suddividere la computazione in due sotto computazioni, ognuna delle quali può essere ulteriormente suddivisa

```
computazione = a * b * c * d * e * f * g * h
             = ( ( a * b ) * ( c * d ) ) * ( ( e * f ) * ( g * h ) )
```

Le sotto computazioni possono essere distribuite ed eseguite contemporaneamente.

### Funzioni pure

Una funzione (pura e totale) `f: A -> B` è il sottoinsieme `f` di `A x B` tale che per ogni `a ∈ A` esiste esattamente un `b ∈ B` tale che `(a, b) ∈ f`

`A` si dice *dominio* di `f`, `B` il suo *codominio*.

Se si realizza che il sottinsieme `f` deve essere descritto "staticamente" in fase di definizione della funzione (ovvero quel sottoinsieme non può variare nel tempo o per nessuna condizione esterna) ecco che viene esclusa ogni forma di side effect e la funzione viene detta "pura".

**Esempio**. La funzione "raddoppia" sugli interi è il sottoinsieme delle coppie `Intero x Intero` dato da `{ (1, 2), (2, 4), (3, 6), ... }`. Questa è quella che viene chiamata definizione *estensionale*, cioè si enumerano uno per uno gli elementi dell'insieme. Ovviamente quando l'insieme è infinito come in questo caso, la definizione può risultare un po' scomoda.

Si può ovviare a questo problema introducendo quella che si chiama definizione *intensionale*, ovvero si esprime una condizione che deve valere per tutte le coppie `(x, y)` che è `y = x * 2`. Questa è la familiare forma con cui conosciamo la funzione raddoppia e come la scriviamo in JavaScript

```js
const double = x => x * 2
```

La definizione di funzione come sottoinsieme di un prodotto cartesiano evidenzia perchè in matematica, e quindi in programmazione funzionale, tutte le funzioni sono (devono essere) pure. Non c'è azione, modifica di stato o modifica degli elementi (che sono considerati immutabili) degli insiemi coinvolti.

## Funzioni parziali

Una funzione *parziale*, ovvero che non è definita per tutti i valori del dominio, può essere sempre ricondotta ad una funzione totale aggiungendo un valore speciale, chiamiamolo `null`, al codominio

```
f: A -> (B U null)
```

Ecco come viene implementato l'insieme `B U null` in vari linguaggi:

- `Option[B]` in Scala
- `Maybe b` in Haskell
- `A | null` in Flow o TypeScript

## Come si gestiscono i side effect?

L'unica alternativa per descrivere una funzione non pura è modellarla con una funzione pura ed che è ciò che si fa in programmazione funzionale: la funzione restituisce, oltre che al normale valore, anche una descrizione dell'effetto.

**Esempio**. Questa è una funzione impura

```js
function sum(a, b) {
  console.log(a, b) // <= side effect
  return a + b
}
```

per modellarla come funzione pura modifico il codominio e restituisco una descrizione del side effect

```js
// sum :: number -> number -> (number, string)
function sum(a, b) {
  return [a + b, `log: ${a}, ${b}`]
}
```

In programmazione funzionale si tende a spingere la descrizione dei side effect al confine del sistema e solo allora vengono eseguiti da un interprete.

```
system = pure core + imperative shell
```

Nei linguaggi *puramente* funzionali (come Haskell o PureScript) questo schema è imposto dal linguaggio stesso.

## Che vantaggi ha il functional programming?

What I mean by code being “easy to reason about (dependably/correctly/rigorously)” is that the code has precise and simple meaning as math. And that this relationship between code and its math meaning is “compositional”, i.e., that the meaning of a compound expression is a (precise & simple) function of the meanings of the component expressions, so that reasoning about the code corresponds simply & predictably with reasoning about the math. What Peter Landin called “denotative” as a substantive replacement for the fuzzy terms “functional”, “declarative”, or “non-procedural” - Conal Elliott on Medium

Typically when writing a program, your job doesn't end with merely writing the code, but you would also want to know some properties your code exhibits. You can arrive at these properties by two means: either by logical analysis or by empirical observation.

Examples of such properties include:

- correctness (does the program do what it is supposed to)
- performance (how long does it take)
- scalability (how is performance affected with input)
- security (can the algorithm be maliciously misused)

When you measure these properties empirically, you get results with limited precision. Therefore mathematically proving these properties is far superior, however it is not always easy to do. Functional languages typically have as one of their design goals making mathematical proofs of their properties more tractable. This is what is typically meant by reasoning about programs. - Jakub Hampl on StackOverflow


