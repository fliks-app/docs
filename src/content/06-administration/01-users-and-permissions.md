---
title: Users and permissions
description: Create accounts for the household, control what each one can do, and decide which libraries they can see.
---

> [!SUMMARY]
> Create one account per person in **Settings > Users**, give it a role and the libraries it may see, and that is all a household needs. Roles bundle permissions; library access is set per user, separately from the role. Only the administrator can reach these pages.

## Users

**Settings > Users** lists every account: username, role, an **Active** switch, and last
activity. **Add a user** asks for a username, an optional email, a password, a role, whether
the account is active, and the libraries it may see. If you leave the role alone, the new account
gets the default role.

:::steps
![Open **Settings > Users** in the administration sidebar](/img/admin-users-1-sidebar.webp)
![Click **Add a user**](/img/admin-users-2-add.webp)
![Fill in the username, email, password and role, then tick each library the person may see. Click **Save**](/img/admin-users-3-form.webp)
![The new account shows up in the list with its role and an **Active** switch. Click the username to open its page](/img/admin-users-4-list.webp)
:::

Tell the person the server address and their username. They sign in from any [client](/clients/overview).

:::details Every setting of a user account
Click a username to open that user's page. Its **Edit user** card holds the settings below,
which are independent of the role:

| Setting | What it does |
|---|---|
| Account active | Turning it off blocks login without deleting the account or its history. The switch in the user list is greyed out on your own row so you don't lock yourself out, but the edit card doesn't stop you, so be careful there. |
| Super-admin (full access) | Grants every permission and access to every library, bypassing the role and the library checklist entirely. The administrator created on the setup page is a super-admin. |
| Force password change at next login | The user must set a new password before doing anything else. Useful after creating an account with a temporary password. Changing their password yourself doesn't clear it; they clear it by picking their own. |
| Request quotas | How many movies, series and books the user may request per period (in days). 0 means unlimited. |
| Library access (**Accessible libraries** when creating) | Which libraries this user can see, as a plain checklist. Independent of role: two users with the same role can have completely different library access. The same access can be edited per library, from that library's **Users** tab. |

Leave **New password** empty while editing an existing user to keep their current password.
The same page has a **Sign out everywhere** button (ends every session of that user), a **Delete** button, and **Requests** and **Statistics** tabs for that user.
:::

## Login user list

**Settings > General > Server > Login user list** sets who sees the account list on the login screen: **Everyone** (default), **Local network only** or **Hidden**. Press **Save**.

:::details Who sees the login user list

| Option | Who sees the list |
|---|---|
| Everyone | Anyone who can reach the server. This is the default. |
| Local network only | Only a caller whose address, and every `X-Forwarded-For` hop, is private or loopback. Behind a [reverse proxy](/install/reverse-proxy), the proxy has to set that header; a request that went through a public address is outside. |
| Hidden | Nobody. The login screen goes straight to the username form. |

Only enabled accounts are listed, with their username and avatar. With **Hidden**, or **Local network only** for an outside caller, the login screen goes straight to the username form, and [Quick Connect](/features/pairing-and-remote-control#pairing-a-tv-or-new-device-quick-connect) is unavailable for new devices.
:::

Accounts can also sign in through an OpenID Connect provider: see
[Single sign-on](/administration/single-sign-on).

## Roles and permissions

Every account other than a super-admin gets its permissions from exactly one **role**.
**Settings > Roles** manages them: a role is a name plus a set of permissions, and optionally a
set of default libraries new users with that role inherit when they're created (library access
is still managed per user afterward; the role's list is only a starting point).

A custom role fits when **User** gives too much or too little, for example a "Family" role that can watch but not create watch parties.

:::steps
![On **Settings > Roles**, click **New role**](/img/admin-roles-1-new.webp)
![Name the role and tick its permissions, then click **Save**](/img/admin-roles-2-form.webp)
![The role appears in the list, and you can pick it when you create or edit a user](/img/admin-roles-3-list.webp)
:::

Fliks ships three roles, seeded the first time the server starts with no roles yet:

| Role | Permissions | Notes |
|---|---|---|
| **Admin** | every permission | Give it to anyone who should manage the server without being a super-admin. |
| **User** | `media.read`, `livetv.read`, `requests.create`, `parties.create`, `parties.read_public` | The default role for new users, unless you mark another role as default. |
| **Readonly** | `media.read`, `livetv.read`, `parties.read_public` | Browse and watch only; can't request a title or create a watch party. |

:::details Every permission and what it grants
The available permissions (the label the role editor shows is in brackets):

| Permission | Grants |
|---|---|
| `media.read` (View media) | Browse and play the libraries you have access to. |
| `media.create` (Add media) | Add titles to the library, and follow their download progress. |
| `media.edit` (Edit media) | Edit media metadata. |
| `media.delete` (Delete media) | Delete media. |
| `media.grab` (Download releases) | Manually trigger a download for a release. |
| `livetv.read` (Watch Live TV) | See and watch Live TV. |
| `requests.create` (Create requests) | Request a title that isn't in the library yet, and edit or cancel your own requests while they're pending. |
| `requests.manage` (Manage requests) | Approve, decline, or edit anyone's requests. |
| `parties.create` (Create parties) | Create [watch parties](/features/watch-party) and manage your own. |
| `parties.read_public` (View public parties) | See and join public watch parties. |
| `parties.manage` (Manage parties) | Manage every party, whoever hosts it. Includes the two permissions above. |
| `subtitles.manage` (Manage subtitles) | Add, edit and delete subtitle files on a title. Subtitle providers and translation settings are admin pages, so they need `settings.access`. |
| `books.email` (Mail books to e-readers) | Send a book to an e-reader by mail. Needs [Outgoing mail](/administration/settings#settings) to be set up. |
| `queue.manage` (Manage the download queue and history) | See and act on the download queue and its history. |
| `settings.access` (Settings access) | Open the Administration area at all, and change every setting in it: libraries, profiles, subtitle and translation providers, Live TV, plugins, and so on. |
| `users.manage` (Manage users) | Create, edit, disable and delete user accounts. Picking a user's role also needs `roles.manage`. |
| `roles.manage` (Manage roles) | Create, edit and delete roles, and assign a role to a user. It doesn't grant `users.manage`. |
:::

A plugin can add its own permissions to this list (namespaced to that plugin, so it can never be
confused with a core one or another plugin's). They appear under **Plugin permissions** in the role
editor once the plugin is installed.

:::details Custom roles, plugin permissions and deleting a role
You can create as many custom roles as you like, combining any permissions: a "Family" role with
just `media.read`, `livetv.read` and `requests.create`, a "Moderator" role that adds
`requests.manage` without touching settings, and so on. A role can't be deleted while any user is
still assigned to it; reassign those users first.

`users.manage` and `roles.manage` are only reachable from the Administration area, so a role that
holds them also needs `settings.access`.
:::

## Which model actually applies

Two things are checked independently for every action: your role's permissions, and (for
anything library-scoped, like browsing or playing) whether you have access to that specific
library. A permission without library access to match gets you nowhere; library access without
the permission is the same. A super-admin skips both checks. Everyone, regardless of role, can
always read and update their own account (but not their own role, active status or library
access).

## See also

- [Settings](/administration/settings) for where Users and Roles sit among every other admin
  page.
- [Requests](/downloads/requests) for how `requests.create` and `requests.manage` interact with
  auto-approval rules.
- [Plugins](/administration/plugins) for how an installed plugin's own permissions show up here.
