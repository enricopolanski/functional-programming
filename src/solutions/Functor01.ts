/**
 * Implementare l'istanza di `Functor` per `IO`
 */
import { URI } from 'fp-ts/IO'
import { Functor1 } from 'fp-ts/Functor'

const Functor: Functor1<URI> = {
  URI,
  map: (fa, f) => () => f(fa())
}

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const double = (n: number): number => n * 2

assert.deepStrictEqual(Functor.map(() => 1, double)(), 2)
