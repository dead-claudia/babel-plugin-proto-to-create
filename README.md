# babel-plugin-proto-to-create

A simple plugin that converts `__proto__` in object literals to `Object.create` + setting properties. Engines haven't historically optimized literals with `__proto__` very well. Some just don't optimize object accesses as well (SpiderMonkey), and others refuse to optimize the entire containing function context ([V8](https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#2-unsupported-syntax)). That's where this plugin comes in. [See this blog post for why I made this.](http://impinball.blogspot.com/2015/07/objects-linked-to-other-objects.html)

## Usage

Via `.babelrc` (recommended):

```json
{
    "plugins": ["proto-to-create"]
}
```

Via CLI:

```
babel --plugins proto-to-create script.js
```

Via Node API:

```js
require("babel-core").transform("code", {
    plugins: ["proto-to-create"],
});
```

## Examples

```js
// In
const foo = {
    __proto__: null,
    bar: 2,
    doSomething() {
        this.bar++
    },
}
```

```js
// Out
var foo = (_ref = Object.create(null), _ref.bar = 2, _ref.doSomething = function () {
    this.bar++
}, _ref);
```

```js
// In
const foo = {
    foo: 1,
    doSomething() {
        this.foo++
    },
}

const bar = {
    __proto__: foo,
    bar: 2,
    doSomethingElse() {
        this.bar++
    },
}
```

```js
// Out
var _ref;

var foo = {
    foo: 1,
    doSomething: function () {
        this.foo++
    },
};

var bar = (_ref = Object.create(foo), _ref.bar = 2, _ref.doSomethingElse = function () {
    this.bar++
}, _ref);
```

This works well with @JedWatson's [`babel-plugin-object-assign`](https://github.com/babel-plugins/babel-plugin-object-assign) plugin. It's also designed to make prototypal inheritance with objects linked to other object faster and better. Also it works with [object spread properties](https://github.com/sebmarkbage/ecmascript-rest-spread) when the `es7.objectRestSpread` transformer is enabled, making for some very sweet, easy object prototype mixins that still don't lag in performance.

```js
const Mixin1 = {
    someCoolAddition() { /* ... */ },
}

const Mixin2 = {
    anotherCoolMethod() { /* ... */ },
}

const Foo = {
    master() { /* ... */ },

    method() { /* ... */ },
}

const Type = {
    __proto__: Foo,

    ...Mixin1,
    ...Mixin2,

    // Override
    method() { /* ... */ },
}

const inst = Object.create(Type)

// Or, you could use __proto__ as an initializer, even, with little of a
// performance hit.

const other = {
    __proto__: Type,

    // An extra property
    prop: 1,
}
```

## Caveats

This does nothing about setting `__proto__` directly. There is no decent way to mitigate the performance impact of dynamically setting object prototypes directly, and trying to optimize this use case is out of the scope of this library.

```js
foo.__proto__ = bar
```

## Issues

If you run into problems, please file an issue in the issue tracker. I will take a look at it as soon as I get to it.

## Contributing

Feel free to open a PR if you think something could be done better, or another thing awesome could be added. Make sure to keep ESLint happy, and keep this as well tested as possible. When you write tests, please follow the directions in the [test readme](https://github.com/impinball/babel-plugin-proto-to-create/tree/master/test/README.md).

## Code style

This follows the [standard](https://standardjs.com/) code style, with a few modifications:

1.  Strings are always double-quoted when not interpolating.
2.  Function names and their opening parenthesis have no space before them, i.e. `function foo() {}`
3.  Always include the trailing comma.
4.  Never use `var`.
5.  Indentation is 4 spaces.

## License

ISC License

Copyright (c) 2015, Isiah Meadows

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
