/*

  Problema: ho una lista di `TaskEither<L, A>`,
  vorrei avere come risultato un `TaskEither<L, Array<A>>`
  ma cortocircuitando l'errore: ovvero alla prima azione
  che fallisce, termino la computazione

*/

import {
  URI,
  TaskEither,
  taskEither,
  left,
  right
} from 'fp-ts/lib/TaskEither'
import { sequence } from 'fp-ts/lib/Traversable'
import { array } from 'fp-ts/lib/Array'
import { task, fromIO } from 'fp-ts/lib/Task'
import { log } from 'fp-ts/lib/Console'

const tasksWithFailure: Array<
  TaskEither<string, number>
> = [
  left(task.of('error')),
  right(fromIO(log('2')).map(() => 2))
]

sequence(taskEither, array)(tasksWithFailure)
  .run()
  .then(result => console.log(result))
/*
2 // <= sulla console vedo anche questo!
left("error") // <= risultato
*/

/*

  Questo perchè l'istanza di default di `Applicative`
  per `TaskEither` esegue le azioni in parallelo.

  Per ottenere il risultato desiderato definisco
  un'altra istanza di `Applicative` assicurandomi
  che sia sequenziale

*/

import { Applicative2 } from 'fp-ts/lib/Applicative'

const seqApplicativeTaskEither: Applicative2<URI> = {
  URI: taskEither.URI,
  map: taskEither.map,
  of: taskEither.of,
  ap: (fab, fa) =>
    taskEither.chain(fab, f => taskEither.map(fa, f)) // derivata da chain, per cui sequenziale
}

const mysequence = sequence(seqApplicativeTaskEither, array)

mysequence(tasksWithFailure)
  .run()
  .then(result => console.log(result)) // left('error'), nessun log visibile

const tasksAllSuccess: Array<TaskEither<string, number>> = [
  right(fromIO(log('1')).map(() => 1)),
  right(fromIO(log('2')).map(() => 2))
]

mysequence(tasksAllSuccess)
  .run()
  .then(result => console.log(result)) // right([1, 2]), sulla console vedi anche 1 e 2
