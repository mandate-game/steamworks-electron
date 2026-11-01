# Updating the Steamworks SDK bindings

This vendored copy does **not** contain Valve's SDK. Do not copy headers or
redistributables into `steamworks-sys/lib`.

To regenerate bindings against a newer SDK you downloaded from Valve:

1. Set `STEAM_SDK_LOCATION` to that sdk directory.
2. Build `steamworks-sys` with `--features rebuild-bindings` (needs libclang).
3. Review the generated `steamworks-sys/src/*_bindings.rs` and the safe wrappers.
4. Do not commit anything under `steamworks-sys/lib/`.
