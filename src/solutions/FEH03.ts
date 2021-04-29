/**
 * Definire una istanza di `Semigroup` per `Either`
 */
import { Semigroup } from 'fp-ts/Semigroup'
import { Either, right, left, isLeft } from 'fp-ts/Either'
import * as S from 'fp-ts/string'

const getSemigroup = <E, A>(S: Semigroup<A>): Semigroup<Either<E, A>> => ({
  concat: (first, second) =>
    isLeft(first)
      ? first
      : isLeft(second)
      ? second
      : right(S.concat(first.right, second.right))
})

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const SE = getSemigroup<number, string>(S.Semigroup)

assert.deepStrictEqual(SE.concat(left(1), left(2)), left(1))
assert.deepStrictEqual(SE.concat(right('a'), left(2)), left(2))
assert.deepStrictEqual(SE.concat(left(1), right('b')), left(1))
assert.deepStrictEqual(SE.concat(right('a'), right('b')), right('ab'))
