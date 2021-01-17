/**
 * Implementare l'istanza di `Functor` per `IO`
 */
import { URI } from 'fp-ts/IO'
import { Functor1 } from 'fp-ts/lib/Functor'

const Functor: Functor1<URI> = {
  URI,
  map: (f) => (fa) => () => f(fa())
}

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const double = (n: number): number => n * 2

assert.deepStrictEqual(pipe(() => 1, Functor.map(double))(), 2)
