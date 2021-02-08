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

interface Ok<A> {
  readonly code: 200
  readonly body: A
}
interface NotFound {
  readonly code: 404
  readonly message: string
}
type HttpResponse<A> = Ok<A> | NotFound

// -------------------------------------
// constructors
// -------------------------------------

const ok = <A>(body: A): HttpResponse<A> => ({ code: 200, body })
const notFound = (message: string): HttpResponse<never> => ({
  code: 404,
  message
})

// -------------------------------------
// API
// -------------------------------------

export const getByUsername: (username: string) => HttpResponse<User> = flow(
  queryByUsername,
  match(() => notFound('User not found.'), ok)
)
