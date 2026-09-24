---
title: Users and permissions
description: Create accounts for the household, control what each one can do, and decide which libraries they can see.
---

## Users

**Settings > Users** lists every account: username, role, whether it's active, and last login.
Creating one asks for a username, an optional email, a password, and a role.

Each user has a few settings independent of their role:

| Setting | What it does |
|---|---|
| Account active | Disables login without deleting the account or its history. An account can't disable itself, to avoid locking yourself out. |
| Super-admin (full access) | Grants every permission unconditionally, bypassing the role system entirely. Reserve it for accounts that should never be blocked by a permission you forgot to grant their role. |
| Force password change at next login | The next successful login must set a new password before doing anything else. Useful after creating an account with a temporary password. |
| Library access | Which libraries this user can see, as a plain checklist. Independent of role: two users with the same role can have completely different library access. |

Leave the password field empty while editing an existing user to keep their current password
unchanged.

## Roles and permissions

Every account (other than a super-admin) gets its permissions from exactly one **role**.
**Settings > Roles** manages them: a role is a name plus a set of permissions, and optionally a
set of default libraries new users with that role inherit when they're created (library access
is still managed per user afterward; the role's list is only a starting point).

Fliks ships three roles, seeded the first time the server starts with no roles yet:

| Role | Permissions | Notes |
|---|---|---|
| **Admin** | every permission | The default admin account uses this role. |
| **User** | read the library, read Live TV, create requests | The default role assigned to new users, unless you change which role is marked default. |
| **Readonly** | read the library, read Live TV | Browse and watch only; can't even request a title. |

The available permissions:

| Permission | Grants |
|---|---|
| `media.read` | Browse and play the library. |
| `media.create` | Add media (manual import, accepting a request's grab, and so on). |
| `media.edit` | Edit media metadata. |
| `media.delete` | Delete media. |
| `media.grab` | Manually trigger a download for a release. |
| `livetv.read` | See and watch Live TV. |
| `requests.create` | Submit a request for a title that isn't in the library yet. |
| `requests.manage` | Approve, decline, or edit other users' requests. |
| `subtitles.manage` | Manage subtitle providers and translation settings. |
| `settings.access` | Reach the admin settings area at all. |
| `users.manage` | Create, edit and disable user accounts (but not roles). |
| `roles.manage` | Create, edit and delete roles (but this alone doesn't grant `users.manage`). |

A plugin can add its own permissions to this list (namespaced to that plugin, so it can never be
confused with a core one or another plugin's); they appear automatically wherever permissions are
picked once the plugin is installed.

You can create as many custom roles as you like, combining any permissions: a "Family" role with
just `media.read`, `livetv.read` and `requests.create`, a "Moderator" role that adds
`requests.manage` without touching settings, and so on. A role can't be deleted while any user is
still assigned to it; reassign those users first.

## Which model actually applies

Two things are checked independently for every action: your role's permissions, and (for
anything library-scoped, like browsing or playing) whether you have access to that specific
library. A permission without library access to match gets you nowhere; library access without
the permission is the same. Everyone, regardless of role, can always read and update their own
account.

## See also

- [Settings](/administration/settings) for where Users and Roles sit among every other admin
  page.
- [Requests](/features/requests) for how `requests.create` and `requests.manage` interact with
  auto-approval rules.
- [Plugins](/administration/plugins) for how an installed plugin's own permissions show up here.
