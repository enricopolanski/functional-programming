/**
 * Implementare la funzione `fold`
 */
import { Semigroup } from 'fp-ts/Semigroup'
import * as N from 'fp-ts/number'

declare const fold: <A>(
  M: Semigroup<A>
) => (startWith: A) => (as: ReadonlyArray<A>) => A

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

assert.deepStrictEqual(fold(N.SemigroupSum)(0)([1, 2, 3, 4]), 10)

assert.deepStrictEqual(fold(N.SemigroupProduct)(1)([1, 2, 3, 4]), 24)
