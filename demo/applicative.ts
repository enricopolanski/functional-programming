/*

  Problema: dato l'id di un utente, il cui record contiene il valore del suo conto corrente in EUR,
  e il codice di una valuta, calcolare il valore del suo conto corrente in quella valuta.
  I servizi che restituiscono il record dell'utente e il cambio relativo alla valuta sono asincroni

*/

interface User {
  id: string
  name: string
  amount: number // EUR
}

type Currency = 'USD' | 'CHF'

import { Task } from '../src/Task'

const API = {
  fetchUser: (id: string): Task<User> =>
    new Task(() =>
      Promise.resolve({
        id,
        name: 'Foo',
        amount: 100
      })
    ),
  fetchRate: (currency: Currency): Task<number> =>
    new Task(() => Promise.resolve(0.12))
}

/*

  Se potessi ricavare il valore del conto corrente e il cambio
  in modo sincrono, il calcolo sarebbe facile

*/

const getAmountSync = (amount: number) => (rate: number) =>
  amount * rate

/*

  Quello che vorrei è definire la seguente funzione

  const getAmountAsync = (
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

const getAmountAsync = (
  userId: string,
  currency: Currency
): Task<number> => {
  const amount = API.fetchUser(userId).map(
    user => user.amount
  )
  const rate = API.fetchRate(currency)
  return liftA2(getAmountSync)(amount)(rate)
}

getAmountAsync('42', 'USD')
  .run()
  .then(x => console.log(x))
// 12
