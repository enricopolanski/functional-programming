/**
 * Definire l'istanza di `Monad` per `Either<E, A>`
 */
import { Monad2 } from 'fp-ts/Monad'
import * as E from 'fp-ts/Either'

const Monad: Monad2<E.URI> = {
  URI: E.URI,
  map: null as any,
  of: null as any,
  ap: null as any,
  chain: null as any
}

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

assert.deepStrictEqual(
  Monad.map(Monad.of(1), (n: number) => n * 2),
  E.right(2)
)
assert.deepStrictEqual(
  Monad.chain(Monad.of(1), (n: number) =>
    n > 0 ? Monad.of(n * 2) : E.left('error')
  ),
  E.right(2)
)
assert.deepStrictEqual(
  Monad.chain(Monad.of(-1), (n: number) =>
    n > 0 ? Monad.of(n * 2) : E.left('error')
  ),
  E.left('error')
)
