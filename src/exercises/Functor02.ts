/**
 * Implementare l'istanza di `Functor` per `Either`
 */
import { URI, right, left } from 'fp-ts/Either'
import { Functor2 } from 'fp-ts/Functor'

const Functor: Functor2<URI> = {
  URI,
  map: null as any
}

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const double = (n: number): number => n * 2

assert.deepStrictEqual(Functor.map(right(1), double), right(2))
assert.deepStrictEqual(Functor.map(left('a'), double), left('a'))
