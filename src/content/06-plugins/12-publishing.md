---
title: Publishing
description: Submitting to the official catalog, hosting your own, compatibility across core versions, and how updates and revocation reach an installed plugin.
---

## What a catalog is

A **catalog** is a signed HTTPS document (`catalog.json`, plus a detached signature at
`catalog.json.sig`) listing plugins and, for each, the versions available to install: their
`pluginApi`, their `fliks` compatibility range, a download URL and a sha256. A **source** is a URL
an admin has added under **Settings > Plugins > ⋮ > Manage sources**; there can be several, the
official catalog is simply the one seeded by default. Core refuses bytes whose hash doesn't match
what a catalog's version entry declares.

## The official catalog

The official catalog lives at [github.com/fliks-app/fliks-plugin-catalog](https://github.com/fliks-app/fliks-plugin-catalog).
Submitting a third-party plugin to it is a pull request:

1. Fork the repository and add **exactly one new file**, `plugins/<pluginId>/versions/<version>.json`.
   Never edit a version file that already exists, a published version's metadata is immutable; if
   something about it changes, publish a new version instead. The file must carry: `id`, `name`,
   `description`, `author`, `kind` (`data`/`process`, matching your signed manifest's own `kind`),
   `version` (semver, matching the file name), `pluginApi` (a non-negative integer; the current
   value is `1`), `fliks` (a range, with a mandatory
   upper bound, this is enforced here even though core's own install path doesn't enforce it), a
   `zipUrl` (`https://`, wherever you host your own built, signed archive, a GitHub release in your
   own plugin's repository works fine) and its `sha256`. An optional `logo` URL is display-only.
2. Open the PR. `.github/workflows/validate-pr.yml` runs, in order: the catalog scripts' own tests;
   a PR-shape check (no existing `versions/*.json` or `dist/` file modified or deleted); the file's
   shape against `schema/plugin.schema.v0.json` (also: `id` equals its directory name, `version`
   equals the file name, and `name`/`description`/`author`/`kind`/`logo` are identical across every
   version of the id); that your `pluginApi` has a row in `COMPATIBILITY.md`; that your `fliks` range
   has an upper bound; and that rebuilding `catalog.json` twice gives identical bytes. None of these
   downloads your archive: nothing in CI checks the `zipUrl`, the `sha256` or the archive itself
   today, so get them right before you submit (see
   [Testing and debugging](/plugins/testing-and-debugging#verifying-your-archive-against-the-real-core-inspector)).
3. A maintainer reviews and merges. Merging **is** the release: `.github/workflows/publish.yml`
   regenerates `catalog.json` from every `versions/*.json` file, signs it with the catalog's key
   (refusing to publish unsigned), verifies that signature, and republishes it on GitHub Pages.
   There's no separate release step.

Your own archive, hosted at the `zipUrl` you gave, is signed with **your own** key (or unsigned).
For a submitted plugin, only the catalog's *document* is signed with the catalog's key, that's what
lets an admin trust the list itself; it says nothing about the individual plugin archives it points
at. (The catalog's key is also Fliks's official release key, `release-2026` in `keys/`. The Fliks
team's own plugins are built from `plugins/<id>/src/` and signed with it by
`.github/workflows/package-plugin.yml`, which is why they install as `official`. That workflow is
run by maintainers for those plugins only.) An install from
this path shows as `unverified` (if your archive carries a signature core doesn't recognise) or
`unsigned` (if it carries none), exactly like any third-party plugin, see the trust table in
[Architecture](/plugins/architecture#trust-at-a-glance).

## Hosting your own catalog

There's no separate tooling required, a catalog is just a document shape and a signature, both of
which core already knows how to read:

1. Serve `catalog.json` over HTTPS: `{ "plugins": [ { id, name, description, author, kind, logo?,
   versions: [ { version, pluginApi, fliks, zipUrl, sha256 } ] } ], "denyList"?: [...] }`.
2. Sign it: Ed25519, over the document's exact raw bytes (no reformatting after signing), the
   signature published as base64 text at `<your-catalog-url>.sig`. This is **mandatory**: core
   refuses a catalog whose signature is missing or doesn't verify (the source shows a
   `bad-signature` refresh error), and the URL must be `https://`. The catalog repository's
   `scripts/sign-catalog.mjs` is a working example; it reads the private key from an environment
   variable as base64 PKCS#8 DER.
3. In Fliks, **Settings > Plugins > ⋮ > Manage sources**, add the catalog's URL together with the
   base64 of your Ed25519 **public** key (the raw 32 bytes, the same one-line format as the catalog
   repository's `keys/*.pub` files) as the source's pinned key. Without a pinned key, core verifies
   the catalog against its own official keys only, so a self-signed catalog would be refused.

> [!IMPORTANT]
> Pinning your own key on a source only verifies **that catalog document itself**. It does not make
> the plugin archives it lists `official`, that trust level is reserved for a signature that
> verifies against Fliks's own compiled-in release key. An archive from your own catalog, however
> you sign it, installs as `unverified` (with a syntactically valid signature from your key) or
> `unsigned` (with none), always behind the consent step, and is never picked up by automatic
> updates, which only ever take `official`-signed versions. The same holds for revocation: a
> `denyList` in your catalog can't revoke any installed package (see below).

Third-party sources are allowed to point at private/LAN hosts (unlike a webhook target, which is
explicitly checked against internal addresses), a self-hosted catalog on your own network works.

## Compatibility

Two independent axes, checked at three separate points (when a catalog is filtered, when an
archive is inspected on install, and again on every process handshake):

| Axis | What it means | Enforced how |
|---|---|---|
| `pluginApi` | The contract revision your plugin is written against. | An exact match against one of core's `SUPPORTED_PLUGIN_API_VERSIONS`, never bypassable by any admin setting. |
| `fliks` | The core versions your plugin has been checked against. | A semver range match against the running core version (prerelease stripped). Bypassable with the admin setting **Ignore the required Fliks version**, since unlike `pluginApi` this one is a judgment call about actual runtime behaviour, not a hard protocol difference. |

`pluginApi`'s own method surface is **additive only** within one value: a bump adds methods or
scopes, it never changes an existing one's shape or meaning. Core accepts every value listed in
`SUPPORTED_PLUGIN_API_VERSIONS`, so a bump can add the new value while still accepting the old one,
leaving a window in which authors republish; only once a release drops the old value does a plugin
still declaring it stop installing, with `incompatible-api`. That window is a policy, not a
guarantee: core 4.0.0 introduced `pluginApi` `1` and dropped `0` in the same release, so every `0`
plugin had to republish for 4.0.0. Today `SUPPORTED_PLUGIN_API_VERSIONS` is `[1]`, and the catalog's
`COMPATIBILITY.md` maps `1` to core `>=4.0.0 <5.0.0`.

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
`verifiedByKeyId` equals the key that verified the deny-list's own catalogue document. The official
release key revokes anything it signed. Core records a `verifiedByKeyId` only for an archive that
verifies against one of its compiled-in official keys, so in practice only a catalog signed by the
official key can revoke anything: a source pinned to its own key can publish a `denyList`, but no
installed package is ever tied to that key, so it matches nothing. An unsigned or `unverified`
package is revocable by nobody, because nobody core knows vouched for it in the first place.

A denied version cannot be installed (`PLUGIN_DENIED`, 403, carrying the publisher's `reason`), and
cannot register at boot or on hot-reload either, with its own `revoked` failure reason. Like an
untrusted package, a revoked one is **not** treated as "installed but not running", its routes are
torn down entirely rather than answering `503`, a revocation withdraws the authority to run at all,
it isn't reporting an outage.

Latency: a revocation reaches an already-running plugin the moment the catalog that names it
refreshes, the daily cycle or an immediate manual refresh, never waiting for a reboot.

## Key rotation

For your own catalog's signing key, the same drill the official catalog itself uses when rotating:

1. Generate a new Ed25519 keypair (`generateKeyPairSync('ed25519')`) somewhere with access to your
   CI secrets, or a throwaway CI job.
2. Commit the new **public** key permanently alongside every previous one you've ever used, never
   replacing a file.
3. Put the new **private** key into whatever secret store your signing workflow reads from.
4. Re-sign going forward with the new key; every archive and catalog document you already published
   keeps its old signature, which keeps verifying against the retained old public key. A signature
   is bound to the key that made it, not to "whichever key is current."
5. If a key is ever compromised, publish that fact out of band (a release note, a pinned issue);
   there's no `denyList`-style mechanism for revoking a *key* itself, only for revoking specific
   packages a key signed. Deleting the compromised key's public file does **not** revoke it, keep
   it published, revoke the packages it signed instead if that's warranted.
