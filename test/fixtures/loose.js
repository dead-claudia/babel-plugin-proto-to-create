// Keep this down to ES5 (except for __proto__). This is intentionally in sloppy
// mode.

it("should set bar's prototype to foo", function () {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
    }

    expect(lastProto()).to.equal(foo)
})

it("should set the prototype correctly when extra props are set", function () {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
        prop: 1,
    }

    expect(lastProto()).to.equal(foo)
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

it("should not modify foo's properties through subtypes", function () {
    var foo = {prop: 2}

    var bar = {
        __proto__: foo,
        prop: 1,
    }

    expect(foo).to.have.property("prop")
    expect(foo.prop).to.be(2)
})
