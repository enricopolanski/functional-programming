# Relazioni

## Prodotto cartesiano

Dati due insiemi `A` e `B`, il *prodotto cartesiano* di `A` e `B`, e si scrive `A x B`, è l'insieme

```
A x B = { (a, b) | a ∈ A, b ∈ B }
```

ovvero l'insieme delle coppie `(a, b)` ove `a` appartiene a `A` e `b` appartiene a `B`.

## Relazione

Dato un insieme `A`, una *relazione* su `A` è un sottoinsieme di `A x A`.

## Relazione di equivalenza

Una "relazione di equivalenza" `R` (solitamente indicata con il simbolo `≅`) su un insieme `A` è una relazione tale che valgono le seguenti proprietà

- *proprietà riflessiva* `a ≅ a` per ogni `a ∈ A`
- *proprietà simmetrica* se `a ≅ b` allora `b ≅ a`, `a, b ∈ A`
- *proprietà transitiva* se `a ≅ b` e `b ≅ c` allora `a ≅ c`, `a, b, c ∈ A`

La relazione `R` "induce" su `A` una "partizione", ovvero in parole spiccie, suddivide `A` in sottoinsiemi disgiunti la cui unione da ancora `A`. Questi sottoinsiemi si chiamano "classi di equivalenza" (di `≅`). L'insieme delle classi di equivalenza viene chiamato "insieme quoziente" ed è solitamente indicato con il simbolo `A / ≅`.

In fantasy/static-land esiste una interfaccia per le relazioni di equivalenza, che si chiama `Setoid`

```
interface Setoid<A> {
  equals(x: A, y: A): boolean
}
```

In Haskell o PureScript è la type class `Eq`.

**Esempio**. `A`: stringhe, `a ≅ b`: `a` ha la stessa iniziale di `b`

## Relazione d'ordine

Una relazione `≤` su `A` si dice *preordine* se valgono

- *proprietà riflessiva* `a ≤ a` per ogni `a ∈ A`
- *proprietà transitiva* se `a ≤ b` e `b ≤ c` allora `a ≤ c`, `a, b, c ∈ A`

**Esempio**. `A`: nodi di un grafo, `a ≤ b`: c'è un percorso da `a` a `b`

Un preordine `≤` su `A` si dice *relazione d'ordine parziale* se vale

- *proprietà antisimmetrica* se `a ≤ b` e `b ≤ a` allora `a = b`, `a, b ∈ A`

**Esempio**. `A`: numeri interi, `a ≤ b`: `a` è divisibile per `b`

Due elementi `a` e `b` si dicono *confrontabili* se `a ≤ b` oppure `b ≤ a`, *inconfrontabili* altrimenti e si scrive `a || b`.

Una relazione d'ordine parziale su `A` si dice *totale* se ogni coppia di elementi di `A` è confrontabile.

**Esempio**. `A`: numeri interi, `a ≤ b`: `a` è minore o uguale a `b`
