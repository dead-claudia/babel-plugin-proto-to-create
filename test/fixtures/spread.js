// Note that this must be runnable in both strict and loose mode. It also must
// be runnable with this plugin and es7.objectRestSpread as the only
// transformers.

var expect = require("expect.js")

it("should work with spread properties when supported", function () {
    var foo = {prop: 2}

    var bar = {
        __proto__: null,
        ...foo,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(2)

    expect(bar).to.have.property("prop")
    expect(bar.prop).to.be(2)
})

it("should work dependent on order", function () {
    var foo = {prop: 2}

    var bar = {
        __proto__: null,
        ...foo,
        prop: 3,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(2)

    expect(bar).to.have.property("prop")
    expect(bar.prop).to.be(3)
})

it("should be overridable by mixins further down", function () {
    var foo = {prop: 1}
    var bar = {prop: 2}

    var baz = {
        __proto__: null,
        ...foo,
        prop: 3,
        ...bar,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(1)

    expect(bar).to.have.property("prop")
    expect(bar.prop).to.be(2)

    expect(baz).to.have.property("prop")
    expect(baz.prop).to.be(2)
})

it("should override inherited properties, without mutating them", function () {
    var foo = {prop: 1}
    var bar = {prop: 2}

    var baz = {
        __proto__: foo,
        ...bar,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(1)

    expect(bar).to.have.property("prop")
    expect(bar.prop).to.be(2)

    expect(baz).to.have.property("prop")
    expect(baz.prop).to.be(2)
})

it("should apply the prototype before anything else", function () {
    var foo = {prop: 1}
    var bar = {prop: 2}

    var baz = {
        ...bar,
        __proto__: foo,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(1)

    expect(bar).to.have.property("prop")
    expect(bar.prop).to.be(2)

    expect(baz).to.have.property("prop")
    expect(baz.prop).to.be(2)
})

it("should work with overriding properties after multiple mixins", function () {
    var foo = {prop: 1}
    var bar = {prop: 2}

    var baz = {
        __proto__: null,
        ...foo,
        ...bar,
        prop: 3,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(1)

    expect(bar).to.have.property("prop")
    expect(bar.prop).to.be(2)

    expect(baz).to.have.property("prop")
    expect(baz.prop).to.be(3)
})

it("should work with overriding computed properties", function () {
    var foo = {prop: 1}
    var bar = {prop: 2}

    var baz = {
        __proto__: null,
        ...foo,
        ...bar,
        ["prop"]: 3,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(1)

    expect(bar).to.have.property("prop")
    expect(bar.prop).to.be(2)

    expect(baz).to.have.property("prop")
    expect(baz.prop).to.be(3)
})

it("should not bail if the object being spread is null", () => {
    ({
        __proto__: null,
        ...(null),
    })
})

it("should not bail if the object being spread is undefined", () => {
    ({
        __proto__: null,
        ...(void 0),
    })
})
