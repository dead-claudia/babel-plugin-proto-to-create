"use strict"

module.exports = function (babel) {
    var t = babel.types

    function generate(proto, node) {
        return t.callExpression(t.memberExpression(
            t.identifier("Object"),
            t.identifier("assign")
        ), [
            t.callExpression(
                t.memberExpression(
                    t.identifier("Object"),
                    t.identifier("create")
                ),
                [proto]
            ),
            node
        ])
    }

    return new babel.Plugin("babel-plugin-proto-to-create", {
        visitor: {
            ObjectExpression: function (node) {
                var props = node.properties
                for (var i = 0; i < props.length; i++) {
                    var property = props[i]
                    if (property.type === "Property" &&
                            !property.computed &&
                            property.key &&
                            property.key.type === "Identifier" &&
                            property.key.name === "__proto__") {
                        // Remove the proto property
                        props.splice(i, 1)
                        return generate(property.value, node)
                    }
                }
            }
        }
    })
}
