// Note that this must be runnable in both strict and loose mode.

it("should set the child prototype correctly", () => {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
    }

    expect(Object.getPrototypeOf(bar)).to.equal(foo)
})

it("should set the prototype correctly when extra props are set", () => {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
        prop: 1,
    }

    expect(Object.getPrototypeOf(bar)).to.equal(foo)
})

it("should set child properties in child types", () => {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
        prop: 1,
    }

    expect(bar).to.have.property("prop")
    expect(bar.prop).to.be(1)
})

it("should not modify prototype properties through subtypes", () => {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
        prop: 1,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(2)
})

it("should work with getters", () => {
    var bar = {
        __proto__: null,
        get prop() { return 1 },
    }

    expect(bar.prop).to.be(1)
})

it("should work with setters", () => {
    var value = 0
    var bar = {
        __proto__: null,
        set prop(v) { value = v }, // jshint ignore:line
    }

    bar.prop = 2

    expect(value).to.be(2)
})

it("should work with combined getters and setters", () => {
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
