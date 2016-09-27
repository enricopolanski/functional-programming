# Funzioni (totali)

Siano `A` e `B` due insiemi, una funzione `f: A -> B` è un sottoinsieme di `A x B`, chiamiamolo `F`, tale che per ogni `a ∈ A` esiste uno e un solo `b ∈ B` per cui `(a, b) ∈ F`.

In altre parole una funzione `f` associa ad ogni elemento `a ∈ A` uno e un solo elemento `b ∈ B` e si scrive `b = f(a)`

La definizione di funzione evidenzia perchè in matematica, e quindi in functional programming, tutte le funzioni sono *pure*. Non c'è azione, modifica di stato o modifica degli elementi (che sono considerati immutabili) degli insiemi coinvolti.

Una funzione non è niente altro che una pura associazione **statica** tra elementi.

`A` si dice il *dominio* di `f`, mentre `B` si dice il suo *codominio*.

L'insieme `f(A)` di tutti i `b ∈ B` tali che esiste un `a ∈ A` per cui `b = f(a)` si chiama *immagine di A tramite f*. Si noti che `f(A)` in generale non coincide con `B` (può esserne un sottoinsieme proprio).

Sono sinonimi di "funzione" i seguenti termini

- morfismo
- mappa
- azione

## Endomorfismi

Un *endomorfismo* è una funzione in cui dominio e codominio coicidono.

## Funzioni parziali

Sia `f: A -> B` e `C` un insieme che contiene strettamente `A` (ovvero esiste un elemento `c ∈ C` che non appartiene ad `A`), allora `f` si dice essere una *funzione parziale su C*.

**Esempio**. `f(x) = 1 / x` è una funzione parziale su `number` (insieme dei numeri).

Ad una funzione parziale `f: A -> B` su `C`, può essere associata una funzione totale `g: C -> B U { n }` definita da

```js
g(x) = f(x) se x ∈ A
g(x) = n    altrimenti
```

## Partizioni

Ogni funzione `f: A -> B` induce una [relazione di equivalenza](relazioni.md#relazione-di-equivalenza) `≅` su `A` detta *partizione indotta da f* e così definita

```
a ≅ b se e solo se f(a) = f(b)
```
