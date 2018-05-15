/*

  # Summary

  In questa demo vedremo una particolare istanza di `Monoid`
  per `Task` e sfrutteremo `foldMap` per gestire dei wizard.

  ## Getting started

  Chiamiamo "wizard" un programma che chiede all'utente un certo numero di
  informazioni e, una volta raccolte, esegue una serie di azioni.

  Ecco un semplice esempio di wizard:

*/

import { getLine, putStrLn } from './Console'

/**
 * Chiede all'utente nome ed età e poi le stampa a video
 */
export const wizard = putStrLn('What is your name?')
  .chain(() => getLine)
  .chain(name =>
    putStrLn('What is your age?')
      .chain(() => getLine)
      .chain(age =>
        putStrLn(`Your name is ${name}`).chain(() =>
          putStrLn(`Your age is ${age}`)
        )
      )
  )

// wizard.run()

/*

  Possiamo notare però che `program` combina due wizard

  - il primo wizard richiede e mostra il nome dell'utente
  - il secondo wizard richiede e mostra l'età dell'utente

  Tuttavia dobbiamo intrecciare la logica di questi due wizard
  poichè dobbiamo richiedere tutti gli input prima di eseguire
  una qualsiasi azione.

  E' possibile definire i due wizard separatamente e poi combinarli
  in un wizard più grande?

  Se si, a quale astrazione possiamo fare riferimento?

  Incominciamo a definire i due wizard separatamente

*/

import { Task } from 'fp-ts/lib/Task'

export type Wizard = Task<Task<void>>

const name: Wizard = putStrLn('What is your name?')
  .chain(() => getLine)
  .map(name => putStrLn(`Your name is ${name}`))

const age: Wizard = putStrLn('What is your age?')
  .chain(() => getLine)
  .map(age => putStrLn(`Your age is ${age}`))

/*

  Notate come, contrariamente al solito, ho voluto
  definire `name` e `age` in modo che abbiano tipo `Task<Task<void>>`
  invece di `Task<void>`. La ragione sarà chiara in pochi momenti.

  Definiamo una istanza di `Monoid` per `Task<Task<void>>`
  usando il combinatore `getMonoid` di `Task`

*/

import { getMonoid } from 'fp-ts/lib/Task'
import { Monoid, monoidVoid } from 'fp-ts/lib/Monoid'

// Si noti il doppio uso di `getMonoid`
const monoidWizard: Monoid<Wizard> = getMonoid(
  getMonoid(monoidVoid)
)

/*

  La ragione per cui un `Wizard` ha bisogno di
  avere due `Task` innestati è che il `Task` più
  esterno, quando eseguito, richiede solo l'input,
  mentre il `Task` più interno, stampa solo l'output.
  In questo modo le due operazioni rimangono separate.

  Richiedere solo l'input perciò equivale a fare una
  `run` del `Task` esterno, ovvero fare una `flatten`
  di un `Wizard`

*/

export const wizard2: Wizard = monoidWizard.concat(
  name,
  age
)

/*

  Come eseguire un `Wizard`?
  Semplicemente facendone una `flatten`
  e poi fare una `run`

*/

import { identity } from 'fp-ts/lib/function'

export const runWizard = (w: Wizard) =>
  w.chain(identity).run()

// runWizard(wizard2)

/*

  Questa tecnica funziona per un qualsiasi numero di wizard.

  Definiamo un helper per creare wizard come `name` e `age`

*/

const makeWizard = (attribute: string): Wizard =>
  putStrLn(`What is your ${attribute}?`)
    .chain(() => getLine)
    .map(response =>
      putStrLn(`Your ${attribute} is ${response}`)
    )

// verifico che wizard3 si comporti come wizard2
export const wizard3 = monoidWizard.concat(
  makeWizard('name'),
  makeWizard('age')
)

// runWizard(wizard3)

/*

  Ed ora possiamo creare un unico wizard da un `Foldable` di wizard
  sfruttando la funzione `foldMap`

*/

import { foldMap } from 'fp-ts/lib/Foldable'
import { array } from 'fp-ts/lib/Array'

// foldMap :: Foldable f, Monoid m => Array a -> (a -> m) -> m

export const wizard4 = foldMap(array, monoidWizard)(
  ['name', 'age', 'favorite color', 'sign'],
  makeWizard
)

// runWizard(wizard4)
