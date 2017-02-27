export class NonEmptyArray<A> {
  head: A;
  tail: Array<A>;
  constructor(head: A, tail: Array<A>) {
    this.head = head
    this.tail = tail
  }
}

function head<A>(as: NonEmptyArray<A>): A {
  return as.head
}
