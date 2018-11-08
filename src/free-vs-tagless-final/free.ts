//
// Fase 1
//

const URI = 'Console'

type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT<A> {
    Console: Console<A>
  }
}

class ReadLine<A> {
  readonly _tag: 'ReadLine' = 'ReadLine'
  readonly _A!: A
  readonly _URI!: URI
  constructor(readonly more: (input: string) => A) {}
}

class PutStrLn<A> {
  readonly _tag: 'PutStrLn' = 'PutStrLn'
  readonly _A!: A
  readonly _URI!: URI
  constructor(readonly message: string, readonly more: A) {}
}

type Console<A> = ReadLine<A> | PutStrLn<A>

//
// Fase 2
//

import * as free from 'fp-ts/lib/Free'

const readLine: free.Free<'Console', string> = free.liftF(new ReadLine(a => a))

const putStrLn = (message: string): free.Free<'Console', void> => free.liftF(new PutStrLn(message, undefined))

//
// Fase 3
//

const echo = readLine.chain(putStrLn)

//
// Fase 4
//

import * as I from 'fp-ts/lib/IO'
import * as U from './utils'

const interpretIO = <A>(fa: Console<A>): I.IO<A> => {
  switch (fa._tag) {
    case 'ReadLine':
      return U.prompt.map(fa.more)
    case 'PutStrLn':
      return U.alert(fa.message).map(() => fa.more)
  }
}

const actualEchoIO = free.foldFree(I.io)(interpretIO, echo)

// actualEchoIO.run()

import * as T from 'fp-ts/lib/Task'

const interpretTask = <A>(fa: Console<A>): T.Task<A> => {
  switch (fa._tag) {
    case 'ReadLine':
      return U.question.map(fa.more)
    case 'PutStrLn':
      return U.log(fa.message).map(() => fa.more)
  }
}

const actualEchoTask = free.foldFree(T.task)(interpretTask, echo)

// actualEchoTask.run()

const logger: Array<string> = []

const interpretIOTest = <A>(fa: Console<A>): I.IO<A> => {
  switch (fa._tag) {
    case 'ReadLine':
      return new I.IO(() => 'hello').map(fa.more) // simulo l'input utente
    case 'PutStrLn':
      return new I.IO(() => {
        logger.push(fa.message) // scrivo sul `logger` invece che sulla console
      }).map(() => fa.more)
  }
}

import * as assert from 'assert'

const actualEchoIOTest = free.foldFree(I.io)(interpretIOTest, echo)

actualEchoIOTest.run()
assert.deepEqual(logger, ['hello'])
