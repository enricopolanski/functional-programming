/*

  Supponiamo di avere una web app con utenti, ogni utente ha un suo profilo, e di dover implementare
  la feature modifica profilo (updateCustomerProfile).

  I requisiti sono i seguenti

  - la richiesta di modifica del profilo è rappresentata da un modello di dominio (UpdateProfileRequest)
  - occorre aggiornare le informazioni nel database (updateProfile)
  - se l'email dell'utente è cambiata occorre mandare una email al vecchio
    indirizzo per notificare l'avvenuto cambiamento (sendEmailChangedNotification)

*/

import * as task from '../src/Task'
import { Task } from '../src/Task'
import * as reader from '../src/Reader'
import { Reader } from '../src/Reader'

interface DBService {
  getEmail(userId: number): Task<string>
  updateProfile(
    userId: number,
    name: string,
    email: string
  ): Task<void>
}

interface EmailService {
  sendEmailChangedNotification(
    newEmail: string,
    oldEmail: string
  ): Task<void>
}

type UpdateProfileRequest = {
  userId: number
  name: string
  email: string
}

declare const dbService: DBService
declare const emailService: EmailService

/*

  In questa versione le istanze `dbService` e `emailService`
  sono cablate nel codice. Si faccia conto che siano importate
  staticamente come moduli. Lo scopo ora è cercare di scablarle.

*/
const updateCustomerProfile1 = (
  request: UpdateProfileRequest
): Task<boolean> =>
  dbService.getEmail(request.userId).chain(oldEmail =>
    dbService
      .updateProfile(
        request.userId,
        request.name,
        request.email
      )
      .chain(() => {
        if (oldEmail !== request.email) {
          return emailService
            .sendEmailChangedNotification(
              request.email,
              oldEmail
            )
            .map(() => true)
        }
        return task.of(false)
      })
  )

/*

  La prima operazione da fare è chiaramente quella di passare le dipendenze come argomenti
  e usare il currying. In questo modo abbiamo la possibilità di iniettare le dipendenze
  ed ottenere una API dalla firma pulita.

*/

declare const updateCustomerProfile2: (
  dbService: DBService,
  emailService: EmailService
) => (request: UpdateProfileRequest) => Task<boolean>

/*

  Solo che questa soluzione, pur essendo semplice, non è affatto comoda: tutte le API avranno un gruppo di argomenti
  contenente le dipendenze e che per giunta devono essere passate e distribuite a mano.

  Ora, forte dell'adagio che in programmazione funzionale essere il più possibile pigri è una qualità invece di un difetto,
  faccio una operazione a prima vista bizzarra: scambio l'ordine dei due gruppi di argomenti nella funzione curried.
  Aggiungo anche un nuovo type alias per avere un solo parametro contenente tutte le dipendenze.

*/

interface E {
  dbService: DBService
  emailService: EmailService
}

declare const updateCustomerProfile3: (
  request: UpdateProfileRequest
) => (dependencies: E) => Task<boolean>

/*

  In pratica sto ritardando il più possibile il binding delle dipendenze invece di farlo il prima possibile.
  Adesso dovrebbe essere chiaro come salta fuori Reader, guardate l'ultima parte della firma

  (dependencies: E) => Task<boolean>

  Non è altro che Reader<E, Task<boolean>>

*/

declare const updateCustomerProfile4: (
  request: UpdateProfileRequest
) => Reader<E, Task<boolean>>

/*

  Avendo due monadi innestate (Reader e Task) conviene definire una terza
  monade che le comprende

*/

class ReaderTask<E, A> {
  run: (e: E) => Task<A>
  constructor(run: (e: E) => Task<A>) {
    this.run = run
  }
  chain<B>(
    f: (a: A) => ReaderTask<E, B>
  ): ReaderTask<E, B> {
    return new ReaderTask(e =>
      this.run(e).chain(a => f(a).run(e))
    )
  }
}

const of = <E, A>(a: A): ReaderTask<E, A> =>
  new ReaderTask(e => task.of(a))

/*

  Addesso definisco qualche funzione di utility in funzione di Reader...

*/

const getEmail = (userId: number): ReaderTask<E, string> =>
  new ReaderTask(e => e.dbService.getEmail(userId))

const updateProfile = (
  request: UpdateProfileRequest
): ReaderTask<E, void> =>
  new ReaderTask(e =>
    e.dbService.updateProfile(
      request.userId,
      request.name,
      request.email
    )
  )

const sendEmailChangedNotification = (
  newEmail: string,
  oldEmail: string
): ReaderTask<E, boolean> => {
  if (newEmail !== oldEmail) {
    return new ReaderTask(e =>
      e.emailService
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
): ReaderTask<E, boolean> =>
  getEmail(request.userId).chain(oldEmail =>
    updateProfile(request).chain(() =>
      sendEmailChangedNotification(request.email, oldEmail)
    )
  )

let _email = 'a@gmail.com'
const deps: E = {
  dbService: {
    getEmail: (userId: number) =>
      new Task(
        () =>
          new Promise(resolve => {
            console.log(_email)
            resolve(_email)
          })
      ),
    updateProfile: (
      userId: number,
      name: string,
      email: string
    ) =>
      new Task(
        () =>
          new Promise(resolve => {
            _email = email
            resolve(undefined)
          })
      )
  },
  emailService: {
    sendEmailChangedNotification: (
      newEmail: string,
      oldEmail: string
    ) => task.of(undefined)
  }
}

const x = updateCustomerProfile5({
  userId: 1,
  name: 'foo',
  email: 'b@gmail.com'
})

const program = x.chain(() => x)

program
  .run(deps)
  .run()
  .then(x => console.log(x))
