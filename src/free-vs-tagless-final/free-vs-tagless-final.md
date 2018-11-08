Come esempio userò quello classico di leggere / scrivere sulla console, iniziamo con tagless final di cui abbiamo già parlato

# Tagless final

In questo stile si descrivono le operazioni come membri di una interfaccia

```ts
import { Type, URIS } from 'fp-ts/lib/HKT'
import { Monad1 } from 'fp-ts/lib/Monad'

interface MonadConsole<M extends URIS> extends Monad1<M> {
  readLine: Type<M, string>
  putStrLn: (message: string) => Type<M, void>
}
```

E' importante notare che i tipi di ritorno non sono concreti ma sono parametrizzati da `M` che rappresenta il costruttore di una struttura dati che ammette una istanza di monade.

Questo permette di scegliere in un secondo momento il contesto monadico in cui girerà il nostro programma (e quindi anche di averne più di uno volendo).

I programmi sono scritti in funzione di `MonadConsole`.

Vediamo come si scrive il programma `echo`

```ts
const echo = <M extends URIS>(M: MonadConsole<M>): Type<M, void> => {
  return M.chain(M.readLine, M.putStrLn)
}
```

Come sempre con tagless final, il programma accetta come dipendenza l'algebra delle operazioni e il body è scritto in funzione delle operazioni (`M.readLine` e `M.putStrLn`) e dell'interfaccia monadica (`M.chain`).

Per poter eseguire il programma abbiamo bisogno di costruire una istanza di `MonadConsole` ed è in questo momento che possiamo scegliere il contesto monadico in cui girerà il programma. Diciamo che voglio usare `IO` e che il programma girerà dentro il browser

```ts
import * as I from 'fp-ts/lib/IO'

const prompt: I.IO<string> = new I.IO(() => window.prompt() || '')

const alert = (message: string): I.IO<void> => new I.IO(() => window.alert(message))

const monadConsoleIO: MonadConsole<I.URI> = {
  ...(I.io as Monad1<I.URI>),
  readLine: prompt,
  putStrLn: alert
}
```

Per eseguire il programma non resta che passare l'istanza e chiamare il metodo `run` di `IO`

```ts
const actualEchoIO = echo(monadConsoleIO)

actualEchoIO.run()
// mostra un prompt e poi un alert nel browser
```

Possiamo eseguire lo stesso programma in un contesto monadico diverso, diciamo `Task` poichè voglio usare node.

Definiamo una istanza di `MonadConsole` per `Task`

```ts
import * as T from 'fp-ts/lib/Task'
import { createInterface } from 'readline'
import * as C from 'fp-ts/lib/Console'

const question: T.Task<string> = new T.Task(
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
)

const log = (message: string): T.Task<void> => T.fromIO(C.log(message))

const monadConsoleTask: MonadConsole<T.URI> = {
  ...(T.task as Monad1<T.URI>),
  readLine: question,
  putStrLn: log
}
```

Ancora una volta per eseguire il programma non resta che passare la nuova istanza e chiamare il metodo `run` di `Task`, questa volta eseguo il file da node

```ts
const actualEchoTask = echo(monadConsoleTask)

actualEchoTask.run()
// legge e scrive sulla console
```

Per testare il programma si definisce una istanza di test, vediamo un esempio

```ts
const logger: Array<string> = []

const monadConsoleIOTest: MonadConsole<I.URI> = {
  ...(I.io as Monad1<I.URI>),
  readLine: new I.IO(() => 'hello'), // simulo l'input utente
  putStrLn: message =>
    new I.IO(() => {
      logger.push(message) // scrivo sul `logger` invece che sulla console
    })
}
```

Dopo aver eseguito il programma posso testare il contenuto del `logger`

```ts
import * as assert from 'assert'

const actualEchoIOTest = echo(monadConsoleIOTest)

actualEchoIOTest.run()
assert.deepEqual(log, ['hello'])
// ok
```

# Free monad

In questo stile si descrivono le operazioni con un sum type polimorfico (ovvero che possiede un type parameter `A`).

L'idea generale è

- Fase 1: definire una struttura dati che descrive l'algebra delle operazioni (in pratica il mio DSL)
- Fase 2: fare in modo di inserire il DSL in un contesto monadico in modo che si possa specificare il controllo di flusso
- Fase 3: scrivere il programma in funzione del DSL inserito
- Fase 4: infine scrivere un interprete che traduce il DSL inserito in un contesto monadico concreto

## Fase 1

Vediamo come si procede dal punto di vista operativo.

La regola generale per disegnare il membro del sum type relativo ad una operazione è la seguente

1. i parametri dell'operazione diventano campi della struttura dati
2. il tipo di ritorno dell'operazione, chiamiamolo `R`, diventa un campo aggiuntivo `more` con firma `(r: R) => A`

Applichiamo questa regola al problema della console

```ts
const URI = 'Console'

type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT<A> {
    Console: Console<A>
  }
}

type Console<A> = ReadLine<A> | PutStrLn<A>

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
```

Se togliamo il boilerplate dovuto a questioni tecniche di `fp-ts` il sum type `Console<A>` è

```ts
type Console<A> = ReadLine<A> | PutStrLn<A>

class ReadLine<A> {
  constructor(readonly more: (input: string) => A) {}
}

class PutStrLn<A> {
  constructor(readonly message: string, readonly more: A) {}
}
```

Se lo confrontiamo con la versione tagless final possiamo vedere applicata la regola

```ts
interface MonadConsole<M extends URIS> extends Monad1<M> {
  readLine: Type<M, string>
  putStrLn: (message: string) => Type<M, void>
}
```

- `readLine` non ha argomento dunque `ReadLine<A>` non ha campi relativi
- `readLine` ha come tipo di ritorno `string` dunque `ReadLine<A>` ha un campo aggiuntivo `more` di tipo `(input: string) => A`
- `putStrLn` ha un argomento `message` di tipo `string` dunque `PutStrLn<A>` ha un campo `message` di tipo `string`
- `putStrLn` ha come tipo di ritorno `void` dunque `PutStrLn<A>` ha un campo aggiuntivo `more` di tipo `(_: void) => A`

**Nota**. Siccome l'argomento di `(_: void) => A` non dà alcuna informazione possiamo pensarlo come `() => A` e a questo punto possiamo farlo collassare semplicemente ad `A`

## Fase 2

Ora dobbiamo fare in modo che il nostro DSL abbia una istanza di monade, per fare questp viene in aiuto il modulo `fp-ts/lib/Free`.

Dal punto di vista operativo dobbiamo definire un costruttore apposito per ogni membro del sum type che inserisce la struttura dati nella Free monad

```ts
import * as free from 'fp-ts/lib/Free'

const readLine: free.Free<'Console', string> = free.liftF(new ReadLine(a => a))

const putStrLn = (message: string): free.Free<'Console', void> => free.liftF(new PutStrLn(message, undefined))
```

## Fase 3

Scriviamo il programma `echo`

```ts
const echo = readLine.chain(putStrLn)
```

## Fase 4

Scriviamo un interprete verso `IO`

```ts
import * as I from 'fp-ts/lib/IO'

const interpretIO = <A>(fa: Console<A>): I.IO<A> => {
  switch (fa._tag) {
    case 'ReadLine':
      return prompt.map(fa.more)
    case 'PutStrLn':
      return alert(fa.message).map(() => fa.more)
  }
}
```

**Nota**. `prompt` e `alert` sono gli stessi definiti nel capitolo Tagless final.

Ora per eseguire il programma basta interpretarlo usando la funzione `foldFree` e chiamare il metodo `run` di `IO`

```ts
const actualEchoIO = free.foldFree(I.io)(interpretIO, echo)

actualEchoIO.run()
```

Scriviamo ora un interprete per `Task` in modo da far girare il programma in node

```ts
import * as T from 'fp-ts/lib/Task'

const interpretTask = <A>(fa: Console<A>): T.Task<A> => {
  switch (fa._tag) {
    case 'ReadLine':
      return question.map(fa.more)
    case 'PutStrLn':
      return log(fa.message).map(() => fa.more)
  }
}

const actualEchoTask = free.foldFree(T.task)(interpretTask, echo)

actualEchoTask.run()
```

**Nota**. `question` e `log` sono gli stessi definiti nel capitolo Tagless final.

Vediamo infine un interprete di test

```ts
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
```
