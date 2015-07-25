"use strict"

var Map = require("es6-map")

module.exports = function (babel) {
    var t = babel.types

    function generate(proto, properties, scope) {
        var ref = scope.generateUidIdentifier("ref")
        var data = new Map()
        // address duplicates
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i]

            if (prop.kind === "init") {
                data.set(prop.key, {
                    init: prop.value,
                    computed: data.computed,
                })
            } else if (prop.kind === "get" || prop.kind === "set") {
                var res = {computed: data.computed}
                var value = data.value

                if (!data.has(prop.key)) {
                    data.set(prop.key, res)
                } else {
                    res = data.get(prop.key)
                }

                if (prop.kind === "get") {
                    res.get = value
                } else {
                    res.set = value
                }

                value.id = prop.key
            }
        }
        var assignments = [
            t.variableDeclaration("var", [
                t.variableDeclarator(
                    ref,
                    t.callExpression(
                        t.memberExpression(
                            t.identifier("Object"),
                            t.identifier("create")
                        ),
                        [proto]
                    ))
            ])
        ]
        data.forEach(function (prop, key) {
            if (prop.init) {
                assignments.push(t.assignmentExpression("=",
                    t.memberExpression(ref, key, prop.computed),
                    prop.init))
            } else {
                var desc = [
                    t.property(t.identifier("configurable"), t.literal(true)),
                    t.property(t.identifier("enumerable"), t.literal(true)),
                    t.property(t.identifier("writable"), t.literal(true)),
                ]

                if (prop.get) {
                    desc.push(t.property(t.identifier("get"), prop.get))
                }

                if (prop.set) {
                    desc.push(t.property(t.identifier("set"), prop.set))
                }

                assignments.push(t.callExpression(
                    t.memberExpression(
                        t.identifier("Object"),
                        t.identifier("defineProperty")
                    ),
                    [t.memberExpression(ref, key, prop.computed), desc]))
            }
        })
        assignments.push(ref)
        return assignments
    }

    return new babel.Plugin("babel-plugin-proto-to-create", {
        visitor: {
            ObjectExpression: function (node, parent, scope) {
                var props = node.properties
                for (var i = 0; i < props.length; i++) {
                    var property = props[i]
                    if (property.type === "Property" &&
                            property.kind === "init" &&
                            !property.computed &&
                            property.key &&
                            property.key.type === "Identifier" &&
                            property.key.name === "__proto__") {
                        // Remove the proto property
                        props.splice(i, 1)
                        return generate(property.value, props, scope)
                    }
                }
            }
        }
    })
}
