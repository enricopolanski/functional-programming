import { function as F } from 'fp-ts';

const double = (n: number): number => n * 2;

const increment = (n: number): number => n + 1;

const decrement = (n: number): number => n - 1;

/*
    pipe operator:

    def program1 (n) do
      n
        |> increment
        |> double
        |> decrement
    end

    method chaining:

    n
      .andThen(increment)
      .andThen(double)
      .andThen(decrement)
*/
const program1 = (n: number): number => F.pipe(n, increment, double, decrement);

console.log(program1(10)); // 21

// const program2: (n: number) => number
const program2 = F.flow(increment, double, decrement);

console.log(program2(10)); // 21
