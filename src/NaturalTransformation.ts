import {
  Option,
  fromNullable,
  none,
  some
} from 'fp-ts/lib/Option'
import { Either } from 'fp-ts/lib/Either'
import { IO } from 'fp-ts/lib/IO'
import { Task } from 'fp-ts/lib/Task'

export const fromOption = <A>(fa: Option<A>): Array<A> =>
  fa.fold([], a => [a])

export const head = <A>(fa: Array<A>): Option<A> =>
  fromNullable(fa[0])

export const fromEither = <L, A>(
  fa: Either<L, A>
): Option<A> => fa.fold(() => none, some)

export const fromIO = <A>(fa: IO<A>): Task<A> =>
  new Task(() => Promise.resolve(fa.run()))
