import { make, validate, use } from './phantom'

const data = make('hello')
use(data) // called without validating the input
          // error: Type '"Unvalidated"' is not assignable to type '"Validated"'

validate(data).map(data => use(data))

validate(data).map(data => validate(data)) // error: Type '"Validated"' is not assignable to type '"Unvalidated"'
