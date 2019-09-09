/*

  # Summary

  Supponiamo di avere una web app con utenti,
  ogni utente ha un suo profilo, e di dover implementare
  la feature modifica profilo (updateCustomerProfile).

  I requisiti sono i seguenti

  - la richiesta di modifica del profilo è rappresentata
    da un modello di dominio (UpdateProfileRequest)
  - occorre aggiornare le informazioni nel database (updateProfile)
  - se l'email dell'utente è cambiata occorre mandare una email al vecchio
    indirizzo per notificare l'avvenuto cambiamento (sendEmailChangedNotification)

  Incominciamo col modellare il problema

*/

import * as T from 'fp-ts/lib/Task'

export interface MonadDB {
  getEmail: (userId: number) => T.Task<string>
  updateProfile: (userId: number, name: string, email: string) => T.Task<void>
}

export interface MonadEmail {
  sendEmailChangedNotification: (newEmail: string, oldEmail: string) => T.Task<void>
}

/*

  `MonadDB` e `MonadEmail` rappresentano le
  "capabilities" di cui ha bisogno l'applicazione.

  Il prefisso `Monad` sta ad inidicare che il codominio
  di ogni operazione ha un effetto a cui corrisponde una
  istanza di monade (in questo caso specifico `Task`)

*/

export interface UpdateProfileRequest {
  userId: number
  name: string
  email: string
}

declare const monadDB: MonadDB
declare const monadEmail: MonadEmail

/*

  In questa prima versione le istanze `monadDB` e `monadEmail`
  sono cablate nel codice. Si faccia conto che siano importate
  staticamente come moduli. Lo scopo ora è cercare di scablarle.

*/

import { pipe, pipeable } from 'fp-ts/lib/pipeable'

/**
 * Restituisce `true` se è stata inviata una notifica
 *
 * In questa versione le dipendenze sono cablate nel codice
 */
export const updateCustomerProfile1 = (request: UpdateProfileRequest): T.Task<boolean> =>
  pipe(
    monadDB.getEmail(request.userId),
    T.chain(oldEmail =>
      pipe(
        monadDB.updateProfile(request.userId, request.name, request.email),
        T.chain(() => {
          if (oldEmail !== request.email) {
            return pipe(
              monadEmail.sendEmailChangedNotification(request.email, oldEmail),
              T.map(() => true)
            )
          } else {
            return T.task.of(false)
          }
        })
      )
    )
  )

/*

  La prima operazione da fare è chiaramente quella di passare le dipendenze come argomenti
  e usare il currying. In questo modo abbiamo la possibilità di iniettare le dipendenze
  ed ottenere una API dalla firma pulita.

*/

export declare const updateCustomerProfile2: (
  monadDB: MonadDB,
  monadEmail: MonadEmail
) => (request: UpdateProfileRequest) => T.Task<boolean>

/*

  Il "problema" di questa soluzione è che
  ogni consumer di updateCustomerProfile2 deve
  preoccuparsi di passare gli argomenti
  `MonadDB` e `MonadEmail`.

  Ora, forte dell'adagio che in programmazione funzionale
  essere pigri è una qualità invece di un difetto,
  faccio una operazione a prima vista bizzarra:
  scambio l'ordine dei due gruppi di argomenti nella funzione curried,
  postponendo la necessità di avere a disposizione le dipendenze.

  Aggiungo anche un nuovo type alias per avere un solo
  parametro contenente tutte le dipendenze.

*/

export interface Deps {
  db: MonadDB
  email: MonadEmail
}

export declare const updateCustomerProfile3: (
  request: UpdateProfileRequest
) => (dependencies: Deps) => T.Task<boolean>

/*

  In pratica sto ritardando il più possibile il binding
  delle dipendenze invece di farlo il prima possibile.
  Adesso dovrebbe essere chiaro come si ottiene `Reader`,
  guardate l'ultima parte della firma

  (dependencies: Deps) => Task<boolean>

  Non è altro che Reader<Deps, Task<boolean>>

*/

import { Reader } from 'fp-ts/lib/Reader'

export declare const updateCustomerProfile4: (
  request: UpdateProfileRequest
) => Reader<Deps, T.Task<boolean>>

/*

  Avendo due monadi innestate (Reader e Task) conviene definire una terza
  monade che le comprende.

*/

import { Monad2 } from 'fp-ts/lib/Monad'
import { getReaderM } from 'fp-ts/lib/ReaderT'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    ReaderTask: ReaderTask<E, A>
  }
}

interface ReaderTask<E, A> extends Reader<E, T.Task<A>> {}

const { map, ap, of, chain } = getReaderM(T.task)

const monadReaderTask: Monad2<'ReaderTask'> = {
  URI: 'ReaderTask',
  map,
  ap,
  of,
  chain
}

const RT = pipeable(monadReaderTask)

/*

  Addesso ridefinisco le capabilities
  in funzione di `ReaderTask`

*/

const getEmail = (userId: number): ReaderTask<Deps, string> => e => e.db.getEmail(userId)

const updateProfile = (request: UpdateProfileRequest): ReaderTask<Deps, void> => e =>
  e.db.updateProfile(request.userId, request.name, request.email)

const sendEmailChangedNotification = (
  newEmail: string,
  oldEmail: string
): ReaderTask<Deps, void> => {
  return e => e.email.sendEmailChangedNotification(newEmail, oldEmail)
}

/*

  ...e le uso per ridefinire updateCustomerProfile

*/

const updateCustomerProfile5 = (
  request: UpdateProfileRequest
): ReaderTask<Deps, boolean> =>
  pipe(
    getEmail(request.userId),
    RT.chain(oldEmail =>
      pipe(
        updateProfile(request),
        RT.chain(() => {
          if (request.email !== oldEmail) {
            return pipe(
              sendEmailChangedNotification(request.email, oldEmail),
              RT.map(() => true)
            )
          } else {
            return of(false)
          }
        })
      )
    )
  )

/*

  Ora come è possibile testare il nostro programma?

  Semplicemente defininendo delle istanze di test
  per per `MonadDB` e `MonadEmail`

*/

/** scrive dallo standard output */
export const putStrLn = (message: string): T.Task<void> => () =>
  new Promise(res => {
    res(console.log(message))
  })

let _email = 'a@gmail.com'

const withMessage = <A>(message: string, fa: T.Task<A>): T.Task<A> => {
  return pipe(
    putStrLn(message),
    T.chain(() => fa)
  )
}

const setEmail = (email: string): T.Task<void> => () => {
  _email = email
  return Promise.resolve(undefined)
}

const db: MonadDB = {
  getEmail: (userId: number) =>
    withMessage(`getting email for ${userId}: ${_email}`, T.of(_email)),
  updateProfile: (_userId: number, _name: string, email: string) =>
    withMessage(
      `updating profile` +
        (_email !== email ? ` and changing email from ${_email} to ${email}` : ''),
      setEmail(email)
    )
}

const email: MonadEmail = {
  sendEmailChangedNotification: (newEmail: string, _oldEmail: string) =>
    putStrLn(`sending change notification to ${newEmail}`)
}

const testDeps: Deps = {
  db,
  email
}

// program: ReaderTask<Deps, boolean>
const program = updateCustomerProfile5({
  userId: 1,
  name: 'foo',
  email: 'b@gmail.com'
})

// tslint:disable-next-line: no-floating-promises
program(testDeps)().then(console.log)
/*
getting email for 1: a@gmail.com
updating profile and changing email from a@gmail.com to b@gmail.com
sending change notification to b@gmail.com
true
*/
