const fs = require('node:fs')
const path = require('node:path')

/**
 * Native targets this package builds. `folder` is the directory under
 * `<sdk>/redistributable_bin/` in Valve's Steamworks SDK zip.
 */
const TARGETS = {
    'x86_64-pc-windows-msvc': {
        folder: 'win64',
        files: ['steam_api64.dll', 'steam_api64.lib'],
        platform: 'win32',
        arch: 'x64',
    },
    'x86_64-unknown-linux-gnu': {
        folder: 'linux64',
        files: ['libsteam_api.so'],
        platform: 'linux',
        arch: 'x64',
    },
    'x86_64-apple-darwin': {
        folder: 'osx',
        files: ['libsteam_api.dylib'],
        platform: 'darwin',
        arch: 'x64',
    },
    'aarch64-apple-darwin': {
        folder: 'osx',
        files: ['libsteam_api.dylib'],
        platform: 'darwin',
        arch: 'arm64',
    },
}

const MISSING_ENV =
    'STEAM_SDK_LOCATION is not set. Download the Steamworks SDK from Valve ' +
    '(https://partner.steamgames.com/doc/sdk) and point STEAM_SDK_LOCATION at the extracted ' +
    '"sdk" directory (the folder that contains redistributable_bin/ and public/). ' +
    'The zip root that contains sdk/ is also accepted. ' +
    'This package does not bundle Valve SDK headers, libraries, or redistributables.'

/**
 * @param {string | undefined} location
 * @returns {string} absolute path of the SDK directory that contains redistributable_bin/
 */
function resolveSdkRoot(location = process.env.STEAM_SDK_LOCATION) {
    if (location == null || String(location).trim() === '') {
        throw new Error(MISSING_ENV)
    }

    const given = path.resolve(String(location).trim())
    if (!fs.existsSync(given)) {
        throw new Error(`STEAM_SDK_LOCATION does not exist: ${given}`)
    }

    if (fs.existsSync(path.join(given, 'redistributable_bin'))) {
        return given
    }

    const nested = path.join(given, 'sdk')
    if (fs.existsSync(path.join(nested, 'redistributable_bin'))) {
        return nested
    }

    throw new Error(
        `STEAM_SDK_LOCATION (${given}) does not contain redistributable_bin/. ` +
            'Point it at the Steamworks SDK "sdk" directory from Valve\'s zip, ' +
            'or at the zip root that contains sdk/.',
    )
}

/**
 * @param {string | undefined} triple rustc target triple, or undefined for the host
 */
function targetFor(triple) {
    if (triple) {
        const match = TARGETS[triple]
        if (!match) {
            throw new Error(
                `Unsupported target ${triple}. Supported targets: ${Object.keys(TARGETS).join(', ')}`,
            )
        }
        return { triple, ...match }
    }

    const found = Object.entries(TARGETS).find(
        ([, target]) => target.platform === process.platform && target.arch === process.arch,
    )
    if (!found) {
        throw new Error(`Unsupported host platform ${process.platform}/${process.arch}`)
    }
    return { triple: found[0], ...found[1] }
}

/**
 * @param {string} sdkRoot
 * @param {{ folder: string, files: string[] }} target
 * @returns {string[]} absolute paths of the redistributable files for this target
 */
function redistributableFiles(sdkRoot, target) {
    const dir = path.join(sdkRoot, 'redistributable_bin', target.folder)
    const missing = target.files.filter((file) => !fs.existsSync(path.join(dir, file)))
    if (missing.length) {
        throw new Error(
            `Steamworks redistributable files missing in ${dir}: ${missing.join(', ')}. ` +
                'Download the Steamworks SDK from Valve and set STEAM_SDK_LOCATION to that sdk directory.',
        )
    }
    return target.files.map((file) => path.join(dir, file))
}

/**
 * npm scripts pass `--target <triple>` through. Everything else is forwarded to `napi build`.
 * @param {string[]} argv
 */
function parseBuildArgs(argv) {
    /** @type {string | undefined} */
    let target
    /** @type {string[]} */
    const napiArgs = []
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--target') {
            target = argv[i + 1]
            if (!target) {
                throw new Error('--target requires a rustc triple')
            }
            napiArgs.push('--target', target)
            i++
        } else {
            napiArgs.push(argv[i])
        }
    }
    return { target, napiArgs }
}

module.exports = {
    TARGETS,
    MISSING_ENV,
    resolveSdkRoot,
    targetFor,
    redistributableFiles,
    parseBuildArgs,
}
