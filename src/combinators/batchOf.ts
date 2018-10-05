import { Task, task, delay, fromIO } from 'fp-ts/lib/Task'
import { sequence } from 'fp-ts/lib/Traversable'
import { array, isOutOfBound } from 'fp-ts/lib/Array'
import { log } from 'fp-ts/lib/Console'

export const chop = <A, B>(as: Array<A>, f: (as: Array<A>) => [B, Array<A>]): Array<B> => {
  const result: Array<B> = []
  let cs: Array<A> = as
  while (cs.length > 0) {
    const [b, c] = f(cs)
    result.push(b)
    cs = c
  }
  return result
}

export const split = <A>(as: Array<A>, n: number): [Array<A>, Array<A>] => {
  return [as.slice(0, n), as.slice(n)]
}

export const chunksOf = <A>(as: Array<A>, n: number): Array<Array<A>> => {
  return isOutOfBound(n - 1, as) ? [as] : chop(as, as => split(as, n))
}

const sequenceTasks = sequence(task, array)

export const batchOf = <A>(tasks: Array<Task<A>>, n: number): Task<Array<A>> => {
  return chunksOf(tasks, n).reduce(
    (b: Task<Array<A>>, chunk: Array<Task<A>>) => b.chain(xs => sequenceTasks(chunk).map(ys => xs.concat(ys))),
    task.of([])
  )
}

//
// Usage
//

const withLog = <A>(message: string, fa: Task<A>): Task<A> => {
  return fromIO(log(`[START] ${message}`))
    .chain(() => fa)
    .chain(a => fromIO(log(`[END] ${message}`)).map(() => a))
}

const mkTestTask = <A>(a: A, d: number = 1000): Task<A> => withLog(String(a), delay(d, a))

const tasks: Array<Task<string>> = [
  mkTestTask('a'),
  mkTestTask('b', 2000),
  mkTestTask('c'),
  mkTestTask('d', 2000),
  mkTestTask('e'),
  mkTestTask('f', 2000),
  mkTestTask('g')
]

batchOf(tasks, 2)
  .run()
  .then(console.log)
/*
[START] a
[START] b
[END] a
[END] b
[START] c
[START] d
[END] c
[END] d
[START] e
[START] f
[END] e
[END] f
[START] g
[END] g
[ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ]
*/
