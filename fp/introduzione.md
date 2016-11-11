# Cosa vuol dire "functional programming"?

Per me vuol dire fare matematica applicata.

Facciamo due esempi

- come catturare il concetto di operazione parallelizzabile?
- che cos'è una funzione "pura"?

## Operazioni parallelizzabili

Il concetto di operazione parallelizzabile può essere catturato dalla nozione di operazione associativa.

Sia `A` un insieme, una operazione `*: A x A -> A` si dice *associativa* se per ogni `a, b, c ∈ A` vale

```
(a * b) * c = a * ( b * c )
```

L'insieme `A` dotato dell'operazione `*` è un esempio di *algebra* e prende il nome di `Semigruppo` (`Semigroup`).

Esempio di parallelizzazione, l'operazione principale viene suddivisa in due sotto-operazioni, ognuna delle quali viene nuovamente suddivisa:

```
( ( a * b ) * ( c * d ) ) * ( ( e * f ) * ( g * h ) )
```

## Funzioni pure

A (pure total) function `f: A -> B` is a subset `f` of `A x B` such that for all `a ∈ A` exists exactly one `b ∈ B` such that `(a, b) ∈ f`

`A` si dice *dominio* di `f`, `B` *codominio*.

Una funzione parziale può essere sempre ricondotta ad una funzione totale aggiungendo un valore speciale al codominio (perciò le funzioni parziali sono "poco interessanti" da un certo punto di vista)

```
f: A -> (B U null)
```

Esempi dell'insieme `B U null` (o equivalente) in vari linguaggi:

- `Option[B]` in Scala
- `Maybe B` in Haskell
- `?A` in Flow

Se si realizza che quel sottinsieme deve essere descritto "staticamente" in fase di definizione della funzione (ovvero quel sottoinsieme non può variare nel tempo o per nessuna condizione esterna) ecco che viene fuori la "purezza".

Per esempio la funzione "raddoppia" sugli interi è il sottoinsieme delle coppie `Intero x Intero` dato da `{ (1, 2), (2, 4), (3, 6), ... }`. Questa è quella che viene chiamata definizione *estensionale*, cioè si enumerano uno per uno gli elementi dell'insieme. Ovviamente quando l'insieme è infinito come in questo caso, la definizione può risultare un po' scomoda.

Si può ovviare a questo problema introducendo quella che si chiama definizione *intensionale*, ovvero si esprime una condizione che deve valere per tutte le coppie `(x, y)` che è `y = x * 2`. Questa è la familiare forma con cui conosciamo la funzione raddoppia e come la scriviamo in JavaScript

```js
const double = x => x * 2
```

La definizione di funzione come sottoinsieme di un prodotto cartesiano evidenzia perchè in matematica, e quindi in functional programming, tutte le funzioni sono (devono essere) pure. Non c'è azione, modifica di stato o modifica degli elementi (che sono considerati immutabili) degli insiemi coinvolti.

L'unica alternativa per descrivere una funzione non pura è modellarla con una funzione pura ed che è ciò che si fa in functional programming: la funzione restituisce, oltre che al normale valore, anche una descrizione dell'effetto.

Facciamo un esempio, questa è una funzione impura

```js
function sum(a, b) {
  console.log(a, b) // <= side effect
  return a + b
}
```

per modellarla come funzione pura modifico il tipo di ritorno e restituisco una descrizione del side effect

```js
function sum(a, b) {
  return [a + b, `per favore qualcuno prima o poi mi faccia il piacere di loggare ${a}, ${b}`]
}
```

## Che vantaggi ha il functional programming?

What I mean by code being “easy to reason about (dependably/correctly/rigorously)” is that the code has precise and simple meaning as math. And that this relationship between code and its math meaning is “compositional”, i.e., that the meaning of a compound expression is a (precise & simple) function of the meanings of the component expressions, so that reasoning about the code corresponds simply & predictably with reasoning about the math. What Peter Landin called “denotative” as a substantive replacement for the fuzzy terms “functional”, “declarative”, or “non-procedural” - Conal Elliott on Medium

Typically when writing a program, your job doesn't end with merely writing the code, but you would also want to know some properties your code exhibits. You can arrive at these properties by two means: either by logical analysis or by empirical observation.

Examples of such properties include:

- correctness (does the program do what it is supposed to)
- performance (how long does it take)
- scalability (how is performance affected with input)
- security (can the algorithm be maliciously misused)

When you measure these properties empirically, you get results with limited precision. Therefore mathematically proving these properties is far superior, however it is not always easy to do. Functional languages typically have as one of their design goals making mathematical proofs of their properties more tractable. This is what is typically meant by reasoning about programs. - Jakub Hampl on StackOverflow


