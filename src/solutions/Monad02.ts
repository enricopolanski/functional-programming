/**
 * Definire l'istanza di `Monad` per `type TaskEither<E, A> = Task<Either<E, A>>`
 */
import * as T from 'fp-ts/Task'
import * as E from 'fp-ts/Either'
import { Monad2 } from 'fp-ts/Monad'
import { URI } from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

const Monad: Monad2<URI> = {
  URI: URI,
  map: (fa, f) => pipe(fa, T.map(E.map(f))),
  of: (a) => T.of(E.of(a)),
  ap: (fab, fa) => () =>
    Promise.all([fab(), fa()]).then(([eab, ea]) => pipe(eab, E.ap(ea))),
  chain: (ma, f) => pipe(ma, T.chain(E.match((e) => T.of(E.left(e)), f)))
}

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

async function test() {
  assert.deepStrictEqual(
    await Monad.map(Monad.of(1), (n: number) => n * 2)(),
    E.right(2)
  )
  assert.deepStrictEqual(
    await Monad.chain(Monad.of(1), (n: number) =>
      n > 0 ? Monad.of(n * 2) : T.of(E.left('error'))
    )(),
    E.right(2)
  )
  assert.deepStrictEqual(
    await Monad.chain(Monad.of(-1), (n: number) =>
      n > 0 ? Monad.of(n * 2) : T.of(E.left('error'))
    )(),
    E.left('error')
  )
}

test()
