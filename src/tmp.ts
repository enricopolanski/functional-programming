import { Either } from 'fp-ts/lib/Either'
import * as either from 'fp-ts/lib/Either'
import { Option } from 'fp-ts/lib/Option'
import { Task, task } from 'fp-ts/lib/Task'
import { TaskEither } from 'fp-ts/lib/TaskEither'

export const sum = (a: number) => (b: number): number =>
  a + b

export const sumOptions = (
  fa: Option<number>,
  fb: Option<number>
) => fb.ap(fa.map(sum))

const fromEither = <L, A>(
  fa: Either<L, A>
): TaskEither<L, A> => {
  return new TaskEither(task.of(fa))
}

const right = <L, A>(fa: Task<A>): TaskEither<L, A> => {
  return new TaskEither(fa.map(a => either.right(a)))
}

const left = <L, A>(fa: Task<L>): TaskEither<L, A> => {
  return new TaskEither(fa.map(a => either.left(a)))
}
