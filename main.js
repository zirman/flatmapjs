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
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Unit = /** @class */ (function () {
    function Unit() {
    }
    Unit.prototype.toString = function () {
        return "Unit";
    };
    Unit.instance = new Unit();
    return Unit;
}());
var Box = /** @class */ (function () {
    function Box(x) {
        this.contents = x;
    }
    Box.prototype.map = function (f) {
        return new Box(f(this.contents));
    };
    Box.flatten = function (doubleBox) {
        return doubleBox.contents;
    };
    Box.prototype.flatMap = function (f) {
        return Box.flatten(this.map(f));
    };
    Box.prototype.equal = function (box) {
        return this.contents === box.contents;
    };
    Box.prototype.toString = function () {
        return "Box(" + this.contents + ")";
    };
    return Box;
}());
function identityFunction(x) {
    return x;
}
var life = new Box(42);
// console.log(
//   life
//     .toString())
// functor identity axiom
// console.log(
//   life
//     .map(identityFunction)
//     .equal(new Box(42)))
function g(s) {
    return s - 40;
}
function f(s) {
    return s * s;
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
var Maybe = /** @class */ (function () {
    function Maybe() {
    }
    Maybe.flatten = function (f) {
        return f instanceof Just ? f.x : None.instance;
    };
    Maybe.prototype.flatMap = function (f) {
        return Maybe.flatten(this.map(f));
    };
    return Maybe;
}());
var Just = /** @class */ (function (_super) {
    __extends(Just, _super);
    function Just(x) {
        var _this = _super.call(this) || this;
        _this.x = x;
        return _this;
    }
    Just.prototype.map = function (f) {
        return new Just(f(this.x));
    };
    Just.prototype.toString = function () {
        return "Just(" + this.x + ")";
    };
    return Just;
}(Maybe));
var None = /** @class */ (function (_super) {
    __extends(None, _super);
    function None() {
        return _super.call(this) || this;
    }
    None.prototype.map = function (f) {
        return None.instance;
    };
    None.prototype.toString = function () {
        return "None";
    };
    None.instance = new None();
    return None;
}(Maybe));
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
function plus(a, b) {
    return new Just(a + b);
}
function div(n, d) {
    return d !== 0 ? new Just(n / d) : None.instance;
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
function isOdd(i) {
    return i % 2 == 1
        ? new Just(Unit.instance)
        : None.instance;
}
// Maybe + flatMap = chainable error handling
var MyError = /** @class */ (function () {
    function MyError(code, message) {
        this.code = code;
        this.message = message;
    }
    return MyError;
}());
function generalErrorHandler(error) {
    if (error.code >= 200 && error.code <= 299) {
    }
    else if (error.code >= 300 && error.code <= 399) {
    }
    else if (error.code >= 400 && error.code <= 499) {
        console.log("generalErrorHandler: " + error.message);
    }
    else if (error.code >= 500 && error.code <= 599) {
        console.log("generalErrorHandler: Something went wrong. Please try again.");
    }
    return None.instance;
}
// console.log(
//   generalErrorHandler(new MyError(500, "Crash"))
//     .toString())
// make customErrorHandler that overrides
// generalErrorHandler
function specialErrorHandler(error) {
    return new Just(error)
        .flatMap(function (e) {
        return e.code == 402 // Account in bad standing
            ? (console.log("specialErrorHandler: Please pay up!"), new Just(e))
            : new Just(e);
    });
}
function composedErrorHandler(error) {
    return new Just(error)
        .flatMap(specialErrorHandler)
        .flatMap(generalErrorHandler);
}
// console.log(
//   composedErrorHandler(new MyError(402, "Payment Required"))
//     .toString())
// console.log(
//   composedErrorHandler(new MyError(500, "Crash"))
//     .toString())
var Either = /** @class */ (function () {
    function Either() {
    }
    Either.flatten = function (either) {
        if (either instanceof Right) {
            return either.rightContents;
        }
        else if (either instanceof Left) {
            return either;
        }
        throw Error("unreachable");
    };
    Either.prototype.flatMap = function (f) {
        return Either.flatten(this.map(f));
    };
    return Either;
}());
var Left = /** @class */ (function (_super) {
    __extends(Left, _super);
    function Left(leftContents) {
        var _this = _super.call(this) || this;
        _this.leftContents = leftContents;
        return _this;
    }
    Left.prototype.map = function (f) {
        return this;
    };
    Left.prototype.toString = function () {
        return "Left(" + this.leftContents + ")";
    };
    return Left;
}(Either));
var Right = /** @class */ (function (_super) {
    __extends(Right, _super);
    function Right(rightContents) {
        var _this = _super.call(this) || this;
        _this.rightContents = rightContents;
        return _this;
    }
    Right.prototype.map = function (f) {
        return new Right(f(this.rightContents));
    };
    Right.prototype.toString = function () {
        return "Right(" + this.rightContents + ")";
    };
    return Right;
}(Either));
// Either + flatMap = computation with success or error value
function sqrtErr(n) {
    return n >= 0.0
        ? new Right(Math.sqrt(n))
        : new Left("cannot sqrt negative numbers");
}
function divErr(numerator, denominator) {
    return denominator != 0.0
        ? new Right(numerator / denominator)
        : new Left("cannot divide by zero");
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
var LinkedList = /** @class */ (function () {
    function LinkedList() {
    }
    LinkedList.flatten = function (linkedList) {
        return linkedList.foldr(End.instance, function (xs, acc1) {
            return xs.foldr(acc1, function (ys, acc2) { return new Cell(ys, acc2); });
        });
    };
    LinkedList.prototype.flatMap = function (f) {
        return LinkedList.flatten(this.map(f));
    };
    LinkedList.prototype.toString = function () {
        return "linkedListOf("
            + this.foldr("", function (x, acc) { return x + (acc.length > 0 ? ", " : "") + acc; })
            + ")";
    };
    return LinkedList;
}());
var Cell = /** @class */ (function (_super) {
    __extends(Cell, _super);
    function Cell(head, tail) {
        var _this = _super.call(this) || this;
        _this.head = head;
        _this.tail = tail;
        return _this;
    }
    Cell.prototype.map = function (f) {
        return new Cell(f(this.head), this.tail.map(f));
    };
    Cell.prototype.foldr = function (acc, f) {
        return f(this.head, this.tail.foldr(acc, f));
    };
    return Cell;
}(LinkedList));
var End = /** @class */ (function (_super) {
    __extends(End, _super);
    function End() {
        return _super.call(this) || this;
    }
    End.prototype.map = function (f) {
        return this;
    };
    End.prototype.foldr = function (acc, f) {
        return acc;
    };
    End.instance = new End();
    return End;
}(LinkedList));
// LinkedList factory
function linkedListOf() {
    var xs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        xs[_i] = arguments[_i];
    }
    var acc = End.instance;
    for (var i = xs.length - 1; i >= 0; i -= 1) {
        acc = new Cell(xs[i], acc);
    }
    return acc;
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
function sqrtNondet(n) {
    if (n >= 0) {
        var x = Math.sqrt(n);
        return linkedListOf(x, -x);
    }
    else {
        return linkedListOf();
    }
}
function divNondet(numerator, denominator) {
    return denominator != 0.0
        ? linkedListOf(numerator / denominator)
        : linkedListOf();
}
// console.log(
//   linkedListOf(9.0)
//     .flatMap(x => sqrtNondet(x))
//     .flatMap(x => linkedListOf(x + 3.0))
//     .flatMap(x => divNondet(6.0, x))
//     .toString())
var Pair = /** @class */ (function () {
    function Pair(first, second) {
        this.first = first;
        this.second = second;
    }
    Pair.prototype.toString = function () {
        return "Pair(" + this.first + ", " + this.second + ")";
    };
    return Pair;
}());
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
var Result = /** @class */ (function () {
    function Result(state, value) {
        this.state = state;
        this.value = value;
    }
    Result.prototype.toString = function () {
        return "Result(newState = " + this.state + ", value = " + this.value + ")";
    };
    return Result;
}());
// (S) => (S, A) + flatMap = Stateful computations
var Recipe = /** @class */ (function () {
    function Recipe(runWithInitialState) {
        this.runWithInitialState = runWithInitialState;
    }
    Recipe.prototype.map = function (f) {
        var _this = this;
        return new Recipe(function (s) {
            var _a = _this.runWithInitialState(s), state = _a.state, value = _a.value;
            return new Result(state, f(value));
        });
    };
    Recipe.flatten = function (prog) {
        return new Recipe(function (s) {
            var _a = prog.runWithInitialState(s), state = _a.state, value = _a.value;
            return value.runWithInitialState(state);
        });
    };
    Recipe.prototype.flatMap = function (f) {
        return Recipe.flatten(this.map(f));
    };
    return Recipe;
}());
function push(x) {
    return new Recipe(function (s) {
        return new Result(new Cell(x, s), Unit.instance);
    });
}
var pop = new Recipe(function (s) { return new Result(s.tail, s.head); });
var unitState = new Recipe(function (s) { return new Result(s, Unit.instance); });
var prog1 = push(1)
    .flatMap(function (ignored) { return push(2); });
// console.log(
//   prog1
//     .runWithInitialState(linkedListOf())
//     .toString())
var prog2 = prog1
    .flatMap(function (ignored) { return prog1; });
// console.log(
//   prog2
//     .runWithInitialState(linkedListOf(3, 4))
//     .toString())
var prog3 = pop
    .flatMap(function (v) {
    console.log(v);
    return unitState;
});
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
var prog4 = pop
    .flatMap(function (x) { return x % 2 == 0 ? push(x) : prog3; });
// console.log(
//   prog4
//     .runWithInitialState(linkedListOf(2, 4, 6, 7))
//     .toString())
// Questions?
// Robert Chrzanowski
// Twitter: @Robert_Chrzanow
// Tokens + flatMap = AST that can be interpreted for side effects
var IO = /** @class */ (function () {
    function IO() {
    }
    IO.prototype.map = function (f) {
        return new IOMap(this, f);
    };
    IO.flatten = function (io) {
        return new IOFlatten(io);
    };
    IO.prototype.flatMap = function (f) {
        return IO.flatten(this.map(f));
    };
    return IO;
}());
var IOMap = /** @class */ (function (_super) {
    __extends(IOMap, _super);
    function IOMap(io, f) {
        var _this = _super.call(this) || this;
        _this.io = io;
        _this.f = f;
        return _this;
    }
    IOMap.prototype.run = function (f) {
        var _this = this;
        this.io.run(function (x) { return f(_this.f(x)); });
    };
    return IOMap;
}(IO));
var IOFlatten = /** @class */ (function (_super) {
    __extends(IOFlatten, _super);
    function IOFlatten(ioio) {
        var _this = _super.call(this) || this;
        _this.ioio = ioio;
        return _this;
    }
    IOFlatten.prototype.run = function (f) {
        this.ioio.run(function (x) { return x.run(f); });
    };
    return IOFlatten;
}(IO));
var IOPure = /** @class */ (function (_super) {
    __extends(IOPure, _super);
    function IOPure(x) {
        var _this = _super.call(this) || this;
        _this.x = x;
        return _this;
    }
    IOPure.prototype.run = function (f) {
        f(this.x);
    };
    return IOPure;
}(IO));
var IOPrintLn = /** @class */ (function (_super) {
    __extends(IOPrintLn, _super);
    function IOPrintLn(str) {
        var _this = _super.call(this) || this;
        _this.str = str;
        return _this;
    }
    IOPrintLn.prototype.run = function (f) {
        console.log(this.str);
        f(Unit.instance);
    };
    return IOPrintLn;
}(IO));
var readLineCallback = function () {
};
var IOReadLine = /** @class */ (function (_super) {
    __extends(IOReadLine, _super);
    function IOReadLine() {
        return _super.call(this) || this;
    }
    IOReadLine.prototype.run = function (f) {
        readLineCallback = f;
    };
    IOReadLine.instance = new IOReadLine();
    return IOReadLine;
}(IO));
//# sourceMappingURL=main.js.map