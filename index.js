"use strict";

var _Map = require("babel-runtime/core-js/map")["default"];

var _ = require("lodash");

module.exports = function (babel) {
    var t = babel.types;

    var addHelper = false;
    var define;

    function toString(key) {
        if (key.type === "Identifier") {
            return t.literal(key.name);
        } else {
            return key;
        }
    }

    function helper() {
        var desc = t.identifier("desc");
        return t.functionDeclaration(define, [t.identifier("host"), t.identifier("key"), desc], t.blockStatement([t.expressionStatement(t.assignmentExpression("=", t.memberExpression(desc, t.identifier("configurable")), t.assignmentExpression("=", t.memberExpression(desc, t.identifier("enumerable")), t.literal(true)))), t.expressionStatement(t.callExpression(t.memberExpression(t.identifier("Object"), t.identifier("defineProperty")), [t.identifier("host"), t.identifier("key"), desc]))]));
    }

    function generate(proto, properties, scope) {
        var ref = scope.generateUidIdentifier("ref");
        var data = new _Map();
        // address duplicates
        _.forEach(properties, function (prop) {
            if (prop.kind === "init") {
                data.set(prop.key, {
                    init: prop.value,
                    computed: data.computed
                });
            } else if (prop.kind === "get" || prop.kind === "set") {
                addHelper = true;
                var res = { computed: data.computed };
                var value = prop.value;

                if (!data.has(prop.key)) {
                    data.set(prop.key, res);
                } else {
                    res = data.get(prop.key);
                }

                if (prop.kind === "get") {
                    res.get = value;
                } else {
                    res.set = value;
                }
            }
        });
        var assignments = [t.variableDeclaration("var", [t.variableDeclarator(ref, t.callExpression(t.memberExpression(t.identifier("Object"), t.identifier("create")), [proto]))])];
        data.forEach(function (prop, key) {
            if (prop.init) {
                assignments.push(t.assignmentExpression("=", t.memberExpression(ref, key, prop.computed), prop.init));
            } else {
                var desc = [];

                if (prop.get) {
                    desc.push(t.property("init", t.identifier("get"), prop.get));
                }

                if (prop.set) {
                    desc.push(t.property("init", t.identifier("set"), prop.set));
                }

                assignments.push(t.callExpression(define, [ref, toString(key), t.objectExpression(desc)]));
            }
        });
        assignments.push(ref);
        return assignments;
    }

    return new babel.Plugin("babel-plugin-proto-to-create", {
        visitor: {
            Program: {
                enter: function enter(node, parent, scope) {
                    define = scope.generateUidIdentifier("define");
                },

                exit: function exit(node) {
                    if (!addHelper) return;

                    var first = node.body[0];

                    // Keep this code strict mode if it already is.
                    if (first.type === "Literal" && first.value === "use strict") {
                        node.body.splice(1, 0, helper());
                    } else {
                        node.body.unshift(helper());
                    }
                }
            },

            ObjectExpression: function ObjectExpression(node, parent, scope) {
                var props = node.properties;
                var pair = _(node.properties).map(function (key, i) {
                    return [key, i];
                }).filter("0", {
                    type: "Property",
                    kind: "init",
                    computed: false,
                    key: t.identifier("__proto__")
                }).first();
                if (pair) {
                    // Remove the proto property
                    props.splice(pair[1], 1);
                    return generate(pair[0].value, props, scope);
                }
            }
        }
    });
};
