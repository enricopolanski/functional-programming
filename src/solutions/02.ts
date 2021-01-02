/**
 * Implementare la funzione `fold`
 *
 * @category Semigroup
 */
import { pipe } from 'fp-ts/lib/function'
import { Semigroup, semigroupProduct, semigroupSum } from 'fp-ts/Semigroup'

const fold = <A>(S: Semigroup<A>) => (startWith: A) => (
  as: ReadonlyArray<A>
): A => as.reduce((a, acc) => pipe(acc, S.concat(a)), startWith)

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

assert.deepStrictEqual(fold(semigroupSum)(0)([1, 2, 3, 4]), 10)

assert.deepStrictEqual(fold(semigroupProduct)(1)([1, 2, 3, 4]), 24)
