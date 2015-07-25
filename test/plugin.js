"use strict"

var path = require("path")
var babel = require("babel-core")
var plugin = require("..")
var expect = require("expect.js")

Object.assign = require("object-assign")

describe("babel-plugin-proto-to-create", function () {
    it("should exist", function () {
        expect(plugin).to.be.ok()
    })

    it("should be a function", function () {
        expect(plugin).to.be.a("function")
    })

    describe("runtime behavior", function () {
        function call(context, header, blacklist) {
            var fs = require("fs")
            var fixtures = path.resolve(__dirname, "fixtures")
            var generated = path.join(fixtures, "generated")
            var target = path.join(fixtures, "generated", context + ".js")
            var file = path.resolve(fixtures, "test.js")
            try {
                fs.mkdirSync(generated)
            } catch (e) {
                if (e.code !== "EEXIST") throw e
            }

            describe(context, function () {
                var src = babel.transformFileSync(file, {
                    plugins: [".."],
                    blacklist: blacklist,
                }).code

                try {
                    fs.unlinkSync(target)
                } catch (e) {
                    // Swallow non-permission-related errors from this
                    if (e.code === "EACCES") throw e
                }
                fs.writeFileSync(target, "/* jshint ignore:start */\n" + src)

                /* jshint evil: true */
                Function("expect", "it", src)(expect, it)
                /* jshint evil: false */
            })
        }

        call("in strict code", "\"use strict\";\n", [])
        call("in loose code", "", ["strict"])
    })
})
