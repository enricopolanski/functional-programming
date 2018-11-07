import { Type, URIS } from 'fp-ts/lib/HKT'
import { Monad1 } from 'fp-ts/lib/Monad'

interface MonadConsole<M extends URIS> extends Monad1<M> {
  readLine: Type<M, string>
  putStrLn: (s: string) => Type<M, void>
}

const echo = <M extends URIS>(M: MonadConsole<M>): Type<M, void> => {
  return M.chain(M.readLine, M.putStrLn)
}

import * as I from 'fp-ts/lib/IO'

const monadConsoleIO: MonadConsole<I.URI> = {
  ...(I.io as Monad1<I.URI>),
  readLine: new I.IO(() => window.prompt() || ''),
  putStrLn: s => new I.IO(() => alert(s))
}

const actualEchoIO = echo(monadConsoleIO)

// actualEchoIO.run()
// mostra un prompt e poi un alert nel browser

import * as T from 'fp-ts/lib/Task'
import { createInterface } from 'readline'
import * as C from 'fp-ts/lib/Console'

const monadConsoleTask: MonadConsole<T.URI> = {
  ...(T.task as Monad1<T.URI>),
  readLine: new T.Task(
    () =>
      new Promise(resolve => {
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout
        })
        rl.question('', answer => {
          rl.close()
          resolve(answer)
        })
      })
  ),
  putStrLn: s => T.fromIO(C.log(s))
}

const actualEchoTask = echo(monadConsoleTask)

// actualEchoTask.run()

const log: Array<string> = []

const monadConsoleIOTest: MonadConsole<I.URI> = {
  ...(I.io as Monad1<I.URI>),
  readLine: new I.IO(() => 'hello'), // simulo l'input utente
  putStrLn: s =>
    new I.IO(() => {
      log.push(s) // scrivo su un log invece che sulla console
    })
}

import * as assert from 'assert'

const actualEchoIOTest = echo(monadConsoleIOTest)

actualEchoIOTest.run()
assert.deepEqual(log, ['hello'])
