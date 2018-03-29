import { State, of, get, put } from '../src/State'
import { Option, some, none } from '../src/Option'

const newName = new State<number, string>(s => [
  'x' + s,
  s + 1
])

const xs: Array<Option<string>> = [
  some('foo'),
  none,
  some('bar')
]

const ys = xs.map(o => o.fold(() => newName, of))
