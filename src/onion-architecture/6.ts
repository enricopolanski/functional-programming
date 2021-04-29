/*

  E se volessimo far girare il programma in un qualsiasi contesto monadico?

*/

import * as fs from 'fs'
import * as T from 'fp-ts/Task'
import * as RA from 'fp-ts/ReadonlyArray'
import { URIS, Kind } from 'fp-ts/HKT'
import { Monad1 } from 'fp-ts/Monad'
import { Applicative1 } from 'fp-ts/Applicative'
import { constVoid, pipe } from 'fp-ts/function'

class Employee {
  constructor(
    readonly lastName: string,
    readonly firstName: string,
    readonly dateOfBirth: Date,
    readonly email: string
  ) {}
  isBirthday(today: Date): boolean {
    return (
      this.dateOfBirth.getMonth() === today.getMonth() &&
      this.dateOfBirth.getDate() === today.getDate()
    )
  }
}

class Email {
  constructor(
    readonly from: string,
    readonly subject: string,
    readonly body: string,
    readonly recipient: string
  ) {}
}

//
// type classes
//

interface MonadEmail1<M extends URIS> {
  readonly sendMessage: (email: Email) => Kind<M, void>
}

interface MonadFileSystem1<M extends URIS> {
  readonly read: (fileName: string) => Kind<M, string>
}

interface MonadApp<M extends URIS>
  extends MonadEmail1<M>,
    MonadFileSystem1<M>,
    Monad1<M>,
    Applicative1<M> {}

// pure
const toEmail = (employee: Employee): Email => {
  const recipient = employee.email
  const body = `Happy Birthday, dear ${employee.firstName}!`
  const subject = 'Happy Birthday!'
  return new Email('sender@here.com', subject, body, recipient)
}

// pure
const getGreetings = (
  today: Date,
  employees: ReadonlyArray<Employee>
): ReadonlyArray<Email> => {
  return employees.filter((e) => e.isBirthday(today)).map(toEmail)
}

// pure
const parse = (input: string): ReadonlyArray<Employee> => {
  const lines = input.split('\n').slice(1) // skip header
  return lines.map((line) => {
    const employeeData = line.split(', ')
    return new Employee(
      employeeData[0],
      employeeData[1],
      new Date(employeeData[2]),
      employeeData[3]
    )
  })
}

// pure
const sendGreetings = <M extends URIS>(M: MonadApp<M>) => (
  fileName: string,
  today: Date
): Kind<M, void> => {
  return M.map(
    M.chain(
      M.map(M.read(fileName), (input) => getGreetings(today, parse(input))),
      RA.traverse(M)(M.sendMessage)
    ),
    constVoid
  )
}

//
// instances
//

const getMonadApp = (smtpHost: string, smtpPort: number): MonadApp<T.URI> => {
  return {
    ...T.Monad,
    ...T.ApplicativePar,
    sendMessage: (email) => () =>
      new Promise((resolve) => {
        console.log('sending email...')
        setTimeout(() => resolve(console.log(smtpHost, smtpPort, email)), 1000)
      }),
    read: (fileName) => () =>
      new Promise((resolve) => {
        console.log('reading file...')
        setTimeout(
          () =>
            fs.readFile(fileName, { encoding: 'utf8' }, (_, data) =>
              resolve(data)
            ),
          1000
        )
      })
  }
}

const program = sendGreetings(getMonadApp('localhost', 80))
program('src/onion-architecture/employee_data.txt', new Date(2008, 9, 8))()
/*
reading file...
sending email...
localhost 80 Email {
  from: 'sender@here.com',
  subject: 'Happy Birthday!',
  body: 'Happy Birthday, dear John!',
  recipient: 'john.doe@foobar.com' }
*/
