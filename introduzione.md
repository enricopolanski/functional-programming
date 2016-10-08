# Cosa vuol dire "functional programming"?

Per me vuol dire fare matematica applicata (o informatica altamente matematizzata).

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
