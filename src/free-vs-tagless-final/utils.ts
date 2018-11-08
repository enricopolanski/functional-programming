import * as I from 'fp-ts/lib/IO'
import * as T from 'fp-ts/lib/Task'
import * as C from 'fp-ts/lib/Console'

export const prompt: I.IO<string> = new I.IO(() => window.prompt() || '')

export const alert = (message: string): I.IO<void> => new I.IO(() => window.alert(message))

const READLINE = 'readline'

export const question: T.Task<string> = new T.Task(
  () =>
    new Promise(resolve => {
      const rl = require(READLINE).createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question('', (answer: string) => {
        rl.close()
        resolve(answer)
      })
    })
)

export const log = (message: string): T.Task<void> => T.fromIO(C.log(message))
