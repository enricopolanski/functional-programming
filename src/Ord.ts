import { Setoid } from './Setoid'

type Ordering = 'LT' | 'EQ' | 'GT'

interface Ord<A> extends Setoid<A> {
  compare: (x: A) => (y: A) => Ordering
}
