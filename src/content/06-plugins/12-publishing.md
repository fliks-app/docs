---
title: Publishing
description: Releasing through the official catalog, hosting your own, compatibility across core versions, and how updates and revocation reach an installed plugin.
---

## What a catalog is

A **catalog** is a signed HTTPS document (`catalog.json`, plus a detached signature at
`catalog.json.sig`) listing plugins and, for each, the versions available to install: their
`pluginApi`, their `fliks` compatibility range, a download URL and a sha256. A **source** is a URL
an admin has added under **Settings > Advanced > Plugins > ⋮ > Manage sources**; there can be
several, the official catalog is simply the one seeded by default. Core refuses bytes whose hash
doesn't match what a catalog's version entry declares.

Core offers a version only when it can install it: its `pluginApi` is supported, its `fliks` range
matches the running version (unless the admin ignores the required Fliks version), and it has a
verifiable archive, meaning a non-empty `zipUrl` and a `sha256` of 64 lowercase hex digits that is
not the all-zero placeholder. A plugin with no such version shows **No installable version**.

## The official catalog

The official catalog lives at [github.com/fliks-app/fliks-plugin-catalog](https://github.com/fliks-app/fliks-plugin-catalog).
It is the one place archives get the `official` trust level, because its key is Fliks's official
release key (`release-2026`, the key core has compiled in). Releasing a `process` plugin through it
takes four steps:

1. **Release the plugin from its own repository.** Pushing a tag `v<version>`, equal to the crate
   version, runs the repository's CI. `fk-plugin-notify` and `fk-plugin-download` both run the full
   test suite and `cargo xtask package`, then create a release carrying one asset, the unsigned
   `<id>-<version>.fkplugin` that `package` built and verified.
2. **Open a PR on the catalog with two new files, both reviewed.**
   `plugins/<id>/src/plugin.json` is the manifest inside that archive, with the `files` hashes that
   pin every byte the catalog key will sign. `plugins/<id>/versions/<version>.json` describes the
   version:

   ```json
   {
     "id": "fliks.notify",
     "name": "Notify",
     "description": "Forwards Fliks domain events to an admin-configured HTTPS webhook, with bounded retry.",
     "author": "Fliks",
     "kind": "process",
     "version": "1.0.0",
     "pluginApi": 2,
     "fliks": ">=5.0.0 <6.0.0",
     "zipUrl": "https://github.com/fliks-app/fk-plugin-notify/releases/download/v1.0.0/fliks.notify-1.0.0.fkplugin",
     "sha256": "0000000000000000000000000000000000000000000000000000000000000000"
   }
   ```

   Never edit a version file that already exists: a published version's metadata is immutable, so
   anything that changes ships as a new version. `name`, `description`, `author` and `kind` must be
   identical across every version of the same id. `id`, `version`, `kind`, `pluginApi` and `fliks`
   must equal the manifest's. `fliks` carries a mandatory upper bound, and `pluginApi` must have a
   row in the catalog's `COMPATIBILITY.md`. For a `process` plugin of `pluginApi` 2 the `zipUrl` must
   be an asset of a `fliks-app` repository's `v<version>` release, named `<id>-<version>.fkplugin`.
   The `sha256` stays zeroed, which keeps the version out of the published catalog until step 4.
3. **CI checks the PR, cheaply.** The catalog's `validate-pr.yml` runs its script tests, a PR-shape
   check (no existing version file modified or deleted), the schema, the `COMPATIBILITY.md` row, the
   `fliks` upper bound, and that rebuilding `catalog.json` twice gives identical bytes. None of
   these downloads your archive, so check it yourself first with
   [`cargo xtask verify`](/plugins/testing-and-debugging#verifying-your-archive).
4. **A maintainer merges, then runs `Package plugin`** with the plugin id and version. It downloads
   the archive from the release and refuses it unless it is a store-only zip of `plugin.json`,
   `plugin.wasm` and a logo whose `plugin.json` is byte-identical to the committed one. It checks
   the manifest, `files` and logo as the host does at install, signs with the catalog key, replaces
   the asset on the same release with the signed archive and records its sha256 in the version
   file. The catalog's `publish.yml` then regenerates `catalog.json`, signs it, verifies the
   signature and republishes it on GitHub Pages.

A `data` plugin owned by the org keeps its source in `plugins/<id>/src/` of the catalog repository,
and the same workflow builds, signs and commits its archive there.

The signed archive is what installs as `official`; the sha256 and the signature remain the install
gate. Auto-update only ever takes `official` versions, so this path is also the only one that
reaches installed servers without an admin.

## Hosting your own catalog

A catalog is just a document shape and a signature, both of which core already knows how to read:

1. Serve `catalog.json` over HTTPS: `{ "plugins": [ { id, name, description, author, kind, logo?,
   versions: [ { version, pluginApi, fliks, zipUrl, sha256 } ] } ], "denyList"?: [...] }`.
   `zipUrl` must be `https://`, and `sha256` the lowercase hex sha256 of the exact archive bytes.
2. Sign it: Ed25519, over the document's exact raw bytes (no reformatting after signing), the
   signature published as base64 text at `<your-catalog-url>.sig`. This is **mandatory**: core
   refuses a catalog whose signature is missing or doesn't verify (the source shows a
   `bad-signature` refresh error), and the URL must be `https://`. The catalog repository's
   `scripts/sign-catalog.mjs` is a working example; it reads the private key from an environment
   variable as base64 PKCS#8 DER.
3. In Fliks, **Settings > Advanced > Plugins > ⋮ > Manage sources**, add the catalog's URL together
   with the base64 of your Ed25519 **public** key (the raw 32 bytes, the same one-line format as the
   catalog repository's `keys/*.pub` files) as the source's pinned key. Without a pinned key, core
   verifies the catalog against its own official keys only, so a self-signed catalog would be
   refused.

> [!IMPORTANT]
> Pinning your own key on a source only verifies **that catalog document itself**. It does not make
> the plugin archives it lists `official`: that trust level is reserved for a signature that
> verifies against Fliks's own compiled-in release key. An archive from your own catalog, however
> you sign it, installs as `unverified` or `unsigned`, always behind the consent step, and is never
> picked up by automatic updates. A `process` plugin from such a catalog installs only on a server
> whose admin turned on **Allow unsigned plugins**. The same holds for revocation: a `denyList` in
> your catalog can't revoke any installed package (see below).

The catalog URL and the first archive URL are the admin's own choice and take no address guard, so
a self-hosted catalog on a private network works. A redirect on the archive download is followed
only from https to https, at most 5 hops, so GitHub release assets install; a hop to the archive
URL's own host is trusted like the first, and a hop to any other host goes through core's outbound
guard. The sha256 in the signed catalog stays the gate: a redirect cannot change what installs.

## Compatibility

Two independent axes, checked at three separate points (when a catalog is filtered, when an
archive is inspected on install, and again whenever the plugin is registered):

| Axis | What it means | Enforced how |
|---|---|---|
| `pluginApi` | The contract revision your plugin is written against. | An exact match against one of core's `SUPPORTED_PLUGIN_API_VERSIONS`, never bypassable by any admin setting. |
| `fliks` | The core versions your plugin has been checked against. | A semver range match against the running core version (prerelease stripped). Bypassable with the admin setting **Ignore the required Fliks version**, since unlike `pluginApi` this one is a judgment call about actual runtime behaviour, not a hard protocol difference. |

`pluginApi`'s own surface is **additive only** within one value: a bump adds functions or fields, it
never changes an existing one's shape or meaning. Core accepts every value listed in
`SUPPORTED_PLUGIN_API_VERSIONS`, so a bump can add the new value while still accepting the old one;
only once a release drops the old value does a plugin still declaring it stop installing. Today
`SUPPORTED_PLUGIN_API_VERSIONS` is `[2]`, and the catalog's `COMPATIBILITY.md` maps `2` to core
`>=5.0.0 <6.0.0`; `0` and `1` are retired rows. A plugin declaring a value core doesn't accept is
installed but `failed` with `incompatible-api`, and recovers when an auto-update installs a version
that declares `2`.

## Updates

Covered in full in [Architecture](/plugins/architecture#updates): a daily refresh, an
auto-update pass right after it that only ever takes `official`-signed versions, and a manual
update that's just an inspect-then-confirm of any other version. A plugin disabled before an
upgrade stays disabled after it; a downgrade is allowed and only produces a log warning, not a
refusal.

## Revocation

A catalog document may carry a `denyList`: entries of `{ pluginId, version?, sha256?, reason }`.
Omitting `version` denies every version of that plugin id; adding `sha256` narrows an entry to one
exact build rather than every archive ever published under that version string. A malformed entry
is dropped rather than failing the whole, already signature-verified, refresh.

**Revocation authority is signing authority.** An entry only revokes a package whose
`verifiedByKeyId` equals the key that verified the deny-list's own catalog document. Core records a
`verifiedByKeyId` only for an archive that verifies against one of its compiled-in official keys,
so in practice only a catalog signed by the official key can revoke anything: a source pinned to
its own key can publish a `denyList`, but no installed package is ever tied to that key, so it
matches nothing. An unsigned or `unverified` package is revocable by nobody, because nobody core
knows vouched for it in the first place.

A denied version cannot be installed (`PLUGIN_DENIED`, 403, carrying the publisher's `reason`), and
cannot register at boot or on hot-reload either, with its own `revoked` failure reason. Like an
untrusted package, a revoked one is **not** treated as "installed but not running": its routes are
torn down entirely rather than answering `503`, a revocation withdraws the authority to run at all,
it isn't reporting an outage.

Latency: a catalog refresh that lands a new entry stops every matching installed plugin and marks
it `failed` with the publisher's reason right there, the daily cycle or an immediate manual
refresh, never waiting for a reboot.

## Key rotation

For your own catalog's signing key:

1. Generate a new Ed25519 keypair somewhere with access to your CI secrets, or a throwaway CI job.
2. Keep the new **public** key next to every previous one you've ever used, never replacing a file,
   so anything a retired key signed stays verifiable.
3. Put the new **private** key into whatever secret store your signing workflow reads from.
4. Re-sign the catalog with the new key, and update the pinned key on each server's source: changing
   a source's key clears its cached catalog, and the next refresh verifies against the new key.
5. If a key is ever compromised, publish that fact out of band (a release note, a pinned issue);
   there's no `denyList`-style mechanism for revoking a *key* itself, only for revoking specific
   packages a key signed.

The official release key is compiled into core and never removed: a signature made with a retired
key keeps verifying for as long as the archive it signed might still be installed anywhere.
