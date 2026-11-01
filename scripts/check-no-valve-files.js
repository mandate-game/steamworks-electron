const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const bannedName =
    /(^|[\\/])(steam_api(64)?\.(dll|lib)|libsteam_api\.(so|dylib)|libsdkencryptedappticket\.(so|dylib)|sdkencryptedappticket(64)?\.(dll|lib)|steam_api\.h|isteam[\w.-]+\.h)$/i
const bannedDir = /(^|[\\/])(redistributable_bin|public[\\/]steam)([\\/]|$)/

function hits(file) {
    return bannedName.test(file) || bannedDir.test(file)
}

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)

const skipDir = new Set(['.git', 'node_modules', 'target', 'dist'])
/** @type {string[]} */
const walked = []

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (skipDir.has(entry.name)) continue
            walk(path.join(dir, entry.name))
        } else if (entry.isFile()) {
            walked.push(path.relative(process.cwd(), path.join(dir, entry.name)))
        }
    }
}

walk(process.cwd())

const found = [...new Set([...tracked, ...walked])].filter(hits).sort()
if (found.length) {
    console.error('Valve Steamworks SDK files must not be in this repository:')
    for (const file of found) console.error(`  ${file}`)
    process.exit(1)
}

console.log(
    `Checked ${tracked.length} tracked files and ${walked.length} working-tree files; no Valve SDK headers, libraries, or redistributables.`,
)
