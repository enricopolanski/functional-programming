declare var process: any

export class IO<A> {
  static of<B>(b: B): IO<B> {
    return new IO(() => b)
  }
  constructor(private value: () => A) {}
  run(): A {
    return this.value()
  }
  map<B>(f: (a: A) => B): IO<B> {
    return new IO(() => f(this.run()))
  }
  static flatten<B>(mmb: IO<IO<B>>): IO<B> {
    return mmb.run()
  }
  chain<B>(f: (a: A) => IO<B>): IO<B> {
    return f(this.run())
  }
}

export function getLine(): IO<string> {
  return new IO(() => process.argv[2] || '')
}

export function putStrLn(s: string): IO<void> {
  return new IO(() => console.log(s))
}

// program :: IO<void>
const program = getLine().chain(putStrLn)

// program.run()
