// Keep this down to ES5 (except for __proto__). Note that this must be runnable
// in both strict and loose mode.

it("should set the child prototype correctly", function () {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
    }

    expect(Object.getPrototypeOf(bar)).to.equal(foo)
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

    var bar = {
        __proto__: foo,
        prop: 1,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(2)
})
