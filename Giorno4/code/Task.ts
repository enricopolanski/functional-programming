export class Task<A> {
  static of<B>(b: B): Task<B> {
    return new Task(() => Promise.resolve(b))
  }
  constructor(public value: () => Promise<A>) {}
  run(): Promise<A> {
    return this.value()
  }
  map<B>(f: (a: A) => B): Task<B> {
    return new Task(() => this.run().then(f))
  }
  chain<B>(f: (a: A) => Task<B>): Task<B> {
    return new Task(() => this.value().then(a => f(a).run()))
  }
  ap<B>(fab: Task<(a: A) => B>): Task<B> {
    // return new Task(() => {
    //   const p1 = fab.run()
    //   const p2 = this.run()
    //   return Promise.all([p1, p2]).then(([f, a]) => f(a))
    // })
    return fab.chain(f => this.map(f))
  }
}

export function liftA2<A, B, C>(f: (a: A, b: B) => C): (fa: Task<A>, fb: Task<B>) => Task<C> {
  const curried = (a: A) => (b: B): C => f(a, b)
  return (fa, fb) => fb.ap(fa.map(curried))
}

const sum = (a: number, b: number): number => a + b

const sumA2 = liftA2(sum)

const delay = <A>(n: number, a: A): Task<A> => new Task(() => new Promise(resolve => {
  setTimeout(() => resolve(a), n)
}))

const fa = delay(1000, 1)
const fb = delay(1000, 2)

sumA2(fa, fb).run().then(x => console.log(x))
