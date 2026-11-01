const path = require('node:path')
const fs = require('node:fs')
const childProcess = require('node:child_process')
const { resolveSdkRoot, targetFor, redistributableFiles, parseBuildArgs } = require('./scripts/sdk-path')

const { target: requestedTarget, napiArgs } = parseBuildArgs(process.argv.slice(2))
const sdkRoot = resolveSdkRoot()
const target = targetFor(requestedTarget)
const sources = redistributableFiles(sdkRoot, target)

const dist = path.join(__dirname, 'dist', target.folder)
fs.mkdirSync(dist, { recursive: true })

// Local builds copy the redistributable next to the addon so the dynamic
// linker can find it (rpath $ORIGIN on Linux). These files are Valve's and
// are excluded from the npm package; shipping apps copy them from the SDK
// into their own build.
for (const source of sources) {
    fs.copyFileSync(source, path.join(dist, path.basename(source)))
}

const napiBin = path.join(
    __dirname,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'napi.cmd' : 'napi',
)

const params = [
    'build',
    '--platform',
    '--no-dts-header',
    '--no-js',
    '--dts',
    path.join('..', '..', 'client.d.ts'),
    '--output-dir',
    path.relative(process.cwd(), dist),
    ...napiArgs,
]

const child = childProcess.spawn(napiBin, params, { stdio: 'inherit' })
child.on('exit', (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal)
        return
    }
    process.exit(code == null ? 1 : code)
})
