/**
 * Implementare la funzione `fold`
 */
import { pipe } from 'fp-ts/function'
import { Semigroup } from 'fp-ts/Semigroup'
import * as N from 'fp-ts/number'

const fold = <A>(S: Semigroup<A>) => (startWith: A) => (
  as: ReadonlyArray<A>
): A => as.reduce((a, acc) => pipe(acc, S.concat(a)), startWith)

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

assert.deepStrictEqual(fold(N.SemigroupSum)(0)([1, 2, 3, 4]), 10)

assert.deepStrictEqual(fold(N.SemigroupProduct)(1)([1, 2, 3, 4]), 24)
