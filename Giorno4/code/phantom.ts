import { Maybe, some, none } from './Maybe'

type Validated = 'Validated'
type Unvalidated = 'Unvalidated'
type Status = Validated | Unvalidated

class Data<M extends Status> {
  m: M
  value: string
  constructor(value: string) {
    this.value = value
  }
}

export function make(input: string): Data<Unvalidated> {
  return new Data<Unvalidated>(input)
}

declare function isAlpha(s: string): boolean

export function validate(data: Data<Unvalidated>): Maybe<Data<Validated>> {
  return new Maybe(isAlpha(data.value) ? new Data<Validated>(data.value) : null)
}

// can only be fed the result of a call to validate!
export function use(data: Data<Validated>): void {
  console.log('using ' + data.value)
}
