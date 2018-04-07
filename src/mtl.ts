import { Option, fromNullable } from 'fp-ts/lib/Option'
import { IO, io } from 'fp-ts/lib/IO'

interface MonadKVStoreIO<A> {
  get: (key: string) => IO<Option<A>>
  set: (key: string, value: A) => IO<void>
}

const update = <A>(K: MonadKVStoreIO<A>) => (
  key: string,
  f: (a: A) => A
): IO<void> =>
  K.get(key).chain(o =>
    o.fold(io.of(undefined), a => K.set(key, f(a)))
  )

const double = (n: number): number => n * 2

const program3 = (K: MonadKVStoreIO<number>): IO<void> =>
  K.set('a', 1)
    .chain(() => K.set('b', 2))
    .chain(() => update(K)('c', double))
