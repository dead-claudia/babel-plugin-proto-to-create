import * as fs from "fs"
import * as path from "path"

function promise(func, ...args) {
    return new Promise((resolve, reject) =>
        func(...args, (err, data) => err != null ? reject(err) : resolve(data)))
}

const generated = path.resolve(__dirname, "test/fixtures/generated")

const exists = f => err => {
    if (err.code === "ENOENT") throw err
    return f()
}

const ignore = exists(() => {})

promise(fs.unlink, path.resolve(__dirname, "index.js")).catch(ignore)
    .then(() => promise(fs.readdir, generated))
    .then(
        entries => Promise.all(entries
            .map(entry => path.resolve(generated, entry))
            .map(entry => promise(fs.unlinkSync, entry).catch(ignore)),
        exists(() => promise(fs.mkdir, generated))))
    // protect against above `then`, since it doesn't necessarily resolve the
    // promise
    .catch(ignore)
    .catch(err => {
        console.error(err.stack)
        process.exit(1)
    })
