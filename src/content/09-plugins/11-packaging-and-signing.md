---
title: Packaging and signing
description: The .fkplugin archive format, the cargo xtask build commands, what an Ed25519 signature actually covers, and how signing works for real distribution.
---

## The archive format

A `.fkplugin` file is a ZIP with a deliberately narrow, closed shape. Core refuses anything outside
it, by exact reason, rather than silently ignoring the unexpected part.

**Legal entries** (matched by exact name, no others allowed):

| Entry | Tier |
|---|---|
| `plugin.json` | Both, required |
| `plugin.json.sig` | Both, optional (its absence just means "unsigned") |
| `plugin.wasm` | `process` only, required for that tier and forbidden on `data`. It must be a WebAssembly component. |
| `logo.svg` or `logo.png` | Both, at most one |

**Size and shape caps:**

| Cap | Value |
|---|---|
| Entries per archive | 4 |
| Whole archive, compressed (upload or catalog fetch) | 33 MiB |
| Total uncompressed | 48 MiB |
| `plugin.wasm` | 32 MiB |
| `plugin.json` | 256 KiB |
| `plugin.json.sig` | 256 bytes |
| Logo | 64 KiB |
| Compression ratio, per entry | 100:1 |

Only the store (no compression) and deflate compression methods are accepted; no ZIP64, no data
descriptors, no encrypted entries, no symlinks, no directory entries, no archive comment, and no
more than one end-of-central-directory record. Entry names must be NFC, free of control characters
and path separators, and unique even case-folded. A logo is checked by its bytes: PNG by its magic
bytes, SVG must be XML rooted at `<svg>` with no `<script>`, no `on*=` attribute and no
`javascript:`. Every one of these has its own refusal code; build your archive with a plain, boring
zip writer that stores files, which is what `cargo xtask package` does.

### Refusal codes

The guards run in this order and the first failure refuses the whole archive, before anything
touches the disk.

| Code | Refused because |
|---|---|
| `PLUGIN_BAD_MAGIC` | The bytes don't start with a ZIP local header. |
| `PLUGIN_TOO_LARGE` | The archive, an entry, or the total is over its cap, or an inflated size contradicts the central directory. |
| `PLUGIN_TRAILING_DATA` | A second end-of-central-directory record. |
| `PLUGIN_MALFORMED_ARCHIVE` | The central directory can't be parsed. |
| `PLUGIN_ARCHIVE_COMMENT` | The archive has a comment. |
| `PLUGIN_TOO_MANY_ENTRIES` | More than 4 entries. |
| `PLUGIN_CONTROL_CHAR`, `PLUGIN_NOT_NFC`, `PLUGIN_PATH_SEPARATOR`, `PLUGIN_ABSOLUTE_PATH` | An entry name breaks the naming rules above. |
| `PLUGIN_DIRECTORY_ENTRY`, `PLUGIN_SYMLINK` | An entry is a directory, or a Unix file type other than regular. |
| `PLUGIN_DUPLICATE_ENTRY` | A duplicate name, exact or case-folded, or two logos. |
| `PLUGIN_UNEXPECTED_ENTRY` | A name outside `plugin.json`, `plugin.json.sig`, `plugin.wasm`, `logo.svg`, `logo.png`. |
| `PLUGIN_ZIP64`, `PLUGIN_DATA_DESCRIPTOR`, `PLUGIN_ENCRYPTED`, `PLUGIN_COMPRESSION_METHOD` | An unsupported ZIP feature. |
| `PLUGIN_RATIO` | A compression ratio above 100, or content from zero compressed bytes. |
| `PLUGIN_MANIFEST_TOO_LARGE` | `plugin.json` over 256 KiB. |
| `PLUGIN_BAD_SIGNATURE` | `plugin.json.sig` doesn't decode to exactly 64 bytes. |
| `PLUGIN_BAD_LOGO` | The logo isn't a safe PNG or SVG. |

The manifest, tier and file-set refusals that follow are in
[the manifest reference](/plugins/manifest#full-validation-error-reference).

## Building with `cargo xtask`

A plugin repository keeps a tiny `xtask` crate over the SDK's `build` feature (see
[Your first plugin](/plugins/first-plugin#step-1-create-the-crate)). It has three commands:

```bash
cargo xtask build [<crate dir>]
cargo xtask package [<crate dir>] [--key <hex seed file>] [--out <dir>] [--max-mib <n>]
cargo xtask verify <archive> [--key <hex public key file>] [--max-mib <n>]
```

`build` runs `cargo build --release --target wasm32-wasip2` and prints the path of the component.

`package` does the whole job:

1. Builds the release component.
2. Writes `plugin.json` from `plugin.template.json`: the template plus `version` (from `Cargo.toml`)
   and `files`, the sha256 of `plugin.wasm` and of the logo. You never hand-write `files`.
3. Writes `<id>-<version>.fkplugin` into `--out` (default `.`) as a deterministic archive:
   store-only, a fixed DOS timestamp, no archive comment, entries in a fixed order (`plugin.json`,
   `plugin.json.sig` if signed, `plugin.wasm`, the logo), so two builds of the same input are
   byte-identical.
4. Verifies it before writing it: core's own archive inspector, the `files` hashes, the size budget
   (`--max-mib`, default 32) and that the component imports only the `plugin` world and exports
   only `guest`.

Without `--key` the archive is **unsigned**:

```text
dist/example.hello-0.1.0.fkplugin
```

That is exactly right for local iteration (see [Your first plugin](/plugins/first-plugin)) and
exactly wrong for anything you intend other people to install.

## What a signature actually covers

The Ed25519 signature is over **the exact raw bytes of `plugin.json`, and nothing else**. Not the
zip, not `plugin.wasm`. The other files are covered indirectly: a `process` manifest's `files` map
holds their sha256 hashes, and those hashes are checked against the real bytes at install and at
every load, so a `plugin.wasm` that doesn't match its declared hash is `PLUGIN_HASH_MISMATCH` (at
load, the plugin fails as `tampered`), a separate failure from a bad signature.

- `plugin.json.sig` is the base64 text of the raw 64-byte signature. Surrounding whitespace is
  trimmed first, so a trailing newline is fine. It must decode to exactly 64 bytes, or the archive
  is refused with `PLUGIN_BAD_SIGNATURE` before the manifest is even parsed.
- The signature is checked against the **compiled-in official public keys** on core's side (today
  one key, `release-2026`). There is no registry of third-party keys built into core: the only way
  an archive becomes `official` trust is a signature that verifies against one of those keys.
  Everything else is `unverified` (a 64-byte signature that verifies against no official key,
  whoever made it) or `unsigned` (no signature at all).
- A `process` archive that is not `official` is refused with `PLUGIN_UNSIGNED` unless the admin
  setting **Allow unsigned plugins** (`plugins.allow_unsigned`) is on. That holds for `unverified`
  as well as `unsigned`. The setting gates installs, not loads: turning it back off leaves a plugin
  already installed running; uninstall it instead. A `data` archive installs with any trust level,
  after the admin ticks the acknowledgement on the consent sheet.
- An upgrade over a package that was verified by a key must carry the same key
  (`PLUGIN_SIGNER_CHANGED`, 409).

> [!IMPORTANT]
> Sign the **archived** `plugin.json`, never your source template. `cargo xtask package` writes
> the manifest with `serde_json`'s pretty printer, so the archived bytes differ from
> `plugin.template.json` byte for byte. A signature made over any other bytes will never verify.

## Signing for development

`--key <hex seed file>` signs the archive with a development key: a file holding 64 hex
characters, the 32-byte Ed25519 seed (`openssl rand -hex 32 > dev.key` makes one).

```bash
cargo xtask package --key dev.key --out dist
```

A development key is not one core trusts, so the archive is `unverified` on a real server and still
needs **Allow unsigned plugins**. The flag exists to exercise a signed archive's shape end to end.
`cargo xtask package --key` also makes the verification step trust that key's public half.

## Signing for distribution

A plugin other people install carries the signature of the official release key, made by the
catalog's `Package plugin` workflow from the unsigned archive your repository's release publishes:
it checks the archive against the manifest the catalog maintainers reviewed, signs `plugin.json`
with the catalog key, and replaces the release asset with the signed `.fkplugin`. The private half
of that key lives only in the catalog repository's secrets. See [Publishing](/plugins/publishing)
for the whole flow, and why a plugin published on its own is `unverified`.

## Quick packaging checklist

- [ ] `plugin.template.json` has the `id`, `pluginApi`, `fliks` range and `runtime: "wasm"` you mean,
      and `Cargo.toml`'s `version` is the version you are releasing.
- [ ] `cargo xtask package` passes: it verifies the archive, the world and the size budget.
- [ ] You did not hand-write `files`, and you did not sign your template.
- [ ] The component is built with `opt-level = "s"`, LTO and `strip = true`, so it fits well under
      the 32 MiB cap (the real plugins gate CI at 12 MiB with `--max-mib 12`).
- [ ] You imported the archive on a dev instance with **Allow unsigned plugins** on and it reached
      `Active` (see [Testing and debugging](/plugins/testing-and-debugging)).
