---
title: Contributing
description: The branch and PR workflow, the commit message rules CI enforces, how a merge reaches the changelog, and the project's code style.
---

## Workflow

- `main` is protected: direct pushes are rejected. Branch off `main`, push
  the branch, open a pull request, and merge it through GitHub.
- The repository ships no local commit hooks (no `.husky/` directory), so
  nothing checks a message before the CI run below. If you add a hook of
  your own, don't bypass it with `--no-verify`.
- If a branch's history has commits that fail the commit lint (it runs on
  every commit in the PR, not just the merge), a clean squash-merge with a
  conventional title is simpler than rewriting and force-pushing.

## Commit messages

Every push and pull request against `main` runs
[`wagoid/commitlint-github-action`](https://github.com/wagoid/commitlint-github-action)
with `@commitlint/config-conventional` defaults
(`.github/workflows/commit-lint.yml`; the repository has no commitlint
config file, so the action falls back to that preset). A failing check
blocks the merge.

- **Header**: `type(scope): subject`. Type and scope lowercase, scope
  optional but encouraged.
- **Allowed types**: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`,
  `test`, `perf`, `build`, `ci`, `revert`.
- **Subject**: lowercase first word, no trailing period. Proper nouns and
  acronyms are fine inside the subject (`fix(player): patch HEVC remux`).
- **Header length**: 72 characters or less where possible, 100 is the hard
  limit.
- **Body**: a blank line after the header, then the *why*, not the *what*.
  Wrap lines at 100 characters.
- **Footer**: a blank line before it, used for issue references
  (`Refs: #123`) or a `BREAKING CHANGE:` note.

Examples that pass:

```
feat(media-detail): add show-more toggle on the mobile synopsis
fix(spatial-nav): trap focus inside open dropdowns and selects
chore(app-settings): redirect /app-settings to /display
```

Examples that fail:

```
Update foo                          # no type
fix: Removed unused import.         # starts upper-case, ends with a period
```

The same workflow runs a second check
(`.github/scripts/check-commit-parse.mjs`) against
`@conventional-commits/parser`, the exact parser release-please uses. It
exists because that parser is stricter about the commit body than
commitlint is: a body with unbalanced or nested parentheses can parse
cleanly for commitlint yet get silently dropped from the changelog by
release-please. This second check fails loudly on the same PR instead of
letting the commit vanish later.

## Releases

[release-please](https://github.com/googleapis/release-please) watches
`main` (`.github/workflows/release-please.yml`) and keeps a release pull
request up to date from the conventional commits merged since the last
tag. That PR bumps the version in
`.github/.release-please-manifest.json`, in the `backend`, `client` and
`desktop` `package.json` files (and their lockfiles), and in a list of
platform-specific version files (webOS `appinfo.json`, Tizen `config.xml`,
the macOS `Info.plist`, the Android `build.gradle`, `environment.ts`, the
cast receiver's `index.html`, the iOS Xcode project, the tvOS
`project.yml`), and it appends the matching `CHANGELOG.md` entry.

The version bump follows the commit types merged since the last release:

- `fix:` → patch
- `feat:` → minor
- a `BREAKING CHANGE:` footer → major
- everything else (`chore`, `docs`, `test`, ...) doesn't bump the version

Merging the release PR tags `v<version>` and cuts a GitHub release. The
`v*` tag triggers the Docker image publish and the platform publish
workflows (app stores, TV stores, the Windows and macOS server builds);
the desktop client's release workflow is started by hand.

## Code style

- **Comments**: short and rare. A comment says what the code cannot: a
  non-obvious constraint or trade-off, never a restatement of the line
  below it, never the history of a bug that's already fixed. That belongs
  in the commit message.
- **Angular templates**: always an external `templateUrl`, never an inline
  `template`.
- **User-facing strings**: always through `TranslateService`
  (`ngx-translate`), including toast messages, never hardcoded. See
  [Translations](/development/translations) for how the translation files
  are organized.
- **Linting**: the backend's `npm run lint` runs `eslint --fix`, so it
  rewrites files rather than only reporting problems; don't run it just to
  check for errors on code you didn't mean to reformat. The backend also
  has a `npm run format` (Prettier) script.

> [!NOTE]
> No workflow currently runs lint or the test suites automatically on a
> pull request; see [Dev environment](/development/dev-environment#tests)
> for running them locally before you push.

What CI does run on a pull request:

- the two commit message checks above (`commit-lint.yml`);
- `db-migrations.yml`, when `backend/` changes: applies every migration to
  a fresh PostgreSQL and fails if the entities need a migration nobody
  committed;
- `native-build.yml`, when `client/` changes: compiles the Android and iOS
  shells, unsigned;
- `windows-installer.yml`, when `windows/` changes: builds the Windows
  server bundle.

## Where to ask

There is no separate contributor chat documented in the repository. Open
an issue or a draft pull request on the project's GitHub repository to
discuss a change before investing significant time in it, especially for
anything touching the streaming pipeline, the plugin system, or a native
client.
