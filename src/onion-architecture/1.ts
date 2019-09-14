/*

  Adattato da https://github.com/matteobaglini/onion-with-functional-programming

  Porting dell'originale in TypeScript

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

const sendMessage = (
  smtpHost: string,
  smtpPort: number,
  from: string,
  subject: string,
  body: string,
  recipient: string
): void => {
  console.log(
    smtpHost,
    smtpPort,
    from,
    subject,
    body,
    recipient
  )
}

const sendGreetings = (
  fileName: string,
  today: Date,
  smtpHost: string,
  smtpPort: number
): void => {
  const input = fs.readFileSync(fileName, {
    encoding: 'utf8'
  })
  const lines = input.split('\n').slice(1) // skip header
  for (let i = 0; i < lines.length; i++) {
    const employeeData = lines[i].split(', ')
    const employee = new Employee(
      employeeData[0],
      employeeData[1],
      new Date(employeeData[2]),
      employeeData[3]
    )
    if (employee.isBirthday(today)) {
      const recipient = employee.email
      const body = `Happy Birthday, dear ${employee.firstName}!`
      const subject = 'Happy Birthday!'
      sendMessage(
        smtpHost,
        smtpPort,
        'sender@here.com',
        subject,
        body,
        recipient
      )
    }
  }
}

sendGreetings(
  'src/onion-architecture/employee_data.txt',
  new Date(2008, 9, 8),
  'localhost',
  80
)
