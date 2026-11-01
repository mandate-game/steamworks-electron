#!/usr/bin/env bash
# Resolve the Steamworks SDK for CI.
#
# Uses an existing STEAM_SDK_LOCATION directory, or downloads STEAM_SDK_URL
# (a zip of the SDK from Valve; keep the URL in a GitHub secret).
# Writes STEAM_SDK_LOCATION to $GITHUB_ENV when that file exists, and always
# writes ${RUNNER_TEMP:-/tmp}/steam-sdk.env so the caller can `source` it
# in the same shell step. Execute this script; do not source it (`exit`
# would leave the caller).
set -euo pipefail

write_location() {
    local sdk="$1"
    if [[ -n "${GITHUB_ENV:-}" ]]; then
        echo "STEAM_SDK_LOCATION=${sdk}" >> "${GITHUB_ENV}"
    fi
    local envfile="${RUNNER_TEMP:-/tmp}/steam-sdk.env"
    printf 'STEAM_SDK_LOCATION=%q\n' "${sdk}" > "${envfile}"
    echo "Steamworks SDK ready at ${sdk}"
}

if [[ -n "${STEAM_SDK_LOCATION:-}" && -d "${STEAM_SDK_LOCATION}" ]]; then
    write_location "${STEAM_SDK_LOCATION}"
    exit 0
fi

if [[ -z "${STEAM_SDK_URL:-}" ]]; then
    echo "STEAM_SDK_LOCATION is unset and STEAM_SDK_URL is unset." >&2
    echo "Download the Steamworks SDK from Valve (https://partner.steamgames.com/doc/sdk) and set one of those." >&2
    exit 1
fi

dest="${RUNNER_TEMP:-/tmp}/steamworks-sdk"
rm -rf "${dest}"
mkdir -p "${dest}"
curl -fsSL "${STEAM_SDK_URL}" -o "${dest}/sdk.zip"
unzip -q "${dest}/sdk.zip" -d "${dest}/unzipped"

sdk_bin="$(find "${dest}/unzipped" -type d -name redistributable_bin | head -n 1 || true)"
if [[ -z "${sdk_bin}" ]]; then
    echo "Downloaded archive does not contain redistributable_bin/." >&2
    exit 1
fi

write_location "$(dirname "${sdk_bin}")"
