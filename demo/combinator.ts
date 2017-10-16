/*

  Problema: trasformare il seguente CSV

*/

const good = `foo;foo@google.com
bar;bar@hotmail.com`

/*

  in una lista di

*/

type ContactInfo = {
  name: string
  email: string
}

/*

  Un primo tentativo...

*/

const toContactInfos1 = (
  csv: string
): Array<ContactInfo> => {
  return csv
    .split('\n')
    .map(line => line.split(';'))
    .map(([name, email]) => ({ name, email }))
}

// console.log(toContactInfos1(good))
/*
[ { name: 'foo', email: 'foo@google.com' },
  { name: 'bar', email: 'bar@hotmail.com' } ]
*/

/*

  Cosa succede se il CSV non ha tutti campi?

*/

const bad = `foo;foo@google.com
bar;bar@hotmail.com
;baz@yahoo.com
quux;`

// console.log(toContactInfos1(bad))
/*
[ { name: 'foo', email: 'foo@google.com' },
  { name: 'bar', email: 'bar@hotmail.com' },
  { name: '', email: 'baz@yahoo.com' },
  { name: 'quux', email: '' } ]
*/

/*

  Potremmo aggiungere la possibilità di specificare delle opzioni

*/

const toContactInfos2 = (
  csv: string,
  nameRequired: boolean,
  emailRequired: boolean
): Array<ContactInfo> => {
  return csv
    .split('\n')
    .map(line => line.split(';'))
    .filter(([name, email]) => {
      if (
        (name === '' && nameRequired) ||
        (email === '' && emailRequired)
      ) {
        return false
      }
      return true
    })
    .map(([name, email]) => ({ name, email }))
}

// console.log(toContactInfos2(bad, true, true))
/*
[ { name: 'foo', email: 'foo@google.com' },
  { name: 'bar', email: 'bar@hotmail.com' } ]
*/

/*

  La soluzione sembra funzionare ma cosa ne pensate?

*/

/*

  Separiamo la logica di parsing da quella di mapping

*/

type Pair<A> = [A, A]

// const getTokens1 = (csv: string): Pair<string> =>
//   csv.split('\n').map(line => line.split(';')) // Type 'string[][]' is not assignable to type '[string, string][]'

/*

  Il type system ci aiuta a non dimenticare casi non gestiti

*/

const toPair = (xs: Array<string>): Pair<string> => [
  xs.length > 0 ? xs[0].trim() : '',
  xs.length > 1 ? xs[1].trim() : ''
]

const getTokens = (csv: string): Array<[string, string]> =>
  csv.split('\n').map(line => toPair(line.split(';')))

const toContactInfo = (
  [name, email]: Pair<string>
): ContactInfo => ({ name, email })

const toContactInfos3 = (
  csv: string,
  nameRequired: boolean,
  emailRequired: boolean
): Array<ContactInfo> =>
  getTokens(csv)
    .filter(([name, email]) => {
      if (
        (name === '' && nameRequired) ||
        (email === '' && emailRequired)
      ) {
        return false
      }
      return true
    })
    .map(toContactInfo)

/*

    Separiamo anche la logica di filtro

*/

type Predicate<A> = (a: A) => boolean

type Filter = Predicate<Pair<string>>

const getFilter = (
  nameRequired: boolean,
  emailRequired: boolean
): Filter => ([name, email]) => {
  if (
    (name === '' && nameRequired) ||
    (email === '' && emailRequired)
  ) {
    return false
  }
  return true
}

const toContactInfos4 = (
  csv: string,
  nameRequired: boolean,
  emailRequired: boolean
): Array<ContactInfo> =>
  getTokens(csv)
    .filter(getFilter(nameRequired, emailRequired))
    .map(toContactInfo)

/*

  Ma adesso è evidente che i parametri aggiuntivi non centrano con lo scopo
  della funzione toContactInfos, servono solo per creare il predicato.
  Ma allora passiamo direttamente il predicato come argomento!

*/

const toContactInfos = (
  csv: string,
  filter: Filter
): Array<ContactInfo> =>
  getTokens(csv)
    .filter(filter)
    .map(toContactInfo)

/*

  Molto meglio. Ma come costruire un filtro?
  Anche getFilter non è del tutto soddisfacente. Usiamo un combinator!

  Un "combinator" `c` è un endomorfismo di un exponential (type)
  Un endomorfismo di un tipo `A` è una funzione `f: A -> A`
  Un exponential è un tipo che rappresenta una funzione, per esempio double: number -> number

*/

type Combinator = (filter: Filter) => Filter

const base: Filter = () => true

const nameRequired: Combinator = filter => pair =>
  pair[0] === '' ? false : filter(pair)

const emailRequired: Combinator = filter => pair =>
  pair[1] === '' ? false : filter(pair)

console.log(toContactInfos(bad, base))
/*
[ { name: 'foo', email: 'foo@google.com' },
{ name: 'bar', email: 'bar@hotmail.com' },
{ name: '', email: 'baz@yahoo.com' },
{ name: 'quux', email: '' } ]
*/

console.log(toContactInfos(bad, nameRequired(base)))
/*
[ { name: 'foo', email: 'foo@google.com' },
  { name: 'bar', email: 'bar@hotmail.com' },
  { name: 'quux', email: '' } ]
*/

console.log(
  toContactInfos(bad, emailRequired(nameRequired(base)))
)
/*
[ { name: 'foo', email: 'foo@google.com' },
{ name: 'bar', email: 'bar@hotmail.com' } ]
*/
