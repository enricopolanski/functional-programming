/**
 * Definire l'istanza di `Monad` per `type TaskEither<E, A> = Task<Either<E, A>>`
 */
import * as T from 'fp-ts/Task'
import * as E from 'fp-ts/Either'
import { Monad2 } from 'fp-ts/lib/Monad'
import { URI } from 'fp-ts/TaskEither'

const Monad: Monad2<URI> = {
  URI,
  map: (f) => T.map(E.map(f)),
  of: (a) => T.of(E.of(a)),
  chain: (f) => (ma) => pipe(ma, T.chain(E.fold((e) => T.of(E.left(e)), f)))
}

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

async function test() {
  assert.deepStrictEqual(
    await pipe(
      Monad.of(1),
      Monad.map((n: number) => n * 2)
    )(),
    E.right(2)
  )
  assert.deepStrictEqual(
    await pipe(
      Monad.of(1),
      Monad.chain((n: number) =>
        n > 0 ? Monad.of(n * 2) : T.of(E.left('error'))
      )
    )(),
    E.right(2)
  )
  assert.deepStrictEqual(
    await pipe(
      Monad.of(-1),
      Monad.chain((n: number) =>
        n > 0 ? Monad.of(n * 2) : T.of(E.left('error'))
      )
    )(),
    E.left('error')
  )
}

// tslint:disable-next-line: no-floating-promises
test()
