import { TaskEither, fromLeft, taskEither } from 'fp-ts/lib/TaskEither'
import { Either, right } from 'fp-ts/lib/Either'

/**
 * Return `Right` if the given action succeeds, `Left` if it throws
 */
const attempt = <L, A>(fa: TaskEither<L, A>): TaskEither<L, Either<L, A>> => {
  return new TaskEither(fa.value.map(e => right(e)))
}

/**
 * Make sure that a resource is cleaned up in the event of an exception. The
 * release action is called regardless of whether the body action throws or
 * returns.
 */
export const bracket = <L, A, B>(
  acquire: TaskEither<L, A>,
  use: (a: A) => TaskEither<L, B>,
  release: (a: A) => TaskEither<L, void>
): TaskEither<L, B> => {
  return acquire.chain(a =>
    attempt(use(a)).chain(e => release(a).chain(() => e.fold(l => fromLeft(l), b => taskEither.of(b))))
  )
}
