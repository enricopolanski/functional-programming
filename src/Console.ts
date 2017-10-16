import { createInterface } from 'readline'
import { Task } from './Task'

export const prompt: Task<string> = new Task(
  () =>
    new Promise(resolve => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question('> ', answer => {
        rl.close()
        resolve(answer)
      })
    })
)

export const log = (message: string): Task<void> =>
  new Task(
    () =>
      new Promise(res => {
        res(console.log(message))
      })
  )
