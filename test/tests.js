// A simple map to abstract away compiler options from running the tests. Note
// that the test file name in test/fixtures/ and the keys here must be
// identical.
export default {
    base: {
        strict: {
            normal: {},
            only: {whitelist: ["strict"]},
        },
        sloppy: {
            normal: {blacklist: ["strict"]},
            only: {whitelist: []},
        },
    },
    spread: {
        strict: {
            normal: {optional: ["es7.objectRestSpread"]},
            only: {whitelist: ["strict", "es7.objectRestSpread"]},
        },
        sloppy: {
            normal: {
                blacklist: ["strict"],
                optional: ["es7.objectRestSpread"],
            },
            only: {whitelist: ["es7.objectRestSpread"]},
        },
    },
}
