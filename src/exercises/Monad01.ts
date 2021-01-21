/**
 * Definire l'istanza di `Monad` per `Either<E, A>`
 */
import { Monad2 } from 'fp-ts/lib/Monad'
import * as E from 'fp-ts/Either'

const Monad: Monad2<E.URI> = {
  map: null as any,
  of: null as any,
  chain: null as any
}

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(
    Monad.of(1),
    Monad.map((n: number) => n * 2)
  ),
  E.right(2)
)
assert.deepStrictEqual(
  pipe(
    Monad.of(1),
    Monad.chain((n: number) => (n > 0 ? Monad.of(n * 2) : E.left('error')))
  ),
  E.right(2)
)
assert.deepStrictEqual(
  pipe(
    Monad.of(-1),
    Monad.chain((n: number) => (n > 0 ? Monad.of(n * 2) : E.left('error')))
  ),
  E.left('error')
)
