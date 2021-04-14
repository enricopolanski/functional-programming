/*

  Rifattorizzare il seguente codice in modo da eliminare l'errore di compilazione.

*/
import { flow } from 'fp-ts/function'
import { match, Option } from 'fp-ts/Option'

interface User {
  readonly username: string
}

declare const queryByUsername: (username: string) => Option<User>

// -------------------------------------
// model
// -------------------------------------

interface HttpResponse<T> {
  readonly code: number
  readonly body: T
}

// -------------------------------------
// API
// -------------------------------------

export const getByUsername: (
  username: string
) => HttpResponse<User | string> = flow(
  queryByUsername,
  match(
    () => ({ code: 404, body: 'User not found.' }),
    // @ts-ignore
    (user) => ({ code: 200, body: user }) // Error: Type 'User' is not assignable to type 'string'
  )
)
