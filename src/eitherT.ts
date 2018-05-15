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

/**
 * Data un array di tuple chiave / valore restituisce
 * una StrMap con la strategia di merging scelta
 */
const fromArray = fromFoldable(array)

type S3Error = 'notFound'

const getUrl = (bank: string): string =>
  `https://s3.buckets.my-buckets/${bank}/config`

/** fake API */
const s3ListObjects = (
  url: string
): TaskEither<S3Error, Array<string>> => {
  switch (url) {
    case getUrl('banca1'):
      return right(
        delay(500)(['payload-banca1-1', 'payload-banca1-2'])
      )
    case getUrl('banca2'):
      return right(
        delay(500)(['payload-banca2-1', 'payload-banca2-2'])
      )
    case getUrl('banca3'):
      return right(
        delay(500)(['payload-banca3-1', 'payload-banca3-2'])
      )
    default:
      return left(delay(2000)<S3Error>('notFound'))
  }
}

const program = (
  banks: Array<string>
): TaskEither<S3Error, StrMap<string[]>> =>
  traverse(taskEither, array)(banks, bank =>
    s3ListObjects(getUrl(bank)).map(ss => tuple(bank, ss))
  ).map(as => fromArray(as, identity))

program(['banca1', 'banca2', 'banca3'])
  .run()
  .then(sm => console.log(sm))
/*
right({
  "value": {
    "banca1": [
      "payload-banca1-1",
      "payload-banca1-2"
    ],
    "banca2": [
      "payload-banca2-1",
      "payload-banca2-2"
    ],
    "banca3": [
      "payload-banca3-1",
      "payload-banca3-2"
    ]
  }
})
*/

program(['banca4'])
  .run()
  .then(sm => console.log(sm))
/*
left("notFound")
*/
