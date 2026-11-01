# Vendored steamworks-rs

This directory is a patched copy of [steamworks-rs](https://github.com/Noxime/steamworks-rs) `0.13.1` (git `d8114185613be4dbfe4897c8484d0b2670fd3cd7`).

Upstream `steamworks-sys` ships a copy of the Valve Steamworks SDK under `steamworks-sys/lib/steam` (headers, import libraries, and redistributables). Those files are **not** included here. `steamworks-sys/build.rs` is patched to require `STEAM_SDK_LOCATION` and to fail with an explicit error when the SDK is missing or incomplete.

The pregenerated Rust bindings in `steamworks-sys/src/*_bindings.rs` are retained. They are generated code produced by steamworks-rs, not Valve's headers or binaries.

Licenses for this vendored code: `LICENSE-MIT` and `LICENSE-APACHE` in this directory. Copyright (c) 2018 Matthew Collins and steamworks-rs contributors.
