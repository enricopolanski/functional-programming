/**
 * Implementare l'istanza di `Functor` per `Either`
 */
import { URI, right, left } from 'fp-ts/Either'
import { Functor2 } from 'fp-ts/lib/Functor'

const Functor: Functor2<URI> = {
  URI,
  map: null as any
}

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const double = (n: number): number => n * 2

assert.deepStrictEqual(pipe(right(1), Functor.map(double)), right(2))
assert.deepStrictEqual(pipe(left('a'), Functor.map(double)), left('a'))
