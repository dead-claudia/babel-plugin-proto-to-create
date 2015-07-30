"use strict";

var _slicedToArray = require("babel-runtime/helpers/sliced-to-array")["default"];

var _Map = require("babel-runtime/core-js/map")["default"];

var _Array$from = require("babel-runtime/core-js/array/from")["default"];

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (_ref) {
    var t = _ref.types;
    var Plugin = _ref.Plugin;

    var addHelper = false;
    var define = undefined;

    function toString(key) {
        if (key.type === "Identifier") {
            return t.literal(key.name);
        } else {
            return key;
        }
    }

    function id(name) {
        return t.identifier(name);
    }

    // This helper is smaller than the equivalent Object.defineProperty call
    // after 2-3 getter/setter definitions, so it shouldn't be much of a problem
    // being repeated across files.
    function helper() {
        return t.functionDeclaration(define, [id("host"), id("key"), id("desc")], t.blockStatement([t.expressionStatement(t.assignmentExpression("=", t.memberExpression(id("desc"), id("configurable")), t.assignmentExpression("=", t.memberExpression(id("desc"), id("enumerable")), t.literal(true)))), t.expressionStatement(t.callExpression(t.memberExpression(id("Object"), id("defineProperty")), [id("host"), id("key"), id("desc")]))]));
    }

    function generate(proto, properties, scope, file) {
        var ref = scope.generateUidIdentifier("ref");
        var data = new _Map();
        // address duplicates
        properties.forEach(function (prop) {
            if (t.isSpreadProperty && t.isSpreadProperty(prop)) {
                data.set(prop, null);
                return;
            }

            if (prop.kind === "init") {
                data.set(prop.key, {
                    init: prop.value,
                    computed: prop.computed
                });
            } else {
                addHelper = true;
                var res = data.get(prop.key) || { computed: prop.computed };
                var value = prop.value;
                data.set(prop.key, res);
                res[prop.kind] = value;
            }
        });

        return [t.variableDeclaration("var", [t.variableDeclarator(ref, t.callExpression(t.memberExpression(id("Object"), id("create")), [proto]))])].concat(_Array$from(data).map(function (_ref2) {
            var _ref22 = _slicedToArray(_ref2, 2);

            var key = _ref22[0];
            var prop = _ref22[1];

            if (prop === null) {
                return t.callExpression(file.addHelper("extends"), // Just use Babel's helper
                [ref, key.argument]);
            }

            if (prop.init) {
                return t.assignmentExpression("=", t.memberExpression(ref, key, prop.computed), prop.init);
            } else {

                var desc = [];

                if (prop.get) {
                    desc.push(t.property("init", id("get"), prop.get));
                }
                if (prop.set) {
                    desc.push(t.property("init", id("set"), prop.set));
                }

                var _name = toString(key);

                return t.callExpression(define, [ref, _name, t.objectExpression(desc)]);
            }
        })).concat([ref]);
    }

    return new Plugin("babel-plugin-proto-to-create", {
        visitor: {
            Program: {
                enter: function enter(node, parent, scope) {
                    define = scope.generateUidIdentifier("define");
                },

                exit: function exit(node) {
                    if (addHelper) node.body.push(helper());
                }
            },

            ObjectExpression: function ObjectExpression(_ref3, parent, scope, file) {
                var properties = _ref3.properties;

                for (var i = 0; i < properties.length; i++) {
                    var prop = properties[i];

                    if (t.isProperty(prop) && prop.kind === "init" && !prop.computed && t.isIdentifier(prop.key) && prop.key.name === "__proto__") {
                        // Remove the proto property
                        properties.splice(i, 1);
                        return generate(prop.value, properties, scope, file);
                    }
                }
            }
        }
    });
};

module.exports = exports["default"];
