/*

  Primo refactoring: estrarre le funzioni

*/

import * as fs from 'fs'

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

// impure
const sendMessage = (
  smtpHost: string,
  smtpPort: number,
  email: Email
): void => {
  console.log(smtpHost, smtpPort, email)
}

// impure
const read = (fileName: string): string => {
  return fs.readFileSync(fileName, { encoding: 'utf8' })
}

// impure
const sendGreetings = (
  fileName: string,
  today: Date,
  smtpHost: string,
  smtpPort: number
): void => {
  const input = read(fileName)
  const employees = parse(input)
  const emails = getGreetings(today, employees)
  emails.forEach(email =>
    sendMessage(smtpHost, smtpPort, email)
  )
}

sendGreetings(
  'src/onion-architecture/employee_data.txt',
  new Date(2008, 9, 8),
  'localhost',
  80
)
