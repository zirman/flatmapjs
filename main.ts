// Flatmapping in TypeScript
// by Robert Chrzanowski

// You will learn about
// * Functor. Map interface
// * Monad. FlatMap interface
// * Maybe (aka Option). Short-circuiting computations
// * Either (aka Sum Type, Algebraic Data Types, Tagged Unions, Coproduct).
//   - Computations with exceptions
// * LinkedList. Nondeterministic computations and list comprehensions
// * Recipe (aka StateMonad). Building up stateful computations.

"use strict"

interface IFunctor<A> {
  map<B>(f: (A) => B): IFunctor<B>
}

interface IMonad<A> {
  flatMap<B>(f: (A) => IMonad<B>): IMonad<B>
}

class Unit {
  private constructor() {
  }
  toString(): String {
    return "Unit"
  }
  static readonly instance = new Unit()
}

class Box<A> implements IFunctor<A>, IMonad<A> {
  readonly contents: A
  constructor(x: A) {
    this.contents = x
  }
  map<B>(f: (A) => B): Box<B> {
    return new Box(f(this.contents))
  }
  static flatten<A>(doubleBox: Box<Box<A>>): Box<A> {
    return doubleBox.contents
  }
  flatMap<B>(f: (A) => Box<B>): Box<B> {
    return Box.flatten(this.map(f))
  }
  equal(box: Box<A>): boolean {
    return this.contents === box.contents
  }
  toString(): string {
    return "Box(" + this.contents + ")"
  }
}

function identityFunction<A>(x: A): A {
  return x
}

const life = new Box(42)

// console.log(
//   life
//     .toString())
// functor identity axiom

// console.log(
//   life
//     .map(identityFunction)
//     .equal(new Box(42)))

function g(s: number): number {
  return s - 40
}

function f(s: number): number {
  return s * s
}

// functor composition axiom

// console.log(
//   life
//     .map(g)
//     .map(f)
//     .equal(life.map(x => f(g(x)))))

// console.log(
//   life
//     .map(x => f(g(x)))
//     .toString())

// Flatten function takes nested generic type and joins
// them into to a depth of one.

// console.log(
//   Box
//     .flatten(new Box(new Box("thingy")))
//     .equal(new Box("thingy")))

// console.log(
//   new Box("foo")
//     .flatMap(x => new Box(x + "bar"))
//     .toString())

abstract class Maybe<A> implements IFunctor<A>, IMonad<A> {
  abstract map<B>(f: (A) => B): Maybe<B>
  static flatten<A>(f: Maybe<Maybe<A>>): Maybe<A> {
    return f instanceof Just ? f.x : None.instance
  }
  flatMap<B>(f: (A) => Maybe<B>): Maybe<B> {
    return Maybe.flatten(this.map(f))
  }
}

class Just<A> extends Maybe<A> {
  readonly x: A
  constructor(x: A) {
    super()
    this.x = x
  }
  map<B>(f: (A) => B): Maybe<B> {
    return new Just(f(this.x))
  }
  toString(): string {
    return "Just(" + this.x + ")"
  }
}

class None extends Maybe<void> {
  private constructor() {
    super()
  }
  map<B>(f: (A) => B): Maybe<void> {
    return None.instance
  }
  toString(): string {
    return "None"
  }
  static readonly instance = new None()
}

// console.log(
//   new Just(1)
//     .toString())

// console.log(
//   new Just(2)
//     .map(x => x + x)
//     .toString())

// console.log(
//   None.instance
//     .map(x => x + x)
//     .toString())

// console.log(
//   Maybe
//     .flatten(new Just(new Just("something")))
//     .toString())

// console.log(
//   Maybe
//     .flatten(new Just(None.instance))
//     .toString())

// console.log(
//   Maybe
//     .flatten(None.instance)
//     .toString())

// flatMapping a data structure chains operations which are
// used to build larger computations.

// Maybe + flatMap = short-circuiting computation

function plus(a: number, b: number): Maybe<number> {
  return new Just(a + b)
}

function div(n: number, d: number): Maybe<number> {
  return d !== 0 ? new Just(n / d) : None.instance
}

// console.log(
//   new Just(42)
//     .flatMap(x => plus(x, -42))
//     .flatMap(x => div(42, x))
//     .flatMap(x => plus(x, 42))
//     .toString())

// Nesting flatMap

// console.log(
//   new Just(12)
//     .flatMap(num =>
//       isOdd(num)
//         .flatMap((unit) => new Just(num + " is odd"))
//     )
//     .toString())

function isOdd(i: number): Maybe<number> {
  return i % 2 == 1
    ? new Just(Unit.instance)
    : None.instance
}

// Maybe + flatMap = chainable error handling

class MyError {
  readonly code: number
  readonly message: string
  constructor(code: number, message: string) {
    this.code = code
    this.message = message
  }
}

function generalErrorHandler(error: MyError): Maybe<MyError> {
  if (error.code >= 200 && error.code <= 299) {
  } else if (error.code >= 300 && error.code <= 399) {
  } else if (error.code >= 400 && error.code <= 499) {
    console.log("generalErrorHandler: " + error.message)
  } else if (error.code >= 500 && error.code <= 599) {
    console.log("generalErrorHandler: Something went wrong. Please try again.")
  }
  return None.instance
}

// console.log(
//   generalErrorHandler(new MyError(500, "Crash"))
//     .toString())

// make customErrorHandler that overrides
// generalErrorHandler

function specialErrorHandler(error: MyError): Maybe<MyError> {
  return new Just(error)
    .flatMap(e =>
      e.code == 402 // Account in bad standing
        ? (console.log("specialErrorHandler: Please pay up!"), new Just(e))
        : new Just(e)
    )
}

function composedErrorHandler(error: MyError): Maybe<MyError> {
  return new Just(error)
    .flatMap(specialErrorHandler)
    .flatMap(generalErrorHandler)
}

// console.log(
//   composedErrorHandler(new MyError(402, "Payment Required"))
//     .toString())

// console.log(
//   composedErrorHandler(new MyError(500, "Crash"))
//     .toString())

abstract class Either<A, B> implements IFunctor<B>, IMonad<B> {
  abstract map<C>(f: (B) => C): Either<A, C>
  static flatten<A, B>(either: Either<A, Either<A, B>>): Either<A, B> {
    if (either instanceof Right) {
      return either.rightContents
    } else if (either instanceof Left) {
      return either
    }
    throw Error("unreachable")
  }
  flatMap<C>(f: (B) => Either<A, C>): Either<A, C> {
    return Either.flatten(this.map(f))
  }
}

class Left<A> extends Either<A, void> {
  readonly leftContents: A
  constructor(leftContents: A) {
    super()
    this.leftContents = leftContents
  }
  map<B, C>(f: (B) => C): Either<A, void> {
    return this
  }
  toString(): string {
    return "Left(" + this.leftContents + ")"
  }
}

class Right<A> extends Either<void, A> {
  readonly rightContents: A
  constructor(rightContents: A) {
    super()
    this.rightContents = rightContents
  }
  map<B>(f: (A) => B): Either<void, B> {
    return new Right(f(this.rightContents))
  }
  toString(): string {
    return "Right(" + this.rightContents + ")"
  }
}

// Either + flatMap = computation with success or error value

function sqrtErr(n: number): Either<string, number> {
  return n >= 0.0
    ? new Right(Math.sqrt(n))
    : new Left("cannot sqrt negative numbers")
}

function divErr(numerator: number,
                denominator: number): Either<string, number> {
  return denominator != 0.0
    ? new Right(numerator / denominator)
    : new Left("cannot divide by zero")
}

// console.log(
//   new Right(-42.0)
//     .flatMap(x => sqrtErr(x))
//     .flatMap(x => divErr(x, 0.0))
//     .flatMap(x => {
//       console.log("Number is: " + x)
//       return new Right(x)
//     })
//     .toString())

abstract class LinkedList<A> implements IFunctor<A>, IMonad<A> {
  abstract map<B>(f: (A) => B): LinkedList<B>
  static flatten<A>(linkedList: LinkedList<LinkedList<A>>): LinkedList<A> {
    return linkedList.foldr(
      End.instance,
      (xs, acc1) =>
        xs.foldr(acc1, (ys, acc2) => new Cell(ys, acc2)))
  }
  flatMap<B>(f: (A) => LinkedList<B>): LinkedList<B> {
    return LinkedList.flatten(this.map(f))
  }
  toString(): string {
    return "linkedListOf("
      + this.foldr(
        "",
        (x, acc) => x + (acc.length > 0 ? ", " : "") + acc
      )
      + ")"
  }
  abstract foldr<B>(acc: B, f: (A, B) => B): B
}

class Cell<A> extends LinkedList<A> {
  readonly head: A
  readonly tail: LinkedList<A>
  constructor(head: A, tail: LinkedList<A>) {
    super()
    this.head = head
    this.tail = tail
  }
  map<B>(f: (A) => B): LinkedList<B> {
    return new Cell(f(this.head), this.tail.map(f))
  }
  foldr<B>(acc: B, f: (A, B) => B): B {
    return f(this.head, this.tail.foldr(acc, f))
  }
}

class End extends LinkedList<void> {
  private constructor() {
    super()
  }
  map<B>(f: (A) => B): LinkedList<B> {
    return this
  }
  foldr<B>(acc: B, f: (A, B) => B): B {
    return acc
  }
  static readonly instance = new End()
}

// LinkedList factory

function linkedListOf<A>(...xs: A[]): LinkedList<A> {
  let acc = End.instance
  for (let i = xs.length - 1; i >= 0; i -= 1) {
    acc = new Cell(xs[i], acc)
  }
  return acc
}

// console.log(
//   linkedListOf(1, 2, 3)
//     .toString())

// console.log(
//   linkedListOf("hello", "world")
//     .toString())

// console.log(
//   linkedListOf()
//     .toString())

// console.log(
//   linkedListOf(1, 2, 3)
//     .map(x => x * x)
//     .toString())

// console.log(
//   linkedListOf()
//     .map(x => x * x)
//     .toString())

// console.log(
//   LinkedList
//     .flatten(linkedListOf(linkedListOf(1, 2), linkedListOf(3, 4)))
//     .toString())

// console.log(
//   LinkedList
//     .flatten(linkedListOf<LinkedList<void>>())
//     .toString())

// LinkedList + flatMap = nondeterministic computation

function sqrtNondet(n: number): LinkedList<number> {
  if (n >= 0) {
    const x = Math.sqrt(n)
    return linkedListOf(x, -x)
  } else {
    return linkedListOf()
  }
}

function divNondet(numerator: number,
                   denominator: number): LinkedList<number> {
  return denominator != 0.0
    ? linkedListOf(numerator / denominator)
    : linkedListOf()
}

// console.log(
//   linkedListOf(9.0)
//     .flatMap(x => sqrtNondet(x))
//     .flatMap(x => linkedListOf(x + 3.0))
//     .flatMap(x => divNondet(6.0, x))
//     .toString())

class Pair<A, B> {
  readonly first: A
  readonly second: B
  constructor(first: A, second: B) {
    this.first = first
    this.second = second
  }
  toString(): string {
    return "Pair(" + this.first + ", " + this.second + ")"
  }
}

// LinkedList + flatMap = list comprehensions

// Python List Comprehensions
// [(x, y) for x in [1,2] for y in [3,4] if x + y == 4]

// console.log(
//   linkedListOf(1, 2)
//     .flatMap(x =>
//       linkedListOf(3, 4)
//         .flatMap(y =>
//           x + y == 4
//             ? linkedListOf(new Pair(x, y))
//             : linkedListOf()
//         )
//     )
//     .toString())

class Result<S, A> {
  readonly state: S
  readonly value: A
  constructor(state: S, value: A) {
    this.state = state
    this.value = value
  }
  toString(): string {
    return "Result(newState = " + this.state + ", value = " + this.value + ")"
  }
}

// (S) => (S, A) + flatMap = Stateful computations

class Recipe<S, A> implements IFunctor<A>, IMonad<A> {
  readonly runWithInitialState: (S) => Result<S, A>
  constructor(runWithInitialState: (S) => Result<S, A>) {
    this.runWithInitialState = runWithInitialState
  }
  map<B>(f: (A) => B): Recipe<S, B> {
    return new Recipe(s => {
      const {state, value} = this.runWithInitialState(s)
      return new Result(state, f(value))
    })
  }
  static flatten<S, A>(prog: Recipe<S, Recipe<S, A>>): Recipe<S, A> {
    return new Recipe(s => {
      const {state, value} = prog.runWithInitialState(s)
      return value.runWithInitialState(state)
    })
  }
  flatMap<B>(f: (A) => Recipe<S, B>): Recipe<S, B> {
    return Recipe.flatten(this.map(f))
  }
}

function push(x: number): Recipe<LinkedList<number>, Unit> {
  return new Recipe(s =>
    new Result(new Cell(x, s), Unit.instance)
  )
}

const pop: Recipe<LinkedList<number>, number> =
  new Recipe(s => new Result(s.tail, s.head))

const unitState =
  new Recipe(s => new Result(s, Unit.instance))

type StackProgram<A> = Recipe<LinkedList<number>, A>

const prog1: StackProgram<Unit> =
  push(1)
    .flatMap((ignored) => push(2))

// console.log(
//   prog1
//     .runWithInitialState(linkedListOf())
//     .toString())

const prog2: StackProgram<Unit> =
  prog1
    .flatMap((ignored) => prog1)

// console.log(
//   prog2
//     .runWithInitialState(linkedListOf(3, 4))
//     .toString())

const prog3: StackProgram<Unit> =
  pop
    .flatMap(v => {
      console.log(v)
      return unitState
    })

// console.log(
//   prog3
//     .flatMap((ignored) => prog2)
//     .runWithInitialState(linkedListOf(1, 2, 3, 4))
//     .toString())

// console.log(
//   prog3
//     .flatMap((ignored) => prog2)
//     .runWithInitialState(linkedListOf(1, 3, 5))
//     .toString())

const prog4: StackProgram<Unit> =
  pop
    .flatMap(x => x % 2 == 0 ? push(x) : prog3)

// console.log(
//   prog4
//     .runWithInitialState(linkedListOf(2, 4, 6, 7))
//     .toString())

// What you learned
// * Functor. Map interface
// * Monad. FlatMap interface
// * Maybe (aka Option). Short-circuiting computations
// * Either (aka Sum Type, Algebraic Data Types, Tagged Unions, Coproduct).
//   - Computations with exceptions
// * LinkedList. Nondeterministic computations and list comprehensions
// * Recipe (aka StateMonad). Building up stateful computations.

// Other things you can do with flatmap not covered here
// * Parsing
// * Interpreters

// Questions?

// Robert Chrzanowski
// Twitter: @Robert_Chrzanow
