import { Task } from './Task'

export const random: Task<number> = new Task(() =>
  Promise.resolve(Math.random())
)

export const randomInt = (
  low: number,
  high: number
): Task<number> =>
  random.map(n => Math.floor((high - low + 1) * n + low))
