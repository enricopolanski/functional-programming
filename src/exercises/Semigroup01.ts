/**
 * Implementare la funzione `fold`
 */
import { Semigroup, semigroupProduct, semigroupSum } from 'fp-ts/Semigroup'

declare const fold: <A>(
  M: Semigroup<A>
) => (startWith: A) => (as: ReadonlyArray<A>) => A

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

assert.deepStrictEqual(fold(semigroupSum)(0)([1, 2, 3, 4]), 10)

assert.deepStrictEqual(fold(semigroupProduct)(1)([1, 2, 3, 4]), 24)
