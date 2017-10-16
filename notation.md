# Variable Declarations

```ts
// JavaScript
const a = 1
const b = 'foo'
const c = true

// TypeScript
const a: number = 1
const b: string = 'foo'
const c: boolean = true
```

# Arrow functions

```ts
// JavaScript
const double = n => 2 * n
const sum = a => b => a + b

// TypeScript
const double = (n: number): number => 2 * n
const sum = (a: number) => (b: number): number => a + b
```

Le funzioni possono essere parametriche

```ts
// qui il type parameter `A` cattura il fatto che il tipo dell'output
// deve essere uguale a quello dell'input
const identity = <A>(a: A): A => a

// qui il type parameter `A` cattura il fatto che il tipo degli elementi
// dell'array `xs` e quello del valore `x` devono essere uguali
const push = <A>(xs: Array<A>, x: A): Array<A> => {
  const ys = xs.slice()
  ys.push(x)
  return ys
}
```

# Arrays and tuples

```ts
// JavaScript
const a = [1, 2, 3] // un array di numeri con lunghezza indefinita
const b = [1, 'foo']  // un array con esattamente due elementi, il primo è un numero il secondo una stringa

// TypeScript
const a: Array<number> = [1, 2, 3]
const b: [number, string] = [1, 'foo']
```

# Interfaces

```ts
// modella un oggetto con due proprietà `x`, `y` di tipo numerico
interface Point {
  x: number
  y: number
}

// le interfacce possono essere estese
interface Point3D extends Point {
  z: number
}

// le interfacce possono essere parametriche
// Pair modella un oggetto con due proprietà `x`, `y`
// il cui tipo non è ancora precisato ma che deve essere uguale
interface Pair<A> {
  x: A
  y: A
}

// questa deifnizione di Point è dunque equivalente
// a quella iniziale
interface Point extends Pair<number> {}
```

# Classes

```ts
// JavaScript
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
}

// TypeScript
class Person {
  name: string
  age: number
  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
}

// le classi possono essere parametriche
class Pair<A> {
  x: A
  y: A
  constructor(x: A, y: A) {
    this.x = x
    this.y = y
  }
}

new Pair(1, 2) // ok
new Pair(1, 'foo') // error
```

# Type aliases

Per questioni di comodità possiamo dare degli alias ai tipi

```ts
// Querystring modella i parametri di una querystring
// come un array di coppie nome / valore
type Querystring = Array<[string, string]>

// la querystring `a=foo&b=bar`
const querystring: Querystring = [['a', 'foo'], ['b', 'bar']]

// i type alias possono essere parametrici
// Pair modella un array con esattamente due elementi
// dello stesso tipo
type Pair<A> = [A, A]
```

# Unions and discriminated unions

```ts
// è possibile definire delle unioni
type StringOrNumber = string | number

// e delle unioni con discriminante, ovvero una unione
// di insiemi disgiunti in cui un campo fa da discriminante
type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' }
```
