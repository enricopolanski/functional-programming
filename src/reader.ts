/*

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

import { Task, task } from 'fp-ts/lib/Task'

export interface MonadDB {
  getEmail(userId: number): Task<string>
  updateProfile(
    userId: number,
    name: string,
    email: string
  ): Task<void>
}

export interface MonadEmail {
  sendEmailChangedNotification(
    newEmail: string,
    oldEmail: string
  ): Task<void>
}

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

/** Restituisce `true` se è stata inviata una notifica */
export const updateCustomerProfile1 = (
  request: UpdateProfileRequest
): Task<boolean> =>
  monadDB.getEmail(request.userId).chain(oldEmail =>
    monadDB
      .updateProfile(
        request.userId,
        request.name,
        request.email
      )
      .chain(() => {
        if (oldEmail !== request.email) {
          return monadEmail
            .sendEmailChangedNotification(
              request.email,
              oldEmail
            )
            .map(() => true)
        } else {
          return task.of(false)
        }
      })
  )

/*

  La prima operazione da fare è chiaramente quella di passare le dipendenze come argomenti
  e usare il currying. In questo modo abbiamo la possibilità di iniettare le dipendenze
  ed ottenere una API dalla firma pulita.

*/

export declare const updateCustomerProfile2: (
  monadDB: MonadDB,
  monadEmail: MonadEmail
) => (request: UpdateProfileRequest) => Task<boolean>

/*

  Il problema di questa soluzione è che
  ogni consumer di updateCustomerProfile2 deve
  preoccuparsi di passare gli argomenti
  MonadDB e MonadEmail.

  Ora, forte dell'adagio che in programmazione funzionale
  essere pigri è una qualità invece di un difetto,
  faccio una operazione a prima vista bizzarra:
  scambio l'ordine dei due gruppi di argomenti nella funzione curried.

  Aggiungo anche un nuovo type alias per avere un solo
  parametro contenente tutte le dipendenze.

*/

export interface Deps {
  db: MonadDB
  email: MonadEmail
}

export declare const updateCustomerProfile3: (
  request: UpdateProfileRequest
) => (dependencies: Deps) => Task<boolean>

/*

  In pratica sto ritardando il più possibile il binding
  delle dipendenze invece di farlo il prima possibile.
  Adesso dovrebbe essere chiaro come si ricava Reader,
  guardate l'ultima parte della firma

  (dependencies: Deps) => Task<boolean>

  Non è altro che Reader<Deps, Task<boolean>>

*/

import { Reader } from 'fp-ts/lib/Reader'

export declare const updateCustomerProfile4: (
  request: UpdateProfileRequest
) => Reader<Deps, Task<boolean>>

/*

  Avendo due monadi innestate (Reader e Task) conviene definire una terza
  monade che le comprende (vedi monad transformer)

*/

class ReaderTask<E, A> {
  constructor(readonly run: (e: E) => Task<A>) {}
  chain<B>(
    f: (a: A) => ReaderTask<E, B>
  ): ReaderTask<E, B> {
    return new ReaderTask(e =>
      this.run(e).chain(a => f(a).run(e))
    )
  }
  map<B>(f: (a: A) => B): ReaderTask<E, B> {
    return this.chain(a => of(f(a)))
  }
}

const of = <E, A>(a: A): ReaderTask<E, A> =>
  new ReaderTask(_ => task.of(a))

/*

  Addesso definisco qualche funzione di utility
  in funzione di ReaderTask

*/

const getEmail = (
  userId: number
): ReaderTask<Deps, string> =>
  new ReaderTask(e => e.db.getEmail(userId))

const updateProfile = (
  request: UpdateProfileRequest
): ReaderTask<Deps, void> =>
  new ReaderTask(e =>
    e.db.updateProfile(
      request.userId,
      request.name,
      request.email
    )
  )

const sendEmailChangedNotification = (
  newEmail: string,
  oldEmail: string
): ReaderTask<Deps, boolean> => {
  if (newEmail !== oldEmail) {
    return new ReaderTask(e =>
      e.email
        .sendEmailChangedNotification(newEmail, oldEmail)
        .map(() => true)
    )
  } else {
    return of(false)
  }
}

/*

  ...e le uso per ridefinire updateCustomerProfile

*/

const updateCustomerProfile5 = (
  request: UpdateProfileRequest
): ReaderTask<Deps, boolean> =>
  getEmail(request.userId).chain(oldEmail =>
    updateProfile(request).chain(() =>
      sendEmailChangedNotification(request.email, oldEmail)
    )
  )

/*

  Definisco delle istanze
  di test

*/

import { putStrLn } from './Console'

let _email = 'a@gmail.com'

const db: MonadDB = {
  getEmail: (userId: number) =>
    putStrLn(
      `[DEBUG]: getting email for ${userId}: ${_email}`
    ).map(() => _email),
  updateProfile: (
    _userId: number,
    _name: string,
    email: string
  ) =>
    putStrLn(
      `[DEBUG]: changing email from ${_email} to ${email}`
    ).chain(
      () =>
        new Task(() => {
          _email = email
          return Promise.resolve(undefined)
        })
    )
}

const email: MonadEmail = {
  sendEmailChangedNotification: (
    newEmail: string,
    _oldEmail: string
  ) =>
    putStrLn(
      `[DEBUG]: sending change notification to ${newEmail}`
    )
}

const deps: Deps = {
  db,
  email
}

// program: ReaderTask<Deps, boolean>
const program = updateCustomerProfile5({
  userId: 1,
  name: 'foo',
  email: 'b@gmail.com'
})

program
  // decommentare per eseguire il programma due volte di seguito
  // .chain(notified =>
  //   program.map(notified2 => notified || notified2)
  // )
  .run(deps)
  .run()
  .then(notified => {
    console.log(notified)
  })
/*
[DEBUG]: getting email for 1: a@gmail.com
[DEBUG]: changing email from a@gmail.com to b@gmail.com
[DEBUG]: sending change notification to b@gmail.com
true
*/
