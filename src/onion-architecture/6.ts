/*

  E se volessimo far girare il programma in un qualsiasi contesto monadico?

*/

// import * as fs from 'fs'
// import { URI, Task, task } from './node_modules/fp-ts/lib/Task'
// import { array } from './node_modules/fp-ts/lib/Array'
// import { sequence_ } from './node_modules/fp-ts/lib/Foldable'
// import { URIS, Type } from 'fp-ts/lib/HKT'
// import { Monad1 } from './node_modules/fp-ts/lib/Monad'

// class Employee {
//   constructor(
//     readonly lastName: string,
//     readonly firstName: string,
//     readonly dateOfBirth: Date,
//     readonly email: string
//   ) {}
//   isBirthday(today: Date): boolean {
//     return (
//       this.dateOfBirth.getMonth() === today.getMonth() &&
//       this.dateOfBirth.getDate() === today.getDate()
//     )
//   }
// }

// class Email {
//   constructor(
//     readonly from: string,
//     readonly subject: string,
//     readonly body: string,
//     readonly recipient: string
//   ) {}
// }

// //
// // type classes
// //

// interface MonadEmail<M extends URIS> {
//   sendMessage: (email: Email) => Type<M, void>
// }

// interface MonadFileSystem<M extends URIS> {
//   read: (fileName: string) => Type<M, string>
// }

// interface MonadApp<M extends URIS>
//   extends MonadEmail<M>,
//     MonadFileSystem<M>,
//     Monad1<M> {}

// // pure
// const toEmail = (employee: Employee): Email => {
//   const recipient = employee.email
//   const body = `Happy Birthday, dear ${employee.firstName}!`
//   const subject = 'Happy Birthday!'
//   return new Email(
//     'sender@here.com',
//     subject,
//     body,
//     recipient
//   )
// }

// // pure
// const getGreetings = (
//   today: Date,
//   employees: Array<Employee>
// ): Array<Email> => {
//   return employees
//     .filter(e => e.isBirthday(today))
//     .map(toEmail)
// }

// // pure
// const parse = (input: string): Array<Employee> => {
//   const lines = input.split('\n').slice(1) // skip header
//   return lines.map(line => {
//     const employeeData = line.split(', ')
//     return new Employee(
//       employeeData[0],
//       employeeData[1],
//       new Date(employeeData[2]),
//       employeeData[3]
//     )
//   })
// }

// // pure
// const sendGreetings = <M extends URIS>(M: MonadApp<M>) => (
//   fileName: string,
//   today: Date
// ): Type<M, void> => {
//   return M.chain(
//     M.map(M.read(fileName), input =>
//       getGreetings(today, parse(input))
//     ),
//     emails => sequence_(M, array)(emails.map(M.sendMessage))
//   )
// }

// //
// // instances
// //

// const getMonadApp = (
//   smtpHost: string,
//   smtpPort: number
// ): MonadApp<URI> => {
//   return {
//     ...task,
//     sendMessage: email =>
//       new Task(
//         () =>
//           new Promise(resolve => {
//             console.log('sending email...')
//             setTimeout(
//               () =>
//                 resolve(
//                   console.log(smtpHost, smtpPort, email)
//                 ),
//               1000
//             )
//           })
//       ),
//     read: fileName =>
//       new Task(
//         () =>
//           new Promise(resolve => {
//             console.log('reading file...')
//             setTimeout(
//               () =>
//                 fs.readFile(
//                   fileName,
//                   { encoding: 'utf8' },
//                   (_, data) => resolve(data)
//                 ),
//               1000
//             )
//           })
//       )
//   }
// }

// const program = sendGreetings(getMonadApp('localhost', 80))
// program(
//   'src/refactoring/employee_data.txt',
//   new Date(2008, 9, 8)
// ).run()
// /*
// reading file...
// sending email...
// localhost 80 Email {
//   from: 'sender@here.com',
//   subject: 'Happy Birthday!',
//   body: 'Happy Birthday, dear John!',
//   recipient: 'john.doe@foobar.com' }
// */
