/*

  # Summary

  In questa demo vedremo come caricare una lista
  di oggetti da S3 gestendo gli eventuali errori

*/

import {
  TaskEither,
  taskEither,
  right,
  left
} from 'fp-ts/lib/TaskEither'
import { StrMap, fromFoldable } from 'fp-ts/lib/StrMap'
import { array } from 'fp-ts/lib/Array'
import { traverse } from 'fp-ts/lib/Traversable'
import { tuple, identity } from 'fp-ts/lib/function'
import { delay } from './Task'

/** il tipo degli errori restituiti dall'API di S3 */
type S3Error = 'notFound'

/** il tipo del payload */
type BankObject = string

/**
 * helper, converte un id di una banca nel corrispondente
 * url a cui richiedere i payload
 */
const getUrl = (bankId: string): string =>
  `https://s3.buckets.my-buckets/${bankId}/config`

/** fake S3 API */
const s3ListObjects = (
  url: string
): TaskEither<S3Error, Array<BankObject>> => {
  switch (url) {
    case getUrl('banca1'):
      return right(
        // <- lifting
        delay(500)(['payload-banca1-1', 'payload-banca1-2'])
      )
    case getUrl('banca2'):
      return right(
        delay(500)([
          'payload-banca2-1',
          'payload-banca2-2',
          'payload-banca2-3'
        ])
      )
    case getUrl('banca3'):
      return right(delay(500)(['payload-banca3-1']))
    default:
      return left(delay(2000)<S3Error>('notFound')) // <- lifting
  }
}

/**
 * Finalmente veniamo al programma principale.
 *
 * Data una lista di banche, recupera per ogni banca
 * una lista di configurazioni e le immagazzina in una
 * mappa
 */
const program = (
  banks: Array<string>
): TaskEither<S3Error, StrMap<Array<BankObject>>> =>
  traverse(taskEither, array)(banks, bank =>
    s3ListObjects(getUrl(bank)).map(ss => tuple(bank, ss))
  ).map(as => fromFoldable(array)(as, identity))

program(['banca1', 'banca2', 'banca3'])
  .run()
  .then(x => console.log(x))
/*
right({
  "value": {
    "banca1": [
      "payload-banca1-1",
      "payload-banca1-2"
    ],
    "banca2": [
      "payload-banca2-1",
      "payload-banca2-2",
      "payload-banca2-3"
    ],
    "banca3": [
      "payload-banca3-1"
    ]
  }
})
*/

program(['banca1', 'banca4'])
  .run()
  .then(sm => console.log(sm))
/*
left("notFound")
*/
