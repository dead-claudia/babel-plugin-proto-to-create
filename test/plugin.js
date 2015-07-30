"use strict"

import * as fs from "fs"
import * as path from "path"
import * as babel from "babel"
import plugin from "../plugin.js"
import expect from "expect.js"

import tests from "./tests.js"

const fixtures = path.resolve(__dirname, "fixtures")
const generated = path.join(fixtures, "generated")

try {
    fs.mkdirSync(generated)
} catch (e) {
    // If it exists, then we're already set.
    if (e.code !== "EEXIST") throw e
}

function run(name, opts) {
    const file = path.resolve(fixtures, name + ".js")

    function call(context, part, opts) {
        opts.plugins = [plugin]
        const target = path.resolve(generated, `${name}-${part}.js`)

        try {
            fs.unlinkSync(target)
        } catch (e) {
            // Swallow non-permission-related errors from this
            if (e.code === "EACCES") throw e
        }

        describe(context, () => {
            const src = babel.transformFileSync(file, opts).code
            fs.writeFileSync(target, "/* eslint disable */\n" + src)
            require(target) // Better stack traces
        })
    }

    describe(name, () => {
        call("strict, only this plugin", "strict.only", opts.strict.only || {})
        call("sloppy, only this plugin", "sloppy.only", opts.sloppy.only || {})
        call("strict, with Babel defaults", "strict.normal", opts.strict.normal || {})
        call("sloppy, with Babel defaults", "sloppy.normal", opts.sloppy.normal || {})
    })
}

describe("babel-plugin-proto-to-create", () => {
    it("should exist", () => expect(plugin).to.be.ok())
    it("should be a function", () => expect(plugin).to.be.a("function"))

    describe("runtime behavior", () => {
        Object.keys(tests).forEach(key => run(key, tests[key]))
    })
})
