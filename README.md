# @mandate-game/steamworks-electron

[![CI](https://github.com/mandate-game/steamworks-electron/actions/workflows/ci.yml/badge.svg)](https://github.com/mandate-game/steamworks-electron/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Steamworks SDK bindings for **Electron** and **Node.js**. This is an actively maintained fork of [steamworks.js](https://github.com/ceifa/steamworks.js) (the usual JavaScript alternative to the unmaintained [greenworks](https://github.com/greenheartgames/greenworks) native module).

The JavaScript API matches steamworks.js: a small Node entry that loads a napi-rs addon written in Rust on top of [steamworks-rs](https://github.com/Noxime/steamworks-rs). TypeScript declarations ship with the package.

## Why this fork

steamworks.js was the right shape for Electron games, and development on it has gone quiet. This fork exists to keep that API building against current steamworks-rs, napi-rs, Rust, and Node.

It also stops redistributing Valve's Steamworks SDK. Upstream steamworks.js committed the redistributable binaries, and steamworks-rs commits a full SDK tree inside `steamworks-sys`. Those files are not in this repository and they are not in the npm package. You download the SDK from Valve.

## Install

```sh
npm install @mandate-game/steamworks-electron
```

Published builds contain the native `.node` addons only. They do **not** contain `steam_api64.dll`, `libsteam_api.so`, or `libsteam_api.dylib`. See [Shipping on Steam](#shipping-on-steam).

Node.js `^20.17.0 || >=22.13.0` is required to compile the addon. The published addon targets N-API 9, which current Electron and Node releases provide.

## Steamworks SDK

The SDK is required to **compile** this package. It is not vendored.

1. Download the Steamworks SDK zip from Valve: <https://partner.steamgames.com/doc/sdk> (Steamworks partner login).
2. Unzip it. `STEAM_SDK_LOCATION` must be the `sdk` directory (the one that contains `redistributable_bin/` and `public/`), or the zip root that contains `sdk/`.
3. Export it and build:

```sh
export STEAM_SDK_LOCATION="$HOME/steamworks_sdk/sdk"
npm install
npm run build
```

If `STEAM_SDK_LOCATION` is missing, or the directory has no `redistributable_bin/`, both the Node build script and the Rust build script stop with an error that points at the Valve download page. There is no fallback copy inside the repo.

A local build copies the redistributable for your target next to the `.node` file so you can load the addon while developing. That copy stays in `dist/` and is gitignored. `npm pack` does not include it.

## Electron

```js
const { app, BrowserWindow } = require('electron')
const steamworks = require('@mandate-game/steamworks-electron')

// If the player started the executable outside the Steam client, relaunch through Steam.
if (steamworks.restartAppIfNecessary(480)) {
    app.quit()
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            // The addon is a native Node module. The renderer can use it only
            // when Node integration is on and context isolation is off.
            contextIsolation: false,
            nodeIntegration: true,
        },
    })

    // 480 is Spacewar, Valve's sample app. Pass your own AppID, or omit it
    // and put the id in steam_appid.txt next to the executable.
    const client = steamworks.init(480)
    console.log(client.localplayer.getName())

    if (client.achievement.activate('ACHIEVEMENT')) {
        client.stats.store()
    }

    win.loadFile('index.html')
}

app.whenReady().then(createWindow)

// Call after the app object exists, at the end of the main process, so the
// Steam overlay can draw over the Electron window.
steamworks.electronEnableSteamOverlay()
```

The same `init` call works from a plain Node process when you are not using Electron. Run Steam, and call `client.run` is not required: `init` schedules `runCallbacks` for you.

Declarations for the rest of the API are in [`client.d.ts`](./client.d.ts).

## Shipping on Steam

Linking against Steamworks does not give you the right to republish Valve's SDK, and this package does not do that. When you ship a game on Steam, copy the redistributable from **your** SDK into the build, next to the addon (or next to the executable, depending on how the dynamic linker is set up):

| Platform | File under `sdk/redistributable_bin/` |
| --- | --- |
| Windows 64-bit | `win64/steam_api64.dll` |
| Linux 64-bit | `linux64/libsteam_api.so` |
| macOS | `osx/libsteam_api.dylib` |

Valve's Steamworks SDK Access Agreement allows a Steam application to redistribute those libraries with the game. On Linux the addon is built with `rpath=$ORIGIN`, so `libsteam_api.so` needs to sit beside the `.node` file.

## Build from source

Install a current Rust stable (the repo pins the toolchain in `rust-toolchain.toml`; 1.88 or newer is required by napi-rs 3), Node 22 or 24, and a C toolchain. Set `STEAM_SDK_LOCATION` as above, then:

```sh
npm install
npm run build:debug   # current platform, unoptimized
npm test              # SDK path checks; no Valve SDK and no Steam client required
npm run typecheck
```

`npm run build` compiles a release addon for the host, or pass a triple:

```sh
npm run build -- --target x86_64-unknown-linux-gnu
```

Targets: `x86_64-pc-windows-msvc`, `x86_64-unknown-linux-gnu`, `x86_64-apple-darwin`, `aarch64-apple-darwin`.

CI runs formatting, the SDK-path tests, and TypeScript checks on every pull request. The native compile runs only when the `STEAM_SDK_URL` secret (a URL of Valve's SDK zip) or `STEAM_SDK_LOCATION` is configured. Without that secret the native job is skipped on purpose and the log says so. `cargo clippy` needs the SDK too, because `steamworks-sys` links the redistributable while the crate is type-checked.

The [release workflow](.github/workflows/release.yml) publishes to npm when a `v*` tag is pushed or the workflow is dispatched. It expects repository secrets `NPM_TOKEN` and `STEAM_SDK_URL`, and it refuses to publish if the SDK secret is missing. It is not run as part of ordinary development.

## Layout

`vendor/steamworks` is steamworks-rs 0.13.1 with `steamworks-sys` patched so the build reads `STEAM_SDK_LOCATION` instead of a bundled SDK. Pregenerated Rust bindings stay in the vendor tree; Valve's headers and binaries do not. See [VENDOR.md](vendor/steamworks/VENDOR.md) and [NOTICE](NOTICE).

## License

MIT. Copyright (c) 2022 Gabriel Francisco Dos Santos. Copyright (c) 2026 Mandate Game.

steamworks-rs is included under MIT OR Apache-2.0. See [NOTICE](NOTICE).

The Steamworks SDK remains Valve's. It is not licensed under MIT by being mentioned here.
