/**
 * Definire l'istanza di `Monad` per `Either<E, A>`
 */
import { Monad2 } from 'fp-ts/Monad'
import * as E from 'fp-ts/Either'

const Monad: Monad2<E.URI> = {
  URI: E.URI,
  map: (fa, f) => (E.isLeft(fa) ? fa : E.right(f(fa.right))),
  of: E.right,
  ap: (fab, fa) =>
    E.isLeft(fab) ? fab : E.isLeft(fa) ? fa : E.right(fab.right(fa.right)),
  chain: (ma, f) => (E.isLeft(ma) ? ma : f(ma.right))
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
