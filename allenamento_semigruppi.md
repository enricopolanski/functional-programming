```js
// @flow

interface Semigroup<A> {
  concat(x: A, y: A): A;
}

// concatena due stringhe
const stringSemigroup: Semigroup<string> = {
  concat: (x, y) => x + y
}

// concatena due booleani (OR)
const all: Semigroup<boolean> = {
  concat: (x, y) => x && y
}

// concatena due funzioni: la funzione restituita applica lo stesso argomento
// alle due funzioni e poi concatena i risultati. Notare che per concatenare
// i risultati occorre un'istanza di semigruppo per il tipo di ritorno B
function getFunctionSemigroup<A, B>(semigroup: Semigroup<B>): Semigroup<(a: A) => B> {
  return {
    concat: (x, y) => a => semigroup.concat(x(a), y(a))
  }
}

// primo test: una funzione che data una stringa concatena la sua versione
// maiuscola e quella minuscola
const toUpperCase = s => s.toUpperCase()
const toLowerCase = s => s.toLowerCase()
const bothCase = getFunctionSemigroup(stringSemigroup).concat(toUpperCase, toLowerCase)

console.log(bothCase('abc')) // => ABCabc

// secondo test: scrivere una funzione che restituisce
// true se le parentesi sono bilanciate
const startsWith = token => s => s.startsWith(token)
const endsWith = token => s => s.endsWith(token)
const parens = getFunctionSemigroup(all).concat(startsWith('('), endsWith(')'))

console.log(parens('(+ 1 2)')) // => true
console.log(parens('(+ 1 2')) // => false
```
