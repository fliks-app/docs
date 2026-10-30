---
title: Users and permissions
description: Create accounts for the household, control what each one can do, and decide which libraries they can see.
---

## Users

**Settings > Users** lists every account: username, role, an **Active** switch, and last
activity. **Add a user** asks for a username, an optional email, a password, a role, and whether
the account is active. If you leave the role alone, the new account gets the default role.

![The Users list, with the signed-in admin account tagged as you](/img/users-list.webp)

Click a username to open that user's page. Its **Edit user** card holds the settings below,
which are independent of the role:

| Setting | What it does |
|---|---|
| Account active | Turning it off blocks login without deleting the account or its history. The switch in the user list is greyed out on your own row so you don't lock yourself out, but the edit card doesn't stop you, so be careful there. |
| Super-admin (full access) | Grants every permission and access to every library, bypassing the role and the library checklist entirely. The administrator created on the setup page is a super-admin. |
| Force password change at next login | The user must set a new password before doing anything else. Useful after creating an account with a temporary password. Changing their password yourself doesn't clear it; they clear it by picking their own. |
| Accessible libraries | Which libraries this user can see, as a plain checklist. Independent of role: two users with the same role can have completely different library access. The same access can be edited per library, from that library's **Users** tab. |

Leave **New password** empty while editing an existing user to keep their current password.
The same page has a **Delete** button and **Requests** and **Stats** tabs for that user.

## Login user list

The login screen lists the accounts so people can pick theirs instead of typing a username.
**Settings > General > Server > Login user list** sets who sees that list, and **Save** applies it:

| Option | Who sees the list |
|---|---|
| Everyone | Anyone who can reach the server. This is the default. |
| Local network only | Only a caller whose address, and every `X-Forwarded-For` hop, is private or loopback. Behind a [reverse proxy](/install/reverse-proxy), the proxy has to set that header; a request that went through a public address is outside. |
| Hidden | Nobody. The login screen goes straight to the username form. |

Only enabled accounts are listed, and only with their username and avatar. With **Hidden**, or
**Local network only** for a caller outside the network, the list is empty, and the login screen
goes straight to the username form. That form has no Quick Connect button: Quick Connect starts
from the account list, so a new device can't use it. Accounts already signed in on a device still
show in that device's list.

## Roles and permissions

Every account other than a super-admin gets its permissions from exactly one **role**.
**Settings > Roles** manages them: a role is a name plus a set of permissions, and optionally a
set of default libraries new users with that role inherit when they're created (library access
is still managed per user afterward; the role's list is only a starting point).

Fliks ships three roles, seeded the first time the server starts with no roles yet:

| Role | Permissions | Notes |
|---|---|---|
| **Admin** | every permission | Give it to anyone who should manage the server without being a super-admin. |
| **User** | `media.read`, `livetv.read`, `requests.create`, `parties.create`, `parties.read_public` | The default role for new users, unless you mark another role as default. |
| **Readonly** | `media.read`, `livetv.read`, `parties.read_public` | Browse and watch only; can't request a title or create a watch party. |

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
| `settings.access` (Settings access) | Open the Administration area at all, and change every setting in it: libraries, profiles, subtitle and translation providers, Live TV, plugins, and so on. |
| `users.manage` (Manage users) | Create, edit, disable and delete user accounts. Picking a user's role also needs `roles.manage`. |
| `roles.manage` (Manage roles) | Create, edit and delete roles, and assign a role to a user. It doesn't grant `users.manage`. |

A plugin can add its own permissions to this list (namespaced to that plugin, so it can never be
confused with a core one or another plugin's). They appear under **Plugin permissions** in the role
editor once the plugin is installed.

You can create as many custom roles as you like, combining any permissions: a "Family" role with
just `media.read`, `livetv.read` and `requests.create`, a "Moderator" role that adds
`requests.manage` without touching settings, and so on. A role can't be deleted while any user is
still assigned to it; reassign those users first.

`users.manage` and `roles.manage` are only reachable from the Administration area, so a role that
holds them also needs `settings.access`.

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
- [Requests](/features/requests) for how `requests.create` and `requests.manage` interact with
  auto-approval rules.
- [Plugins](/administration/plugins) for how an installed plugin's own permissions show up here.
