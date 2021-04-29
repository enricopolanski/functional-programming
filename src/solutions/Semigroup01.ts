/**
 * Implementare la funzione `concatAll`
 */
import { Semigroup } from 'fp-ts/Semigroup'
import * as N from 'fp-ts/number'
import * as S from 'fp-ts/string'

const concatAll = <A>(S: Semigroup<A>) => (startWith: A) => (
  as: ReadonlyArray<A>
): A => as.reduce(S.concat, startWith)

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

assert.deepStrictEqual(concatAll(N.SemigroupSum)(0)([1, 2, 3, 4]), 10)
assert.deepStrictEqual(concatAll(N.SemigroupProduct)(1)([1, 2, 3, 4]), 24)
assert.deepStrictEqual(concatAll(S.Semigroup)('a')(['b', 'c']), 'abc')
