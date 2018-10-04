/*

  Problema:

  Dato
  - dato l'id di un utente (il cui record contiene il valore del suo conto corrente in EUR)
  - e il codice di una valuta
  Calcolare
  - il valore del suo conto corrente in quella valuta.

  I servizi che restituiscono il record dell'utente e il cambio relativo
  alla valuta sono asincroni

*/

/*

  Prima di tutto iniziamo con il modello

*/

interface User {
  id: string
  name: string
  amount: number // EUR
}

type Currency = 'USD' | 'CHF'

import { Task } from 'fp-ts/lib/Task'

interface API {
  fetchUser: (id: string) => Task<User>
  fetchRate: (currency: Currency) => Task<number>
}

/*

  Poi una istanza di API che simula le chiamate
  per poter testare il programma

*/

const API: API = {
  fetchUser: (id: string): Task<User> =>
    new Task(() =>
      Promise.resolve({
        id,
        name: 'Foo',
        amount: 100
      })
    ),
  fetchRate: (_: Currency): Task<number> =>
    new Task(() => Promise.resolve(0.12))
}

/*

  Se potessi ricavare il valore del conto corrente e il cambio
  in modo sincrono, il calcolo sarebbe facile

*/

const getAmount = (amount: number) => (
  rate: number
): number => amount * rate

/*

  Quello che vorrei è definire la seguente funzione

  const fetchAmount = (
    userId: string,
    currency: Currency
  ): Task<number> => ???

/*

  Scriviamo la versione di liftA2 specializzata per Task

*/

export const liftA2 = <A, B, C>(
  f: (a: A) => (b: B) => C
): ((
  fa: Task<A>
) => (fb: Task<B>) => Task<C>) => fa => fb =>
  fb.ap(fa.map(f))

/*

  L'API finale

*/

const getAmountAsync = (api: API) => (
  userId: string,
  currency: Currency
): Task<number> => {
  const amount = api
    .fetchUser(userId)
    // Task ha una istanza di funtore
    .map(user => user.amount)
  const rate = api.fetchRate(currency)
  const liftedgetAmountSync = liftA2(getAmount)
  return liftedgetAmountSync(amount)(rate)
}

// fetchAmount: (userId: string, currency: Currency) => Task<number>
const fetchAmount = getAmountAsync(API)

const result: Task<number> = fetchAmount('42', 'USD')

// run del programma
result.run().then(x => console.log(x))
// 12
