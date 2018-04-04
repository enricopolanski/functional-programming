/*

  Chiamiamo "wizard" un programma che chiede all'utente un certo numero di input
  e una volta raccolti esegue una serie di azioni.

  Ecco un semplice esempio di wizard

*/

import { Task, task, getMonoid } from 'fp-ts/lib/Task'
import { Monoid, monoidVoid } from 'fp-ts/lib/Monoid'
import { putStrLn, getLine } from './Console'

export const program = putStrLn('What is your name?')
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

// program.run()

/*

  Possiamo notare però che l'esempio combina due wizard

  - il primo wizard richiede e mostra il nome dell'utente
  - il secondo wizard richiede e mostra l'età dell'utente

  Tuttavia dobbiamo intrecciare la logica di questi due wizard
  poichè dobbiamo richiedere tutti gli input prima di eseguire
  una qualsiasi azione.

  E' possibile definire i due wizard separatamente e poi combinarli
  in un wizard più grande?

  Possiamo farlo defininedo una istanza di Monoid per Task<Task<void>>.

  Vediamo nel dettaglio come.

  Prima di tutto occorre definire una istanza di Monoid per un generico Task<A>

*/

const name: Task<Task<void>> = putStrLn(
  'What is your name?'
)
  .chain(() => getLine)
  .map(name => putStrLn(`Your name is ${name}`))

const age: Task<Task<void>> = putStrLn('What is your age?')
  .chain(() => getLine)
  .map(age => putStrLn(`Your age is ${age}`))

const monoidWizard: Monoid<Task<Task<void>>> = getMonoid(
  getMonoid(monoidVoid)
)

import { flatten } from 'fp-ts/lib/Chain'

// requestInput: <A>(mma: Task<Task<A>>) => Task<A>
const requestInput = flatten(task)

export const program2 = requestInput(
  monoidWizard.concat(name, age)
)

// program2.run()

/*

  Questa tecnica funziona per un qualsiasi numero di wizard.

  Definiamo un helper per creare wizard come `name` e `age`

*/

const makeWizard = (attribute: string): Task<Task<void>> =>
  putStrLn(`What is your ${attribute}?`)
    .chain(() => getLine)
    .map(response =>
      putStrLn(`Your ${attribute} is ${response}`)
    )

// verifico che program3 si comporta come program2
export const program3 = requestInput(
  monoidWizard.concat(makeWizard('name'), makeWizard('age'))
)

// program3.run()

/*

  Ed ora possiamo creare un unico wizard da un Foldable di wizard

*/

import { foldMap } from 'fp-ts/lib/Foldable'
import { array } from 'fp-ts/lib/Array'

export const program4 = requestInput(
  foldMap(array, monoidWizard)(
    ['name', 'age', 'favorite color', 'sign'],
    makeWizard
  )
)

// program4.run()
