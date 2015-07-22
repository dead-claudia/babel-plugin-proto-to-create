# babel-plugin-proto-to-create

A simple plugin that converts `__proto__` in object literals to `Object.assign` + `Object.create`. Engines don't usually optimize literals with `__proto__` very well (some just don't optimize the object, and others won't optimize the surrounding context), and that's what this is for.

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
var foo = {
    __proto__: null,
    bar: 2,
    doSomething: function () {
        this.bar++
    }
}

// Out
var foo = Object.assign(Object.create(null), {
    bar: 2,
    doSomething: function () {
        this.bar++
    }
})
```

```js
// In
var foo = {
    foo: 1,
    doSomething: function () {
        this.foo++
    },
}

var bar = {
    __proto__: foo,
    bar: 2,
    doSomethingElse: function () {
        this.bar++
    }
}

// Out
var foo = {
    foo: 1,
    doSomething: function () {
        this.foo++
    },
}

var bar = Object.assign(Object.create(foo), {
    bar: 2,
    doSomethingElse: function () {
        this.bar++
    }
})
```

This works well with @JedWatson's [`babel-plugin-object-assign`](https://github.com/babel-plugins/babel-plugin-object-assign) plugin. It's also designed to make prototypal inheritance without classes be faster and better.

**Note:** this does nothing about setting `__proto__` directly (it's passed straight through):

```js
foo.__proto__ = bar
```

## Issues

If you run into problems, please file an issue in the issue tracker. I will take a look at it as soon as I get to it.

## Contributing

Feel free to open a PR if you think something could be done better, or another thing awesome could be added. There is no official style guide, but please keep to the current code style. (4 spaces, no tabs)

## License

ISC License

Copyright (c) 2015, Isiah Meadows

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
