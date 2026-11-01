const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { resolveSdkRoot, redistributableFiles, targetFor, parseBuildArgs, MISSING_ENV } = require('../scripts/sdk-path')

test('missing STEAM_SDK_LOCATION explains how to fix it', () => {
    const previous = process.env.STEAM_SDK_LOCATION
    delete process.env.STEAM_SDK_LOCATION
    try {
        assert.throws(() => resolveSdkRoot(), (error) => {
            assert.match(error.message, /STEAM_SDK_LOCATION is not set/)
            assert.match(error.message, /partner\.steamgames\.com/)
            assert.match(error.message, /does not bundle/)
            assert.equal(error.message, MISSING_ENV)
            return true
        })
        assert.throws(() => resolveSdkRoot('   '), /STEAM_SDK_LOCATION is not set/)
        assert.throws(() => resolveSdkRoot(undefined), /STEAM_SDK_LOCATION is not set/)
    } finally {
        if (previous === undefined) delete process.env.STEAM_SDK_LOCATION
        else process.env.STEAM_SDK_LOCATION = previous
    }
})

test('accepts the sdk directory or the zip root that contains sdk/', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'steam-sdk-'))
    const sdk = path.join(root, 'sdk')
    const redist = path.join(sdk, 'redistributable_bin', 'linux64')
    fs.mkdirSync(redist, { recursive: true })
    fs.writeFileSync(path.join(redist, 'libsteam_api.so'), '')

    assert.equal(resolveSdkRoot(sdk), sdk)
    assert.equal(resolveSdkRoot(root), sdk)

    const target = targetFor('x86_64-unknown-linux-gnu')
    const files = redistributableFiles(sdk, target)
    assert.deepEqual(files, [path.join(redist, 'libsteam_api.so')])
})

test('rejects a directory that is not an SDK layout', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'not-sdk-'))
    assert.throws(() => resolveSdkRoot(root), /does not contain redistributable_bin/)
})

test('rejects a missing redistributable for the selected target', () => {
    const sdk = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-empty-'))
    fs.mkdirSync(path.join(sdk, 'redistributable_bin', 'win64'), { recursive: true })
    assert.throws(
        () => redistributableFiles(sdk, targetFor('x86_64-pc-windows-msvc')),
        /steam_api64\.dll/,
    )
})

test('parseBuildArgs keeps the rustc triple and forwards napi flags', () => {
    const parsed = parseBuildArgs(['--release', '--target', 'x86_64-unknown-linux-gnu'])
    assert.equal(parsed.target, 'x86_64-unknown-linux-gnu')
    assert.deepEqual(parsed.napiArgs, ['--release', '--target', 'x86_64-unknown-linux-gnu'])
})
