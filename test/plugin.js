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
        // We need a way to monitor calls to Object.create and return the
        // appropriate prototype.
        var old = Object.create
        var lastProto
        before(function () {
            Object.create = function (proto) {
                lastProto = proto
                return old.apply(this, arguments)
            }
        })

        // Clean up the mess. We don't want to leave this permanently broken.
        after(function () {
            Object.create = old
        })

        function call(file, opts) {
            file = path.resolve(__dirname, file)
            var src = babel.transformFileSync(file, opts)

            Function("expect", "it", "lastProto", src.code)(expect, it,
                function () { return lastProto })
        }

        describe("in strict code", function () {
            call("fixtures/strict.js", {
                plugins: [".."],
            })
        })

        describe("in loose code", function () {
            call("fixtures/loose.js", {
                plugins: [".."],
                blacklist: ["strict"],
            })
        })
    })
})
