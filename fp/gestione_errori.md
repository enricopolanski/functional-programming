# Gestione degli errori

Lanciare eccezioni è un side effect, quindi è proibito. Quindi come si fa? Come abbiamo già visto per altri casi (funzioni non totali) si allarga il codominio, i due signori usati di più sono `Maybe` e `Either`. `Maybe` l'abbiamo già visto, `Either` è una unione di due tipi `L | R` dove per convenzione il "left" (`L`) denota il tipo dell'errore e il "right" (`R`) denota il tipo del successo. `Either` viene usato quando si ha l'esigenza di specificare meglio qual'è il problema (`Maybe` si limita a segnalare che c'è stato un problema). Se l'operazione ha successo si mette il risultato dentro il right, se è fallita si mette la ragione dentro il left.

In Flow potrebbe per esempio essere implementato così

```js
type Either<L, R> = { type: 'Left', left: L } | { type: 'Right', right: R };
```

`Either` è una [monade](../categorie/monadi.md)

```js
function of<L, A>(right: A): Either<L, A> {
  return { type: 'Right', right }
}

function map<L, A, B>(f: (a: A) => B, fa: Either<L, A>): Either<L, B> {
  if (fa.type === 'Left') {
    return fa
  }
  return of(f(fa.right))
}

function join<L, A>(mma: Either<L, Either<L, A>>): Either<L, A> {
  if (mma.type === 'Left') {
    return mma
  }
  return mma.right
}

// oppure

function chain<L, A, B>(f: (a: A) => Either<L, B>, ma: Either<L, A>): Either<L, B> {
  if (ma.type === 'Left') {
    return ma
  }
  return f(ma.right)
}

function left<L, R>(left: L): Either<L, R> {
  return { type: 'Left', left }
}
```

Due esempi:

a) Type safe `head` con `Maybe`

```js
// qui l'errore è così banale che non sto neanche a codificarlo
// quindi restituisco un Maybe<A>
function head<A>(xs: Array<A>): Maybe<A> {
  if (xs.length > 0) {
    return xs[0]
  }
  return null
}
```

b) Number validation con `Either`

```js
// codifico gli errori con delle stringhe
function validateNumber(s: string): Either<string, number> {
  const n = parseFloat(s)
  if (isNaN(n)) {
    return { type: 'Left', left: `invalid number ${s}` }
  }
  return of(n)
}
```

`validateNumber` può essere composta con altre Kleisli arrows

```js
function greaterThan(n: number): (a: number) => Either<string, number> {
  return a => {
    if (a > n) {
      return of(a)
    }
    return { type: 'Left', left: `invalid number: ${a}, expected a number greater than ${n}` }
  }
}

const numberGreaterThan2 = (s: string): Either<string, number> => {
  return chain(greaterThan(2), validateNumber(s))
}

console.log(numberGreaterThan2('a')) // => {type: "Left", left: "invalid number a"}
console.log(numberGreaterThan2('1')) // => {type: "Left", left: "invalid number: 1, expected a number greater than 2"}
console.log(numberGreaterThan2('3')) // => {type: "Right", right: 3}
```
