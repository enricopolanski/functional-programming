import { log } from 'fp-ts/lib/Console'
import { Task, task } from 'fp-ts/lib/Task'
import { createInterface } from 'readline'

/** legge dallo standard input */
export const getLine: Task<string> = () =>
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

/** scrive dallo standard output */
export const putStrLn = (message: string): Task<void> =>
  task.fromIO(log(message))
