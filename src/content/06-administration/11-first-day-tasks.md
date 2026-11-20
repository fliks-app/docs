---
title: First-day admin tasks
description: Click-by-click walkthroughs for the jobs you do right after installing: add a user, make a role, enable subtitles, set up notifications, install a plugin, run a task and take a backup.
---

Every walkthrough starts in the administration area: open the user menu, choose
**Administration**, then pick the entry named in the first slide. The yellow outline marks what to
click. The sidebar scrolls; the entry you need can be below the fold.

## Create a user and give access to a library

A new account needs a username and a password. Its **role** decides what it may do, and the
library checklist decides what it may see. The default role, **User**, can browse, watch and
make requests.

:::steps
![Open **Settings > Users** in the administration sidebar](/img/admin-users-1-sidebar.webp)
![Click **Add a user**](/img/admin-users-2-add.webp)
![Fill in the username, email, password and role, then tick each library the person may see. Click **Save**](/img/admin-users-3-form.webp)
![The new account shows up in the list with its role and an **Active** switch](/img/admin-users-4-list.webp)
![Click the username to open its page: library access, super-admin, forced password change and request quotas live there](/img/admin-users-5-edit.webp)
:::

Tell the person the server address and their username. They sign in from any
[client](/clients/overview). See [Users and permissions](/administration/users-and-permissions)
for every switch on the user page.

## Create a role

Use a custom role when **User** gives too much or too little: a "Family" role that can watch but
not create watch parties, or a moderator that can approve requests.

:::steps
![On **Settings > Roles**, click **New role**](/img/admin-roles-1-new.webp)
![Name the role and tick its permissions, then click **Save**](/img/admin-roles-2-form.webp)
![The role appears in the list, and you can pick it when you create or edit a user](/img/admin-roles-3-list.webp)
:::

A role that should open the administration area needs **Settings access**. The full permission
list is in [Users and permissions](/administration/users-and-permissions#roles-and-permissions).

## Enable a subtitle provider

Automatic subtitle search does nothing until at least one provider is enabled. Most providers
need an account with that service; the form asks for it.

:::steps
![Open **Subtitles > Subtitle providers** in the sidebar](/img/admin-subprov-1-sidebar.webp)
![Under **Download providers**, click **Add provider**. The button above it adds a translation engine instead](/img/admin-subprov-2-add.webp)
![Pick the provider type, enter the credentials it asks for, use **Test** to check them, then **Save**](/img/admin-subprov-3-form.webp)
:::

The providers and what each one needs are listed in [Subtitles](/features/subtitles#providers).

## Set up notifications

Notifications push events (a request approved, a subtitle failing, a library cleanup) to a chat
service. Fliks supports Discord, Slack, ntfy, Gotify and a generic webhook.

:::steps
![Open **Integrations > Notifications**](/img/admin-notif-1-sidebar.webp)
![Click **New connection**](/img/admin-notif-2-new.webp)
![Name it, choose the service type, paste the webhook URL (or the service's own fields), untick the events you don't want, and **Save**](/img/admin-notif-3-form.webp)
:::

## Install a plugin from the catalogue

The catalogue loads without any account. Installing always shows a consent step first, listing
what the plugin is allowed to do.

:::steps
![Open **Advanced > Plugins**](/img/admin-plugin-1-sidebar.webp)
![Click **Search for a plugin**](/img/admin-plugin-2-search.webp)
![Each card shows its state: **Install**, **Update available** or installed](/img/admin-plugin-3-catalogue.webp)
![Click **Install**: read what the plugin asks for and its trust badge, then confirm with **Install** or back out with **Cancel**](/img/admin-plugin-4-consent.webp)
:::

Trust badges, signed archives and the plugin settings are covered in [Plugins](/administration/plugins).

## Run a scheduled task

Fliks runs its housekeeping on a timer. To run a job now, for example after changing a
setting that it uses:

:::steps
![Open **Advanced > Scheduled tasks**](/img/admin-task-1-sidebar.webp)
![Click the play button at the end of the task's row](/img/admin-task-2-run.webp)
![The status turns to **Running**, then the **Last run** column fills in](/img/admin-task-3-done.webp)
:::

The scan, sprite and metadata jobs you may want to start by hand are on
**System > Status > Trigger a task**, see [Nothing shows up after I add a library](/administration/faq#nothing-shows-up-after-i-add-a-library-is-it-broken).

> [!NOTE]
> **Refresh plugin sources** also applies the automatic plugin updates (on by default, see
> [Plugin settings](/administration/plugins#plugin-settings)). Expect your installed plugins to
> move to the newest version when you run it.

## Make a backup

:::steps
![Open **System** and select the **Backups** tab, then click **Create a backup**](/img/admin-backup-1-create.webp)
![The dump appears in the list with its size and date. **Download** it to keep a copy off the server](/img/admin-backup-2-done.webp)
:::

A daily backup already runs at 2 AM. What a backup contains, and how to restore one, is in
[Backups](/administration/backups).
