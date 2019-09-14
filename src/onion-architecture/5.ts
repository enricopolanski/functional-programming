/*

  E se volessimo far girare il programma in un contesto asincrono?

*/

import * as fs from 'fs'
import { Task, task, map, chain } from 'fp-ts/lib/Task'
import { pipe } from 'fp-ts/lib/pipeable'
import { traverse_ } from 'fp-ts/lib/Foldable'
import * as A from 'fp-ts/lib/Array'

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

interface MonadEmail {
  sendMessage: (email: Email) => Task<void>
}

interface MonadFileSystem {
  read: (fileName: string) => Task<string>
}

interface MonadApp extends MonadEmail, MonadFileSystem {}

// pure
const toEmail = (employee: Employee): Email => {
  const recipient = employee.email
  const body = `Happy Birthday, dear ${employee.firstName}!`
  const subject = 'Happy Birthday!'
  return new Email(
    'sender@here.com',
    subject,
    body,
    recipient
  )
}

// pure
const getGreetings = (
  today: Date,
  employees: Array<Employee>
): Array<Email> => {
  return employees
    .filter(e => e.isBirthday(today))
    .map(toEmail)
}

// pure
const parse = (input: string): Array<Employee> => {
  const lines = input.split('\n').slice(1) // skip header
  return lines.map(line => {
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
const sendGreetings = (M: MonadApp) => (
  fileName: string,
  today: Date
): Task<void> => {
  return pipe(
    M.read(fileName),
    map(input => getGreetings(today, parse(input))),
    chain(emails =>
      traverse_(task, A.array)(emails, M.sendMessage)
    )
  )
}

//
// instances
//

const getMonadApp = (
  smtpHost: string,
  smtpPort: number
): MonadApp => {
  return {
    sendMessage: email => () =>
      new Promise(resolve => {
        console.log('sending email...')
        setTimeout(
          () =>
            resolve(console.log(smtpHost, smtpPort, email)),
          1000
        )
      }),
    read: fileName => () =>
      new Promise(resolve => {
        console.log('reading file...')
        setTimeout(
          () =>
            fs.readFile(
              fileName,
              { encoding: 'utf8' },
              (_, data) => resolve(data)
            ),
          1000
        )
      })
  }
}

const program = sendGreetings(getMonadApp('localhost', 80))
program(
  'src/onion-architecture/employee_data.txt',
  new Date(2008, 9, 8)
)()
/*
reading file...
sending email...
localhost 80 Email {
  from: 'sender@here.com',
  subject: 'Happy Birthday!',
  body: 'Happy Birthday, dear John!',
  recipient: 'john.doe@foobar.com' }
*/
