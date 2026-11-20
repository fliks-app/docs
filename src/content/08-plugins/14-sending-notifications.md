---
title: Sending notifications
description: Notify Fliks users from a plugin with the notify:users scope, the audiences, the notification fields, translations and the rate limit.
---

A plugin can send a notification to users. It reaches each user on every device where they turned
notifications on: a message in the app, the browser, the desktop app and the phone (see
[Notifications](/features/notifications)). Core does the delivery, the encryption and the muting: the
plugin names the audience and the text.

## Requirements

- The manifest scope `notify:users` (see [the manifest](/plugins/manifest#scopes)). An administrator sees it at install, like any scope.
- A manifest `fliks` range that starts at the Fliks release that ships the function. A plugin built before it does not import it and runs unchanged; one that calls it fails to load on an older core.
- Texts in the manifest `i18n` block, with an English entry for every key.

## The call

```rust
use fliks_plugin_sdk::notify::{self, Notification, NotifyAudience};

let note = Notification::new("acme.done.title", "acme.done.body")
    .param("title", "Some Title")
    .media(42);

notify::users(NotifyAudience::Viewers(42), &note)?;
```

The raw WIT function is `notify-users(audience, notification)` in the `notify` interface.

### Audience

| Variant | Who |
|---|---|
| `Users(ids)` | The users with these ids, at most 500. An id that is not an enabled user is dropped |
| `Recipients(media_id)` | The requesters of the media, else the administrators: the audience of `events_emit_own` for a media |
| `Viewers(media_id)` | The viewers of the media |

There is no audience for everybody. `Users` and the media are independent: a media only supplies the
default page and poster, and no library access is checked for the recipients.

### Notification fields

| Field | Meaning |
|---|---|
| `title_key`, `body_key` | Keys of the manifest `i18n`. Required, and each must have an English entry, else `ERR_VALIDATION` |
| `params` | Up to 16 strings of at most 500 characters filling the `{{name}}` slots of the texts |
| `url` | An in-app path the notification opens: one leading `/`, no `\`, no encoded `//`. Anything else is `ERR_VALIDATION` |
| `image` | A path under `/api/images/` |
| `media_id` | Gives the media's page as `url` and its poster as `image` when you set neither. Unknown media is `ERR_NOT_FOUND`. With neither, the notification opens `/` |

The notification has one **Open** action, lives one day, and sits in the category `plugin.<id>`, which
each user can mute from the notification settings; the muted users are skipped.

### Translations

Each device gets the text in its own language. Define the keys in the manifest and use `{{name}}`
for the params:

```json
"i18n": {
  "en": { "acme.done.title": "Import finished", "acme.done.body": "{{title}} is ready" },
  "fr": { "acme.done.title": "Import terminé", "acme.done.body": "{{title}} est prêt" }
}
```

Fliks matches the base language of the device (`en`, `fr`, `de`, `es`, `it`, `pt`) and falls back to
English. The usual [i18n rules](/plugins/manifest#the-i18n-block) apply to the keys.

## Limits and errors

- 10 notifications per hour per plugin, whatever the audience size. The eleventh fails with `ERR_RATE_LIMITED` until the window slides. A call refused for validation, or one whose audience holds nobody who can receive it, is not counted and succeeds.
- The relay limits for phones still apply to the delivery (see [Push notifications](/administration/push-notifications#limits)), with no feedback to the plugin: delivery is best effort, with no retry and no inbox.
- Other errors: `ERR_DENIED` without the scope, `ERR_VALIDATION` for a bad key, `url` or `image`, `ERR_NOT_FOUND` for an unknown media.

Send what matters and group what comes in bursts: a notification per file of a 200 file import is
the way to exhaust the limit and annoy your users.

## See also

- [SDK reference](/plugins/sdk-reference)
- [The manifest](/plugins/manifest)
