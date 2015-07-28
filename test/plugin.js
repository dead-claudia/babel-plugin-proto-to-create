"use strict"

import * as fs from "fs"
import * as path from "path"
import * as babel from "babel-core"
import plugin from "../plugin.js"
import expect from "expect.js"

const fixtures = path.resolve(__dirname, "fixtures")
const generated = path.join(fixtures, "generated")
const file = path.resolve(fixtures, "test.js")

describe("babel-plugin-proto-to-create", () => {
    it("should exist", () => expect(plugin).to.be.ok())
    it("should be a function", () => expect(plugin).to.be.a("function"))

    describe("runtime behavior", () => {
        function call(context, header, whitelist, blacklist) {
            var target = path.join(fixtures, "generated", context + ".js")

            try {
                fs.mkdirSync(generated)
            } catch (e) {
                if (e.code !== "EEXIST") throw e
            }

            describe(context, () => {
                var src = babel.transformFileSync(file, {
                    plugins: ["../plugin.js"],
                    whitelist,
                    blacklist,
                }).code

                try {
                    fs.unlinkSync(target)
                } catch (e) {
                    // Swallow non-permission-related errors from this
                    if (e.code === "EACCES") throw e
                }
                fs.writeFileSync(target, "/* jshint ignore:start */\n" + src)

                /* jshint evil: true */
                Function("expect", "it", "require", src)(expect, it, require)
                /* jshint evil: false */
            })
        }

        call("in strict code, only", "\"use strict\";\n", ["strict"])
        call("in loose code, only", "", [])

        call("in strict code, normal", "\"use strict\";\n")
        call("in loose code, normal", "", null, ["strict"])
    })
})
