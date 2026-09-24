---
title: SDK reference
description: Every API a plugin can call or must implement, with exact signatures, derived from the @fliks/plugin-contract source.
---

## The package

`@fliks/plugin-contract` is types and protocol constants only, no runtime code, no wiring. Its
source lives at `backend/src/common/plugin-contract/` in the core Fliks repository, and both core
and the Fliks web client compile these exact files, so there is exactly one declaration of each
type in the whole tree. It is not published to any registry, and doesn't need to be: you only need
these at compile time, and they're erased from anything you ship.

Two ways to get it, both covered with commands in [Your first plugin](/plugins/first-plugin#step-2-get-the-contract-types):
the tarball attached to each core GitHub release, or a `paths` mapping onto a sibling checkout.

| Import specifier | Contents | Dependencies |
|---|---|---|
| `@fliks/plugin-contract` | Everything: manifest, both method tables, principal, protocol, UI. | Re-exports one helper (`fliksRangeVersion`) that needs `semver` as an optional peer dependency. |
| `@fliks/plugin-contract/protocol` | Wire constants and frame types. | None. |
| `@fliks/plugin-contract/ui` | UI contribution types. | None, safe in a browser bundle too. |

```ts
import type { ProcessPluginManifest, PluginApi } from '@fliks/plugin-contract';           // types: free
import { MAX_FRAME_BYTES, PLUGIN_DEADLINES_MS } from '@fliks/plugin-contract/protocol';   // values: leaf only
import type { ConfigPage, UiContribution } from '@fliks/plugin-contract/ui';
```

Take a runtime **value** from the barrel and a bundler cannot drop the `semver` dependency it pulls
in along with it, so a few constants end up dragging a whole semver library into your bundle.
Import values from the leaf module, types from wherever's convenient.

A `process` plugin ships as one bundled `plugin.js`: an archive carries no `node_modules`, so an
unbundled `require` of this package (or of anything else) fails at spawn.

> [!NOTE]
> Both real-world plugins covered in [Examples](/plugins/examples) predate this package and
> hand-restate the parts of its types they use instead of depending on it. The download plugin
> guards its copy with `npm run check-contract-drift` (and a test that runs the same diff when a
> sibling Fliks checkout is present); the notify plugin has no such check. For a new plugin, just depend on the package; restating it yourself
> only makes sense if you have a specific reason to avoid the dependency.

## `PluginApi`: the 7 methods core calls on your plugin

```ts
export interface PluginApi {
  hello: (p: {
    pluginApi: number;
    coreVersion: string;
    config: Record<string, string>;
  }) => Promise<{ manifest: PluginManifest; token: string }>;

  health: () => Promise<{ ok: boolean; detail?: string }>;

  job: (p: { name: string; jobId: string; args?: unknown }) => Promise<{ ok: true }>;

  http: (p: {
    method: string;
    path: string;
    query: Record<string, string>;
    body: unknown;
    principal: Principal;
  }) => Promise<{ status: number; headers: Record<string, string>; body: unknown }>;

  /** Fire-and-forget: no reply. */
  event: (p: Note<{ name: CoreEventName; payload: unknown }>) => void;

  /** Fire-and-forget: no reply. */
  config: (p: Note<{ changed: string[] }>) => void;

  shutdown: () => Promise<{ ok: true }>;
}
```

`hello`'s `token` is the `FLIKS_PLUGIN_TOKEN` value from your environment, echoed back unchanged: it
proves the responder is the process core spawned, and core never sends it to you. Behavioural notes
for each method are in [Process plugins](/plugins/process-plugins#the-7-lifecycle-hooks).

## `PluginHostApi`: the 15 methods you call on core

Grouped exactly as the contract source groups them.

### Group A: read (6)

```ts
export type MediaKind = 'movie' | 'series';

interface PluginHostApi {
  /** Everything needed to decide whether, and how, to acquire one piece of media. */
  'media.acquisitionContext': (p: {
    mediaId: number;
    seasonId?: number;
    episodeId?: number;
  }) => Promise<AcquisitionTarget | null>;

  /** Cursor-paged, limit <= 500. */
  'acquisition.candidates': (p: {
    kind?: MediaKind;
    mediaIds?: number[];
    availableOn: string;
    limit: number;
    cursor?: string;
  }) => Promise<{ items: AcquisitionTarget[]; cursor: string | null }>;

  /** The endpoint that makes an RSS-style sync viable: match a batch of titles in one call. */
  'releases.match': (p: {
    titles: { id: string; title: string; publishDate: string }[];
    minAgeMinutes?: number;
  }) => Promise<{
    id: string;
    mediaId: number | null;
    seasonNumber?: number;
    episodeNumber?: number;
    isFullSeason: boolean;
    decision: 'grab' | 'skip';
    skipReason?: 'on-disk' | 'not-monitored' | 'unmatched' | 'too-fresh' | 'not-available' | 'unprofiled';
  }[]>;

  /** The hot path: rejection rules, custom formats, blocklist and quality/profile scoring, in one call. */
  'releases.score': (p: {
    mediaId: number;
    seasonNumber?: number;
    episodeNumber?: number;
    releases: {
      id: string;
      title: string;
      size: number;
      seeders: number;
      leechers: number;
      publishDate: string;
      flags?: string[];
      freeleech?: boolean;
      downloadVolumeFactor?: number;
      sourceRef: string;
      minSeeders?: number;
      unknownLanguageIsoCode?: string;
      /** Only the plugin can know, it owns the blocklist table. */
      blocked: boolean;
    }[];
  }) => Promise<ScoredRelease[]>;

  /** Queue page labels. Keyed `media:<id>` / `season:<id>` / `episode:<id>`. Bounded: <= 100 ids. */
  'media.resolve': (p: {
    mediaIds?: number[];
    seasonIds?: number[];
    episodeIds?: number[];
  }) => Promise<Record<string, {
    title: string;
    kind: MediaKind;
    libraryId: number;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
  }>>;

  /** Orphan reconcile. */
  'media.exists': (p: { mediaIds: number[] }) => Promise<number[]>;
}
```

### Group B: write acquisition state (1)

```ts
'requests.markInProgress': (p: {
  idempotencyKey: string;
  mediaId: number;
  seasonNumber?: number;
}) => Promise<void>;
```

### Group C: ingest (1)

```ts
/** The one method that writes to disk. Core resolves the destination and enforces
 *  the ingestRoots allowlist and idempotency; the plugin only names what to move. */
'library.ingest': (p: {
  idempotencyKey: string;
  mediaId: number;
  paths: string[];
  transfer: 'copy' | 'move';
  fallbackQuality?: string;
  sourceLabel: string;
}) => Promise<{
  imported: { mediaFileId: number; relativePath: string; quality: string }[];
  /** Source paths whose destination was already taken; a retried ingest lands here. */
  alreadyPresent: string[];
  seasonNumber?: number;
  episodeNumber?: number;
}>;
```

### Group D: events and outbound (5)

```ts
export type AcquisitionEvent =
  | { type: 'acquisition.grabbed'; mediaId: number; seasonNumber?: number; episodeNumber?: number }
  | { type: 'acquisition.imported'; mediaId: number; seasonNumber?: number; episodeNumber?: number; quality: string; sourceTitle: string }
  | { type: 'acquisition.failed'; mediaId: number; title: string; reason: string }
  | { type: 'acquisition.queue.changed' }
  | { type: 'acquisition.stalled.removed'; mediaId: number | null; title: string };

interface PluginHostApi {
  /** Batched. Core resolves the SSE audience per event. */
  'events.publish': (p: AcquisitionEvent[]) => Promise<void>;

  /** Closed vocabulary, not a free string. Today: `'grab.started'`. */
  'notifications.dispatch': (p: { event: 'grab.started'; payload: Record<string, unknown> }) => Promise<void>;

  /** The sidebar badge, pushed not polled. Stored per plugin, so two plugins pushing one key add up. */
  'counts.set': (p: { key: string; value: number }) => Promise<void>;

  /** Plugin-namespaced SSE. Core force-prefixes the type to `plugin.<id>.<type>`. */
  'events.emitOwn': (p: {
    type: string;
    payload: unknown;
    audience: 'all' | { mediaId: number } | { userId: number };
  }) => Promise<void>;

  /**
   * Live acquisition progress, as the *complete* set for one media, coalesced to one
   * emission per media per second. `downloads` is a replacement, never a delta: whatever
   * is absent from it is retired, and an empty array retires the media outright.
   */
  'progress.set': (p: {
    mediaId: number;
    downloads: {
      ref: string;
      seasonNumber?: number;
      episodeNumber?: number;
      progress: number; // 0 to 1
      bytesPerSecond?: number;
      etaSeconds?: number;
      state: 'queued' | 'active' | 'stalled' | 'paused' | 'importing';
    }[];
  }) => Promise<void>;
}
```

### Group E: config (2)

```ts
interface PluginHostApi {
  /** `plugin.<id>.*` keys only. */
  'config.get': (p: { keys?: string[] }) => Promise<Record<string, string>>;

  /** Prefix applied server-side. Never a raw settings write. */
  'config.set': (p: { key: string; value: string | null }) => Promise<void>;
}
```

### Which scope each method needs

A **scope** is a permission your manifest requests and the admin consents to at install.
`HOST_METHOD_SCOPES` (in `principal.ts`) lists the scopes each host method requires; a call needs
**all** of them.

| Method | Required scopes |
|---|---|
| `media.acquisitionContext`, `media.resolve`, `media.exists` | `media:read` |
| `acquisition.candidates`, `releases.match` | `acquisition:candidates` and `media:read` |
| `releases.score` | `releases:score` |
| `requests.markInProgress` | `requests:progress` |
| `library.ingest` | `ingest:write` |
| `events.publish`, `notifications.dispatch`, `counts.set`, `events.emitOwn`, `progress.set` | `events:emit` |
| `config.get`, `config.set` | `config:rw` |

## Supporting types

```ts
export interface AcquisitionTarget {
  mediaId: number;
  kind: MediaKind;
  title: string;
  originalTitle: string | null;
  alternativeTitles: string[];
  year: number | null;
  runtimeMinutes: number | null;
  imdbId: string | null;
  tmdbId: number | null;
  tvdbId: number | null;
  libraryId: number;
  /** `null` means unprofiled: nothing can be scored without a profile. */
  want: {
    decision: 'missing' | 'upgrade' | 'skip';
    allowedQualityIds: number[];
    allowedLanguageIds: number[];
    minResolution: number;
    resolutionUpgradeOnly: boolean;
  } | null;
  expectedTitles: string[];
  searchTitle: string;
  season?: { id: number; number: number; episodeCount: number };
  episode?: {
    id: number;
    number: number;
    endNumber: number | null;
    airDate: string | null;
    title: string | null;
  };
}

export interface ScoredRelease {
  id: string;
  qualityId: number;
  qualityName: string;
  rank: number;
  allowed: boolean;
  customFormatScore: number;
  blocklisted: boolean;
  languageId: number | null;
  languageName: string | null;
  languageAllowed: boolean;
  isFullSeason: boolean;
  sizeDeviation: number | null;
  videoCodec: string | null;
  rejections: { code: string; params?: Record<string, number | string> }[];
}

/** Who an `http` callback acts for: `delegated` is a proxied request from a signed-in user,
 *  re-checked by core against that user on every host call; `system` is a background job,
 *  limited to the scopes consented at install. */
export type Principal = { kind: 'delegated'; userId: number } | { kind: 'system' };

export type PluginScope =
  | 'media:read' | 'acquisition:candidates' | 'releases:score' | 'requests:progress'
  | 'ingest:write' | 'events:emit' | 'config:rw';
```

## Protocol constants

```ts
export interface Req { i: number; m: string; p?: unknown; }
export interface Res { i: number; r?: unknown; e?: { c: string; m: string }; }
export type Note<P = unknown> = { m: string; p?: P };

export const MAX_FRAME_BYTES = 4 * 1024 * 1024;
export const PLUGIN_API_VERSION = 1;
export const SUPPORTED_PLUGIN_API_VERSIONS: readonly number[] = [1];
export const PLUGIN_DEFAULT_MEMORY_MB = 256;
export const PLUGIN_LOG_CAP_BYTES_PER_MINUTE = 64 * 1024;

export const PLUGIN_DEADLINES_MS = {
  handshake: 10_000,
  healthInterval: 15_000,
  healthReply: 3_000,
  hostCall: 8_000,
  pluginCall: 180_000,
  job: 60 * 60_000,
  shutdownRpc: 3_000,
  sigtermGrace: 2_000,
} as const;

export const HOST_CALL_DEADLINE_OVERRIDES_MS: Readonly<Record<string, number>> = {
  'library.ingest': 30 * 60_000,
};
```

`PluginSpawnEnv` (the shape behind the environment variable table in
[Process plugins](/plugins/process-plugins#environment)):

```ts
export interface PluginSpawnEnv {
  FLIKS_PLUGIN_TOKEN: string;
  FLIKS_CORE_SOCK: string;
  FLIKS_PLUGIN_SOCK: string;
  FLIKS_DB_URL: string;
  FLIKS_PLUGIN_ID: string;
  FLIKS_API_VERSION: string;
  HOME: string;
  PATH: string;
  NODE_ENV: string;
  TZ: string;
}
```

`FLIKS_API_VERSION` is the `pluginApi` your own manifest declares, as a string; core answers every
plugin in the version its manifest declares. `FLIKS_DB_URL` is `''` when your manifest declares no
schema. On top of these, every `plugin.<id>.<key>` setting arrives as an env var named `FLIKS_CFG_`
plus the key upper-cased, with every character outside `[A-Z0-9_]` replaced by `_`. Those are a
snapshot taken at spawn.

## `fliksRangeVersion`

```ts
function fliksRangeVersion(version: string): string;
```

Strips a semver prerelease tag before matching a manifest's `fliks` range: `3.0.0-rc.1` is checked
as `3.0.0`, so a release candidate core can already run the plugins declared for the release it's
about to become. Needs the `semver` package; that's why it lives in the barrel rather than the
protocol leaf.

## Manifest and UI contribution types

The full `PluginManifest` discriminated union (`DataPluginManifest | ProcessPluginManifest`) is
covered field by field in [the manifest reference](/plugins/manifest); the full UI contribution and
config page type surface (`UiContribution`, `ConfigPage` and its three kinds, `FieldDef`,
`TableColumn`, and the rest) is covered field by field in [UI extensions](/plugins/ui-extensions).
Both are re-exported from the same `@fliks/plugin-contract` barrel described on this page.
