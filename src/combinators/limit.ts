import { TaskEither, right, left as teLeft } from 'fp-ts/lib/TaskEither'
import { getRaceMonoid, delay } from 'fp-ts/lib/Task'
import { Either, left } from 'fp-ts/lib/Either'

const limit = <L, A>(fa: TaskEither<L, A>, millis: number, l: L): TaskEither<L, A> => {
  const M = getRaceMonoid<Either<L, A>>()
  const failure = delay(millis, l).map<Either<L, A>>(left)
  return new TaskEither(M.concat(fa.value, failure))
}

const fa = right<string, string>(delay(1000, 'a'))
// const fa = right<string, string>(delay(100, 'a'))
// const fa = teLeft<string, string>(delay(100, 'error'))

const lfa = limit(fa, 500, 'limit error')

lfa.run().then(console.log)
