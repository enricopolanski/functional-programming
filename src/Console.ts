import { log } from 'fp-ts/Console'
import { fromIO, Task } from 'fp-ts/Task'
import { createInterface } from 'readline'

/** reads from the standard input */
export const getLine: Task<string> = () =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question('> ', (answer) => {
      rl.close()
      resolve(answer)
    })
  })

/** writes to the standard output */
export const putStrLn = (message: string): Task<void> => fromIO(log(message))
