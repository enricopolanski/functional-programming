import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'

interface User {}

// If Page X doesn't have more users it will return empty array ([])
function getUsersByPage(page: number): Promise<Array<User>> {
  return Promise.resolve(page < 3 ? ['a', 'b'] : [])
}

const getUsers = (page: number): TE.TaskEither<Error, ReadonlyArray<User>> =>
  TE.tryCatch(
    () => getUsersByPage(page),
    () => new Error(`Error while fetching page: ${page}`)
  )

const step = (
  page: number,
  users: ReadonlyArray<User>
): TE.TaskEither<Error, ReadonlyArray<User>> =>
  pipe(
    getUsers(page),
    TE.chain((result) =>
      result.length === 0 ? TE.of(users) : step(page + 1, users.concat(result))
    )
  )

export const getAllUsers: TE.TaskEither<Error, ReadonlyArray<User>> = step(
  0,
  []
)

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import * as E from 'fp-ts/Either'

async function test() {
  assert.deepStrictEqual(
    await getAllUsers(),
    E.right(['a', 'b', 'a', 'b', 'a', 'b'])
  )
}

test()
