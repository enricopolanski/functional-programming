import * as fs from 'fs'
import { IO } from 'fp-ts/lib/IO'

class Employee {
  constructor(
    readonly lastName: string,
    readonly firstName: string,
    readonly dateOfBirth: Date,
    readonly email: string
  ) {}
  isBirthday(today: Date): boolean {
    return this.dateOfBirth.getMonth() === today.getMonth() && this.dateOfBirth.getDate() === today.getDate()
  }
}

class Email {
  constructor(readonly from: string, readonly subject: string, readonly body: string, readonly recipient: string) {}
}

//
// type classes
//

interface MonadEmail {
  sendMessage: (email: Email) => IO<void>
}

interface MonadFileSystem {
  read: (fileName: string) => IO<string>
}

interface MonadApp extends MonadEmail, MonadFileSystem {}

// pure
const toEmail = (employee: Employee): Email => {
  const recipient = employee.email
  const body = `Happy Birthday, dear ${employee.firstName}!`
  const subject = 'Happy Birthday!'
  return new Email('sender@here.com', subject, body, recipient)
}

// pure
const getGreetings = (today: Date, employees: Array<Employee>): Array<Email> => {
  return employees.filter(e => e.isBirthday(today)).map(toEmail)
}

// pure
const parse = (input: string): Array<Employee> => {
  const lines = input.split('\n').slice(1) // skip header
  return lines.map(line => {
    const employeeData = line.split(', ')
    return new Employee(employeeData[0], employeeData[1], new Date(employeeData[2]), employeeData[3])
  })
}

const sequence = <A>(fas: Array<IO<A>>): IO<Array<A>> => {
  return new IO(() => {
    const result: Array<A> = []
    fas.forEach(fa => result.push(fa.run()))
    return result
  })
}

const sequence_ = (fas: Array<IO<void>>): IO<void> => {
  return sequence(fas).map(() => undefined)
}

// pure
const sendGreetings = (M: MonadApp) => (fileName: string, today: Date): IO<void> => {
  return M.read(fileName)
    .map(input => getGreetings(today, parse(input)))
    .chain(emails => sequence_(emails.map(M.sendMessage)))
}

//
// instances
//

const getMonadApp = (smtpHost: string, smtpPort: number): MonadApp => {
  return {
    sendMessage: email => new IO(() => console.log(smtpHost, smtpPort, email)),
    read: fileName => new IO(() => fs.readFileSync(fileName, { encoding: 'utf8' }))
  }
}

const program = sendGreetings(getMonadApp('localhost', 80))
program('src/refactoring/employee_data.txt', new Date(2008, 9, 8)).run()
/*
localhost 80 Email {
  from: 'sender@here.com',
  subject: 'Happy Birthday!',
  body: 'Happy Birthday, dear John!',
  recipient: 'john.doe@foobar.com' }
*/
