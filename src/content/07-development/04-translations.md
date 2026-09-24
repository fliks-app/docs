---
title: Translations
description: How the UI's i18n works, where the translation files live, and how to add a key or a new language.
---

## How it works

The client uses [ngx-translate](https://github.com/ngx-translate/core).
`TranslateService` and the `TranslatePipe` are configured once in
`client/src/app/app.config.ts` via `provideTranslateService`.

Translation files are plain JSON, one per language, under
`client/public/i18n/<code>.json`. They are loaded at runtime through a
small custom loader (`client/src/app/utils/translate-loader.ts`) rather
than the standard HTTP loader, for two reasons: it fetches through
`HttpBackend` directly so translation requests never go through the app's
own HTTP interceptors, and it resolves the path relative to the app's own
base href (`i18n/<lang>.json`, no leading slash) so it also works from the
`file://` bundle the Tizen and webOS builds ship. A missing or failed fetch
degrades to an empty object instead of erroring, so the app falls back to
the fallback language rather than showing a blank screen.

Each file is a tree of namespaces (one object per feature area, e.g.
`display_settings`), with flat, `snake_case` leaf keys inside each one.

## Shipped languages

| Code | Language |
|---|---|
| `en` | English (the fallback language) |
| `fr` | Français |
| `es` | Español |
| `de` | Deutsch |
| `it` | Italiano |
| `pt` | Português |

The same six languages have their
[Angular CLDR locale data](https://angular.dev/guide/i18n) registered at
bootstrap, so `DatePipe`, `DecimalPipe` and `CurrencyPipe` format correctly
in each of them, not just the translated strings.

## Adding a key

1. Add the key to `client/public/i18n/en.json`, English is the source of
   truth and the fallback language, under the namespace that matches the
   feature it belongs to.
2. Reference it with the pipe, never a hardcoded string:

   ```html
   <span>{{ 'display_settings.language' | translate }}</span>
   ```

   or, in a component, `this.translate.instant('display_settings.language')`
   (for example when building a toast message). This is enforced project
   convention, not just a style preference.
3. Add the same key to the other five language files. A key missing from a
   non-English file resolves through `fallbackLang` (English) instead of
   showing the raw key, so a translation gap degrades gracefully but
   silently: nothing in CI currently checks that a key added to `en.json`
   was added everywhere else too.

## Adding a language

1. Add a `<code>.json` file under `client/public/i18n/`.
2. Add the language to `SUPPORTED_LOCALES` in
   `client/src/app/core/constants/app-locale.ts`, with its ISO 639-1 code
   and its own native label.
3. Register its Angular CLDR locale data in `app.config.ts`: import
   `@angular/common/locales/<code>` and add it to the `registerLocaleData`
   calls next to the existing six.
4. Rebuild. The language picker under **Settings > Display** reads
   `SUPPORTED_LOCALES` directly, so the new language appears there without
   any other change.

## Auto-detect and override

`resolveInitialLocale()` (`core/constants/app-locale.ts`) picks the
starting language synchronously at bootstrap, in this order:

1. An explicit user override, stored under the `display.settings` key in
   `localStorage`.
2. The first of `navigator.languages` that matches a supported code. This
   also works inside Capacitor and the Smart TV WebViews, which surface the
   OS language the same way a browser does.
3. English, if nothing else matched.

Changing the language from **Settings > Display** calls
`TranslateService.use()` immediately, so the UI text switches live with no
reload. Angular's own `LOCALE_ID` (date and number formatting) is resolved
once at bootstrap, so a language change takes full effect for those on the
next app launch.

## Plugin translations

A plugin can ship its own flat `i18n[lang]` key map. `PluginI18nService`
merges it into the same ngx-translate store the core app uses, and the
core app's own keys always win a collision, so a plugin can add new keys
but never override an existing one.
