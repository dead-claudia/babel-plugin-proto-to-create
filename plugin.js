"use strict"

import assert from "assert"

export default function ({types: t, Plugin}) {
  let addHelper = false
  let define

  function toString(key) {
    if (key.type === "Identifier") {
      return t.literal(key.name)
    } else {
      return key
    }
  }

  function id(name) {
    assert(typeof name === "string", "name should be a string")
    return t.identifier(name)
  }

  // This helper is smaller than the equivalent Object.defineProperty call after
  // 2-3 getter/setter definitions, so it shouldn't be much of a problem being
  // repeated across files.
  function helper() {
    assert(t.isIdentifier(define), "define should be an Identifier")
    return t.functionDeclaration(
      define,
      [id("host"), id("key"), id("desc")],
      t.blockStatement([
        t.expressionStatement(t.assignmentExpression("=",
          t.memberExpression(id("desc"), id("configurable")),
          t.assignmentExpression("=",
            t.memberExpression(id("desc"), id("enumerable")),
            t.literal(true)))),
        t.expressionStatement(t.callExpression(
          t.memberExpression(id("Object"), id("defineProperty")),
          [id("host"), id("key"), id("desc")]))
      ])
    )
  }

  function generate(proto, properties, scope) {
    var ref = scope.generateUidIdentifier("ref")
    var data = new Map()
    // address duplicates
    properties.forEach(prop => {
      assert(t.isProperty(prop), "prop should be a Property")
      if (prop.kind === "init") {
        data.set(prop.key, {
          init: prop.value,
          computed: prop.computed,
        })
      } else {
        assert(prop.kind === "get" || prop.kind === "set")
        addHelper = true
        var res = data.get(prop.key) || {computed: prop.computed}
        var value = prop.value
        data.set(prop.key, res)
        res[prop.kind] = value
      }
    })

    const list = [
      t.variableDeclaration("var", [
        t.variableDeclarator(
          ref,
          t.callExpression(
            t.memberExpression(id("Object"), id("create")),
            [proto]
          ))
      ]),
    ].concat(Array.from(data).map(([key, prop]) => {
      assert(t.isExpression(key), "key should be an expression")

      if (prop.init) {
        assert(t.isExpression(prop.init), "prop should be an expression")
        return t.assignmentExpression("=",
          t.memberExpression(ref, key, prop.computed),
          prop.init)
      } else {
        assert(prop.get || prop.set, "prop should be either a getter or setter")

        const desc = []

        if (prop.get) {
          assert(t.isFunction(prop.get), "prop.get should be a function")
        } else {
          assert(t.isFunction(prop.set), "prop.set should be a function")
        }

        if (prop.get) desc.push(t.property("init", id("get"), prop.get))
        if (prop.set) desc.push(t.property("init", id("set"), prop.set))

        const name = toString(key)

        assert(t.isExpression(name), "name should be an expression")

        return t.callExpression(
          define,
          [ref, name, t.objectExpression(desc)])
      }
    }))
    .concat([ref])
    return list
  }

  return new Plugin("babel-plugin-proto-to-create", {
    visitor: {
      Program: {
        enter(node, parent, scope) {
          define = scope.generateUidIdentifier("define")
        },

        exit(node) {
          if (addHelper) node.body.push(helper())
        }
      },

      ObjectExpression({properties}, parent, scope) {
        for (let i = 0; i < properties.length; i++) {
          const prop = properties[i]

          if (t.isProperty(prop) &&
              prop.kind === "init" &&
              !prop.computed &&
              t.isIdentifier(prop.key) &&
              prop.key.name === "__proto__") {
            // Remove the proto property
            properties.splice(i, 1)
            return generate(prop.value, properties, scope)
          }
        }
      },
    }
  })
}
