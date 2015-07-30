// Note that this must be runnable in both strict and loose mode. It also must
// be runnable with this plugin as the only transformer.

var expect = require("expect.js")

it("should set the child prototype correctly", function () {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
    }

    expect(Object.getPrototypeOf(bar)).to.equal(foo)
    expect(Object.getPrototypeOf({__proto__: null})).to.equal(null)
})

it("should set the prototype correctly when extra props are set", function () {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
        prop: 1,
    }

    expect(Object.getPrototypeOf(bar)).to.equal(foo)
})

it("should set child properties in child types", function () {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
        prop: 1,
    }

    expect(bar).to.have.property("prop")
    expect(bar.prop).to.be(1)
})

it("should not modify prototype properties through subtypes", function () {
    var foo = {prop: 2}

    /* eslint-disable no-unused-vars */
    var bar = {
        __proto__: foo,
        prop: 1,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(2)
    /* eslint-enable no-unused-vars */
})

it("should work with getters", function () {
    var bar = {
        __proto__: null,
        get prop() { return 1 },
    }

    expect(bar.prop).to.be(1)
})

it("should work with setters", function () {
    var value = 0
    /* eslint-disable accessor-pairs */
    var bar = {
        __proto__: null,
        set prop(v) { value = v },
    }
    /* eslint-enable accessor-pairs */

    bar.prop = 2

    expect(value).to.be(2)
})

it("should work with combined getters and setters", function () {
    var value
    var bar = {
        __proto__: null,
        get prop() { return 1 },
        set prop(v) { value = v },
    }

    bar.prop = 2

    expect(bar.prop).to.be(1)
    expect(value).to.be(2)
})

it("should work with computed properties", function () {
    var foo = {prop: 2}

    /* eslint-disable no-unused-vars */
    var bar = {
        __proto__: foo,
        ["prop"]: 1,
    }
    /* eslint-enable no-unused-vars */

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(2)
})
