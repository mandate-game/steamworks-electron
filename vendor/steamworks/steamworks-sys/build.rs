//! Patched for @mandate-game/steamworks-electron.
//!
//! Upstream steamworks-sys falls back to a copy of the Valve Steamworks SDK
//! under `lib/steam`. That copy is not vendored here. The SDK must be supplied
//! at build time through STEAM_SDK_LOCATION.

#[cfg(feature = "rebuild-bindings")]
extern crate bindgen;

use std::env;
use std::fs;
#[cfg(feature = "rebuild-bindings")]
use std::path::Path;
use std::path::PathBuf;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("cargo:rerun-if-env-changed=STEAM_SDK_LOCATION");

    let sdk_loc = resolve_sdk_location()?;
    println!("cargo:rerun-if-changed={}", sdk_loc.display());

    let out_path = PathBuf::from(env::var("OUT_DIR")?);
    let triple = env::var("TARGET")?;

    let mut lib = "steam_api";
    let mut link_path = sdk_loc.join("redistributable_bin");
    if triple.contains("windows") {
        if !triple.contains("i686") {
            lib = "steam_api64";
            link_path.push("win64");
        }
    } else if triple.contains("linux") {
        if triple.contains("i686") {
            link_path.push("linux32");
        } else if triple.contains("aarch64") {
            link_path.push("linuxarm64");
        } else {
            link_path.push("linux64");
        }
    } else if triple.contains("darwin") {
        link_path.push("osx");
    } else {
        return Err(format!("Unsupported target triple: {triple}").into());
    };

    let redistributable = |file: &str| -> Result<PathBuf, Box<dyn std::error::Error>> {
        let path = link_path.join(file);
        if !path.is_file() {
            return Err(format!(
                "Steamworks redistributable not found at {}.\n\
                 Download the Steamworks SDK from Valve (https://partner.steamgames.com/doc/sdk) \
                 and set STEAM_SDK_LOCATION to the sdk directory that contains redistributable_bin/.\n\
                 This package does not bundle Valve SDK headers, libraries, or redistributables.",
                path.display()
            )
            .into());
        }
        Ok(path)
    };

    if triple.contains("windows") {
        let dll_file = format!("{lib}.dll");
        let lib_file = format!("{lib}.lib");
        fs::copy(redistributable(&dll_file)?, out_path.join(&dll_file))?;
        fs::copy(redistributable(&lib_file)?, out_path.join(&lib_file))?;
    } else if triple.contains("darwin") {
        fs::copy(
            redistributable("libsteam_api.dylib")?,
            out_path.join("libsteam_api.dylib"),
        )?;
    } else if triple.contains("linux") {
        fs::copy(
            redistributable("libsteam_api.so")?,
            out_path.join("libsteam_api.so"),
        )?;
    }

    println!("cargo:rustc-link-search={}", out_path.display());
    println!("cargo:rustc-link-lib=dylib={lib}");

    // Dependent crates can read this as DEP_STEAM_API_LIB_DIR.
    println!("cargo:lib_dir={}", out_path.display());

    #[cfg(feature = "rebuild-bindings")]
    rebuild_bindings(&sdk_loc, &triple)?;

    Ok(())
}

fn resolve_sdk_location() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let raw = env::var("STEAM_SDK_LOCATION").map_err(|_| {
        "STEAM_SDK_LOCATION is not set.\n\
         Download the Steamworks SDK from Valve (https://partner.steamgames.com/doc/sdk) \
         and point STEAM_SDK_LOCATION at the extracted \"sdk\" directory \
         (the folder that contains redistributable_bin/ and public/).\n\
         The zip root that contains sdk/ is also accepted.\n\
         This crate does not bundle Valve SDK headers, libraries, or redistributables."
    })?;

    let given = PathBuf::from(raw.trim());
    if !given.exists() {
        return Err(format!("STEAM_SDK_LOCATION does not exist: {}", given.display()).into());
    }

    if given.join("redistributable_bin").is_dir() {
        return Ok(given);
    }

    let nested = given.join("sdk");
    if nested.join("redistributable_bin").is_dir() {
        return Ok(nested);
    }

    Err(format!(
        "STEAM_SDK_LOCATION ({}) does not contain redistributable_bin/.\n\
         Point it at the Steamworks SDK \"sdk\" directory from Valve's zip, \
         or at the zip root that contains sdk/.",
        given.display()
    )
    .into())
}

#[cfg(feature = "rebuild-bindings")]
fn rebuild_bindings(sdk_loc: &Path, triple: &str) -> Result<(), Box<dyn std::error::Error>> {
    let target_os = if triple.contains("windows") {
        "windows"
    } else if triple.contains("darwin") {
        "macos"
    } else if triple.contains("linux") {
        if triple.contains("aarch64") {
            "linuxarm"
        } else {
            "linux"
        }
    } else {
        return Err(format!("Unsupported target triple: {triple}").into());
    };

    let flat_header = sdk_loc.join("public/steam/steam_api_flat.h");
    let server_header = sdk_loc.join("public/steam/steam_gameserver.h");
    for header in [&flat_header, &server_header] {
        if !header.is_file() {
            return Err(format!(
                "Steamworks header not found at {}.\n\
                 STEAM_SDK_LOCATION must point at a full Steamworks SDK, not only the redistributables.",
                header.display()
            )
            .into());
        }
    }

    let binding_path = Path::new(&format!("src/{target_os}_bindings.rs")).to_owned();
    let bindings = bindgen::Builder::default()
        .header(flat_header.to_string_lossy())
        .header(server_header.to_string_lossy())
        .clang_arg("-xc++")
        .clang_arg("-std=c++11")
        .clang_arg(format!("-I{}", sdk_loc.join("public").display()))
        .allowlist_function("Steam.*")
        .allowlist_var(".*")
        .allowlist_type(".*")
        .default_enum_style(bindgen::EnumVariation::Rust {
            non_exhaustive: true,
        })
        .bitfield_enum("EMarketNotAllowedReasonFlags")
        .bitfield_enum("EBetaBranchFlags")
        .bitfield_enum("EFriendFlags")
        .bitfield_enum("EPersonaChange")
        .bitfield_enum("ERemoteStoragePlatform")
        .bitfield_enum("EChatSteamIDInstanceFlags")
        .bitfield_enum("ESteamItemFlags")
        .bitfield_enum("EOverlayToStoreFlag")
        .bitfield_enum("EChatSteamIDInstanceFlags")
        .generate()
        .expect("Unable to generate bindings");

    bindings
        .write_to_file(binding_path)
        .expect("Couldn't write bindings!");
    Ok(())
}
