Introduzione alla programmazione funzionale

[PDF](./fp.pdf)

# Perchè le monadi sono un fondamentale strumento pratico

Le monadi sono fondamentali perchè permettono di comporre qualsiasi tipo di programma.

## Programmi

Un programma è modellato da una funzione

```
program: A -> B
```

ovvero `program` è un programma con input di tipo `A` e che produce un output di tipo `B`.

## Composizione di programmi

Due programmi `g: A -> B` e `f: B -> C` possono essere composti in un programma `h` se e solo se il tipo dell'output del
primo programma coincide con il tipo di input del secondo programma

```
h: A -> C
h = compose(f, g)
```

## Type constructor

Un type constructor è una feature di un linguaggio formale tipizzato che construisce nuovi tipi da tipi esistenti.

Esempi: `Array<A>`, `Option<A>`, `Task<A>`

## Programmi impuri

Un programma impuro è un programma in cui il codominio è un type constructor `M`

```
program: A -> M<B>
```

ovvero `program` è un programma con input di tipo `A` , che produce un output di tipo `B` e che nel farlo produce un
effetto `M`.

## Funtori

Dato un type constructor `M`, una istanza di funtore per `M` è una funzione `lift` tale che

* `lift` ha firma `<A, B>(f: (a: A) => B) => ((ma: M<A>)`
* `lift(id) = id` (Identity Law)
* `lift(compose(f, g)) = compose(lift(f), lift(g))` (Composition Law)

## Composizione di un programma impuro con un programma

Un programma impuro `g: A -> M<B>` può essere composto con un programma `f: B -> C` in un programma impuro `h` se `M` ha
una istanza di funtore

```
h: A -> M<C>
h = compose(lift(f), g)
```

## Monadi

Dato un type constructor `M`, una istanza di monade per `M` è una terna di funzioni `(lift, pure, join)` tale che

* `lift` è una istanza di funtore per `M`
* `pure` ha firma `<A>(a: A) => M<A>`
* `join` ha firma `<A>(mma: M<M<A>>) => M<A>`
* `composeK(g, pure) = g` (Right identity law)
* `composeK(pure, g) = g` (Left identity law)
* `composeK(composeK(f, g), h) = composeK(f, composeK(g, h))` (Associativity Law)

ove

* `g: A -> M<B>`
* `f: B -> M<C>`
* `h: C -> M<D>`
* `composeK(f, g) = compose(join, lift(f), g)`

## Composizione di un programma impuro con un programma impuro

Un programma impuro `g: A -> M<B>` può essere composto con un programma impuro `f: B -> M<C>` in un programma impuro `h`
se `M` ha una istanza di monade

```
h: A -> M<C>
h = composeK(f, g)
```
