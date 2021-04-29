/**
 * Convertire il seguente codice in stile funzionale
 */

interface User {
  readonly name: string
}

// If Page X doesn't have more users it will return empty array ([])
declare function getUsersByPage(page: number): Promise<Array<User>>

async function getAllUsers(): Promise<Array<User>> {
  let currentUsers: Array<User> = []
  let totalUsers: Array<User> = []
  let page = 0
  do {
    currentUsers = await getUsersByPage(page)
    totalUsers = totalUsers.concat(currentUsers)
    page++
  } while (currentUsers.length > 0)
  return totalUsers
}

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
