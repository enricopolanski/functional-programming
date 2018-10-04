Adattato da https://github.com/matteobaglini/onion-with-functional-programming

# Dati

```
last_name, first_name, date_of_birth, email
Doe, John, 1982/10/08, john.doe@foobar.com
Ann, Mary, 1975/09/11, mary.ann@foobar.com
```

# Template

```
Subject: Happy birthday!
Happy birthday, dear {employee's first name}!
```

# Originale in Scala

```scala
def sendGreetings(fileName: String,
                  today: XDate,
                  smtpHost: String,
                  smtpPort: Int): Unit = {
  val in = new BufferedReader(new FileReader(fileName))
  var str = ""
  str = in.readLine // skip header
  while ({ str = in.readLine; str != null }) {
    val employeeData = str.split(", ")
    val employee = Employee(employeeData(1),
                            employeeData(0),
                            employeeData(2),
                            employeeData(3))

    if (employee.isBirthday(today)) {
      val recipient = employee.email
      val body = s"Happy Birthday, dear ${employee.firstName}!"
      val subject = "Happy Birthday!"

      sendMessage(smtpHost, smtpPort,
                  "sender@here.com",
                  subject, body,
                  recipient)
    }
  }
}
```

# Traduzione in TypeScript

```ts
import * as fs from 'fs'

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

const sendMessage = (
  smtpHost: string,
  smtpPort: number,
  from: string,
  subject: string,
  body: string,
  recipient: string
): void => {
  console.log(smtpHost, smtpPort, from, subject, body, recipient)
}

const sendGreetings = (fileName: string, today: Date, smtpHost: string, smtpPort: number): void => {
  const input = fs.readFileSync(fileName, { encoding: 'utf8' })
  const lines = input.split('\n').slice(1) // skip header
  for (let i = 0; i < lines.length; i++) {
    const employeeData = lines[i].split(', ')
    const employee = new Employee(employeeData[0], employeeData[1], new Date(employeeData[2]), employeeData[3])
    if (employee.isBirthday(today)) {
      const recipient = employee.email
      const body = `Happy Birthday, dear ${employee.firstName}!`
      const subject = 'Happy Birthday!'
      sendMessage(smtpHost, smtpPort, 'sender@here.com', subject, body, recipient)
    }
  }
}

sendGreetings('src/refactoring/employee_data.txt', new Date(2008, 9, 8), 'localhost', 80)
```

# Primo refactoring: estrarre le funzioni

```ts
class Email {
  constructor(readonly from: string, readonly subject: string, readonly body: string, readonly recipient: string) {}
}

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

// impure
const sendMessage = (smtpHost: string, smtpPort: number, email: Email): void => {
  console.log(smtpHost, smtpPort, email)
}

// impure
const read = (fileName: string): string => {
  return fs.readFileSync(fileName, { encoding: 'utf8' })
}

// impure
const sendGreetings = (fileName: string, today: Date, smtpHost: string, smtpPort: number): void => {
  const input = read(fileName)
  const employees = parse(input)
  const emails = getGreetings(today, employees)
  emails.forEach(email => sendMessage(smtpHost, smtpPort, email))
}
```

# Secondo refactoring: inversion of control

Le funzioni impure le trasformo in dipendenze

```ts
//
// ports
//

interface EmailService {
  sendMessage: (email: Email) => void
}

interface FileSystemService {
  read: (fileName: string) => string
}

interface AppService extends EmailService, FileSystemService {}

// impure
const sendGreetings = (services: AppService) => (fileName: string, today: Date): void => {
  const input = services.read(fileName)
  const employees = parse(input)
  const emails = getGreetings(today, employees)
  emails.forEach(email => services.sendMessage(email))
}

//
// adapters
//

const getAppService = (smtpHost: string, smtpPort: number): AppService => {
  return {
    sendMessage: (email: Email): void => {
      console.log(smtpHost, smtpPort, email)
    },
    read: (fileName: string): string => {
      return fs.readFileSync(fileName, { encoding: 'utf8' })
    }
  }
}

const program = sendGreetings(getAppService('localhost', 80))
program('src/refactoring/employee_data.txt', new Date(2008, 9, 8))
```

Il codice ora è "funzionale"?

# Refactoring: rendere le funzioni pure con `IO`

Modifichiamo la firma delle funzioni impure usando `IO` e cambiamo il nome di alcune astrazioni per renderli più idiomatici

```ts
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

...

const sendGreetings = (M: MonadApp) => (fileName: string, today: Date): IO<void> => {
  ...
}

...

//
// instances
//

const getMonadApp = (smtpHost: string, smtpPort: number): MonadApp => {
  ...
}
```

Naturalmente `sendGreetings` e `getMonadApp` non compilano più.

Sistemiamo gli errori incominciando da `sendGreetings`

```ts
const sendGreetings = (M: MonadApp) => (fileName: string, today: Date): IO<void> => {
  const input: IO<string> = M.read(fileName)
  const employees: IO<Array<Employee>> = input.map(parse)
  const emails: IO<Array<Email>> = employees.map(employees => getGreetings(today, employees))
  const result: IO<void> = emails.chain(es => {
    const ios: Array<IO<void>> = es.map(M.sendMessage)
    return ???
  })
  return result
}
```

Devo trasformare un `Array<IO<void>>` in un `IO<void>`, mi serve questo combinatore

```ts
const sequence = <A>(fas: Array<IO<A>>): IO<Array<A>> => {
  return new IO(() => {
    const result: Array<A> = []
    fas.forEach(fa => result.push(fa.run()))
    return result
  })
}
```

o meglio una sua forma specializzata

```ts
const sequence_ = (fas: Array<IO<void>>): IO<void> => {
  return sequence(fas).map(() => undefined)
}
```

Finiamo il refactoring di `sendGreetings`

```ts
const sendGreetings = (M: MonadApp) => (fileName: string, today: Date): IO<void> => {
  const input: IO<string> = M.read(fileName)
  const employees: IO<Array<Employee>> = input.map(parse)
  const emails: IO<Array<Email>> = employees.map(employees => getGreetings(today, employees))
  const result: IO<void> = emails.chain(es => {
    const ios: Array<IO<void>> = es.map(M.sendMessage)
    return sequence_(ios)
  })
  return result
}
```

o, in modo più compatto,

```ts
const sendGreetings = (M: MonadApp) => (fileName: string, today: Date): IO<void> => {
  return M.read(fileName)
    .map(input => getGreetings(today, parse(input)))
    .chain(emails => sequence_(emails.map(M.sendMessage)))
}
```

Rimane solo di rifattorizzare `getMonadApp`

```ts
const getMonadApp = (smtpHost: string, smtpPort: number): MonadApp => {
  return {
    sendMessage: email => new IO(() => console.log(smtpHost, smtpPort, email)),
    read: fileName => new IO(() => fs.readFileSync(fileName, { encoding: 'utf8' }))
  }
}
```

Ed eseguire il programma chiamando `run()`

```ts
const program = sendGreetings(getMonadApp('localhost', 80))
program('src/refactoring/employee_data.txt', new Date(2008, 9, 8)).run()
```

# E se volessimo far girare il programma in un contesto asincrono?

Vedi file `5.ts`

# E se volessimo far girare il programma in un qualsiasi contesto monadico?

Vedi file `6.ts`
