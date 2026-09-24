---
title: Packaging and signing
description: The .fkplugin archive format, the local build command, what an Ed25519 signature actually covers, and how to sign one for real.
---

## The archive format

A `.fkplugin` file is a ZIP with a deliberately narrow, closed shape. Core refuses anything outside
it, by exact reason, rather than silently ignoring the unexpected part.

**Legal entries** (matched by exact name, no others allowed):

| Entry | Tier |
|---|---|
| `plugin.json` | Both, required |
| `plugin.json.sig` | Both, optional (its absence just means "unsigned") |
| `plugin.js` | `process` only, required for that tier and forbidden on `data` |
| `logo.svg` or `logo.png` | Both, at most one |

**Size and shape caps:**

| Cap | Value |
|---|---|
| Entries per archive | 4 |
| Whole archive, compressed | 8 MiB |
| Total uncompressed | 24 MiB |
| `plugin.json` | 256 KiB |
| `plugin.json.sig` | 256 bytes |
| `plugin.js` | 8 MiB |
| Logo | 64 KiB |
| Compression ratio, per entry | 100:1 |

Only the store (no compression) and deflate compression methods are accepted; no ZIP64, no data
descriptors, no encrypted entries, no symlinks, no directory entries, no archive comment, and no
more than one end-of-central-directory record. Every one of these has its own refusal code (the
full list is in [the manifest reference](/plugins/manifest#full-validation-error-reference)); the
practical upshot is: build your archive with a plain, boring zip writer that stores files rather
than one tuned for maximum compression or compatibility with unusual zip features.

## Building locally, for development

From the core Fliks repository's `backend/` directory:

```bash
npm run package-plugin -- <built-plugin-dir> [-o out.fkplugin]
```

`<built-plugin-dir>` is a directory holding your built `plugin.json`, `plugin.js` (for a `process`
manifest) and logo. This tool:

1. Recomputes every `files` sha256 itself, rather than trusting whatever your manifest already
   says, a hand-written value is refused.
2. Refuses early, by name, on anything the inspector would refuse later anyway: a missing
   `plugin.js` for a `process` manifest, one present on a `data` manifest, a `logo` field that
   doesn't match what's on disk, an oversized entry, a bad id or version.
3. Writes an archive that is **always unsigned**.

```text
wrote /path/to/acme.tool-1.0.0.fkplugin (1942 bytes) for acme.tool@1.0.0
unsigned: installable only on a core whose "allow unsigned plugins" plugin setting is on
```

That output is exactly right for local iteration (see [Your first plugin](/plugins/first-plugin)),
and exactly wrong for anything you intend other people to install: signing for real distribution is
a separate, later step this tool deliberately does not perform.

## What a signature actually covers

The Ed25519 signature is over **the exact raw bytes of `plugin.json`, and nothing else**. Not the
zip, not `plugin.js`. The other files are covered indirectly: a `process` manifest's `files` map
holds their sha256 hashes, and those hashes are checked against the real bytes when the archive is
extracted, if `plugin.js` doesn't match its declared hash, that's `PLUGIN_HASH_MISMATCH`, a
separate failure from a bad signature.

- `plugin.json.sig` is the base64 text of the raw 64-byte signature. Its length must decode to
  exactly 64 bytes, or the archive is refused with `PLUGIN_BAD_SIGNATURE` before the manifest is
  even parsed.
- The signature is checked against a **compiled-in public key** on core's side. There is no
  registry of third-party keys built into core: the only way an archive becomes `official` trust is
  a signature that verifies against that one key, everything else is `unverified` (a valid-length
  signature from a key core doesn't know) or `unsigned` (no signature at all). See
  [Publishing](/plugins/publishing) for what that means for your own catalog.

> [!IMPORTANT]
> If you build your own packaging step, don't sign your **source** `plugin.json` file. Core's own
> packaging tool (and any packaging step modelled on it) re-serialises the manifest
> (`JSON.stringify(manifest, null, 2)`) before writing it into the archive, computing `files`
> yourself along the way, so the archived bytes differ from your source file byte for byte. Sign
> the **archived** bytes, after that re-serialisation, or your signature will never verify.

## Hand-rolling your own packaging step

Both real plugins covered in [Examples](/plugins/examples) build their own archive with about 100
lines of plain Node, no zip dependency, in this shape:

1. Bundle (`esbuild`, `--bundle --platform=node --target=node24`).
2. Compute the sha256 of the built `plugin.js` and the logo; write them into `files`.
3. Write out `plugin.json` (your template plus the computed `version` and `files`).
4. If a signing key is available (an environment variable holding an Ed25519 private key in PEM or
   base64 DER), sign the manifest bytes and write `plugin.json.sig` as base64. Otherwise skip it,
   the archive is unsigned.
5. Build the zip by hand: **store method only** (no compression), a real CRC32
   (`node:zlib.crc32`), the UTF-8 filename flag, a fixed DOS date/time (so two builds of identical
   input produce byte-identical output), no archive comment, entries in a fixed order
   (`plugin.json`, `plugin.json.sig` if present, `plugin.js` if present, the logo).

Doing it this way, with no dependency at all, is deliberate in both real plugins: a packaging tool
whose job is partly to gatekeep supply-chain risk for everyone downstream of your archive shouldn't
import its own.

## Generating and holding a signing key

```ts
import { generateKeyPairSync } from 'node:crypto';
const { publicKey, privateKey } = generateKeyPairSync('ed25519');
```

- Keep the **private** half only in a CI secret (or your own local secret store); never commit it.
- Publish the **public** half at a stable, permanent location, one file per key id, and **never
  delete a retired key's public file**: a signature made with it has to keep verifying for as long
  as the archive it signed might still be installed anywhere.
- Rotating means **adding a new key**, never replacing an existing file. A signature is bound to
  the exact key that made it, not to "whichever key this trust store currently prefers", restoring
  an old signed archive still verifies against the old, retained key even after you've moved on to
  signing new archives with a new one.

The full mechanics of running this as an actual catalog other people install from, including how
`official` trust and revocation interact with key rotation, are in
[Publishing](/plugins/publishing#key-rotation).

## Quick packaging checklist

- [ ] `plugin.js` is a single bundled file; `node --check dist/plugin.js` runs clean with no
      `require` your bundler didn't inline.
- [ ] `files` is computed by your build step, never hand-written.
- [ ] The archive holds only legal entries, and nothing exceeds the size caps above.
- [ ] You signed the **archived** manifest bytes, not your source file, if you signed at all.
- [ ] `npm run package-plugin` (or your own `verify-with-core.ts`, see
      [Testing and debugging](/plugins/testing-and-debugging#verifying-your-archive-against-the-real-core-inspector))
      accepts it before you try installing it anywhere.
