import { Task } from 'fp-ts/lib/Task'

export const delay = (millis: number) => <A>(
  a: A
): Task<A> =>
  new Task(
    () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve(a)
        }, millis)
      })
  )
