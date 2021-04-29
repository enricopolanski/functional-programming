import { Semigroup } from 'fp-ts/Semigroup'
import * as fc from 'fast-check'

// -------------------------------------------------------------------------------------
// laws
// -------------------------------------------------------------------------------------

// prima di tutto ho codificato la proprietà associativa come una funzione che restituisce un `boolean`

export const laws = {
  semigroup: {
    associativity: <A>(S: Semigroup<A>) => (a: A, b: A, c: A): boolean =>
      S.concat(S.concat(a, b), c) === S.concat(a, S.concat(b, c))
  }
}

// -------------------------------------------------------------------------------------
// properties
// -------------------------------------------------------------------------------------

// poi ho definito una `property` di `fast-check` tramite una funzione che accetta il semigruppo da testare (parametro `S`)
// e un `Arbitrary` di `fast-check`.
// Un `Arbitrary<A>` è un data type che rappresenta la possiblità di creare valori di tipo `A` in modo random.

export const properties = {
  semigroup: {
    associativity: <A>(S: Semigroup<A>, arb: fc.Arbitrary<A>) =>
      // dato che la legge che ho definito necessita di tre parametri (`a`, `b`, `c`),
      // passo l'arbitrary a `fc.property` tre volte, una per ogni parametro.
      fc.property(arb, arb, arb, laws.semigroup.associativity(S))
  }
}

// La libreria a questo punto fa tutto da sola una volta che chiamo `fc.assert`, bombarda cioè la proprietà
// che ho definito con delle terne casuali da usare come `a`, `b`, `c` e verifica che la proprietà restituisca sempre `true`

// Nel caso non avvenga, la libreria è in grado di mostrare un controesempio.
// Se guardate più sotto vado a testare la proprietà associativa per il magma `MagmaSub` (che abbiamo visto nel corso)

// -------------------------------------------------------------------------------------
// tests
// -------------------------------------------------------------------------------------

import { Magma } from 'fp-ts/Magma'

export const MagmaSub: Magma<number> = {
  concat: (x, y) => x - y
}

// prova che `MagmaSub` non è un semigruppo se viene trovato un controesempio
// in questo caso ho scelto di bombardare `MagmaSub` con interi casuali usando
// l'Arbitrary `fc.integer` messo a disposizione da `fast-check`
fc.assert(properties.semigroup.associativity(MagmaSub, fc.integer()))

// se lanciate questo file con `ts-node src/laws.ts` dovreste vedere un output di questo tipo:
/*
Error: Property failed after 1 tests
{ seed: 1835229399, path: "0:0:0:1:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0", endOnFailure: true }
Counterexample: [0,0,1]
Shrunk 32 time(s)
Got error: Property failed by returning false
*/

// Il controesempio trovato è [0,0,1] (che sarebbe la tupla di parametri `[a, b, c]` che fanno fallire la legge)
// Infatti:
// console.log(pipe(0, MagmaSub.concat(0), MagmaSub.concat(1))) // => -1
// console.log(pipe(0, MagmaSub.concat(pipe(0, MagmaSub.concat(1))))) // => 1

// -------------------------------------

// `last` e `first` producono dei semigruppi? non posso dirlo con certezza usando
// property testing perchè i seguenti assert NON producono controesempi

// fc.assert(properties.semigroup.associativity(Se.first<number>(), fc.integer()))
// fc.assert(properties.semigroup.associativity(Se.last<number>(), fc.integer()))
