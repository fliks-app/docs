---
title: Download clients
description: Connect qBittorrent or Transmission to the Download plugin, and share the download folder so Fliks can import what the client fetched.
---

A **download client** is the program that actually downloads the torrent. The Download plugin supports
two:

- **qBittorrent**, through its Web UI.
- **Transmission** 3.0 or later, through its remote interface. Fliks's category is a Transmission label.

Fliks sends a release to the client, follows its progress, and when the file is complete it reads it from
the client's download folder. That last part is why the two programs must agree on a folder, see
[The shared folder](#the-shared-folder). Read it before you click **Save**: it is the most common mistake.

## Get the details from qBittorrent

Fliks needs four things: the address of the Web UI, its port, a username and a password. All four are in
qBittorrent's own options.

:::steps
![In qBittorrent, click the gear icon, **Options**](/img/download-qbit-opts-1-gear.webp)
![Open the **Downloads** tab](/img/download-qbit-opts-2-options.webp)
![**Default Save Path** is where files land. Remember it, then open **WebUI**](/img/download-qbit-opts-3-downloads.webp)
![**Port** and **Username** are here. Set a **Password** if you only had the temporary one](/img/download-qbit-opts-4-webui.webp)
:::

- **Port**: the Web UI port, 8080 by default. When qBittorrent runs in Docker this is the port inside
  the container, not the one you published on the host.
- **Username and password**: Fliks signs in with them. A fresh qBittorrent prints a temporary password in its
  log the first time it starts and changes it at every restart until you set your own, so set one.
  The **API Key** section of the same tab is not used by Fliks.

## Add qBittorrent in Fliks

Open **Settings > Download > Download clients**.

:::steps
![Click **New download client**](/img/download-client-qbit-1-new.webp)
![Name it. **Host** is where Fliks reaches qBittorrent, here the Docker service name `qbittorrent`; **Port** is `8080`; add the username and password](/img/download-client-qbit-2-form.webp)
![Scroll down for the categories, then click **Test connection**](/img/download-client-qbit-3-options.webp)
![**Connected successfully**: click **Save**](/img/download-client-qbit-4-test.webp)
:::

**Host** follows the same rule as for [indexer sources](/built-in-plugins/download-indexers#what-fliks-needs-from-you):
it is the address Fliks uses, so a Docker service name or the host's LAN address, never `localhost` from a
Fliks that runs in Docker. Type only the name. If you add `http://` or `:8080` Fliks strips them, but
**Port** and **Use HTTPS** are what count.

### Transmission

Pick **Transmission** in **Type**. The form gains a **URL base**. Enable the remote interface in
Transmission first, and note its port (9091 by default), username and password.

![The Transmission form: Host, Port, URL base, username and password](/img/download-client-transmission-form.webp)

> [!WARNING]
> Changing **Type** does not change **Port**. The form starts on `8080`, qBittorrent's port. Set `9091`
> yourself for Transmission.

**URL base** is the path of the remote interface. Leave it empty or enter `/transmission/`, the usual
value.

### Client options

| Option | Default | What it does |
|---|---|---|
| **Name** | | The name shown in the list. |
| **Type** | qBittorrent | **qBittorrent** or **Transmission**. |
| **Host** | `localhost` | The address Fliks uses to reach the client. Required. |
| **Port** | 8080 | The Web UI or remote interface port. |
| **Use HTTPS** | off | Reach the client over HTTPS. |
| **URL base** | empty | Transmission only. The path of the remote interface. |
| **Username**, **Password** | empty | The client's sign-in. The password is stored encrypted. Leave it blank when editing to keep the saved one. |
| **Category** | `fliks` | The category (qBittorrent) or label (Transmission) every download is filed under. |
| **Movie category**, **Series category**, **Ebook category**, **Audiobook category**, **Comic category**, **Album category** | empty | A different category for that kind of media. Empty uses **Category**. |
| **Priority** | 1 | Lowest number first. |
| **Active** | on | A disabled client is not used and not followed. |

**Categories keep Fliks to its own torrents.** Fliks only follows and cleans torrents in the categories
above. A torrent you added yourself to the same client is left alone, and Fliks refuses to take over a
release the client already holds outside its category. If you empty **Category**, the client is not scoped and
Fliks sees all its torrents, so keep a category.

**Priority** matters when you have several clients: new downloads go to the first enabled client, the
one with the lowest number. The others are still followed for downloads already sent to them, and take
over if the first is disabled.

## Test the connection

**Test connection** signs in and asks the client for its state. It does not add anything.

![Connected successfully](/img/download-client-test-ok.webp)

| Message | Meaning |
|---|---|
| **Connected successfully** | Address, port and sign-in work. |
| **Host is required** | **Host** is empty. |
| **Authentication failed**, check the credentials | The client answered but refused the username or password. |
| **Could not reach the download client** | Nothing answered: wrong host or port, the client is stopped, or the name is not known from the Fliks container. |

![Authentication failed](/img/download-client-test-auth-failed.webp)

![Could not reach the download client](/img/download-client-test-unreachable.webp)

## The shared folder

Fliks never receives the file from the client. It asks the client where it saved it, gets a path **as the
client sees it**, and opens that same path inside its own container. So the folder must exist, under the
same name, in both.

1. Pick a folder on the host, for example `/srv/downloads`.
2. Mount it at `/downloads` in **both** containers.
3. In the client, set the default save path to `/downloads` (qBittorrent: **Options > Downloads > Default
   Save Path**). Sub-folders are fine.

```yaml
services:
  fliks:
    volumes:
      - /srv/downloads:/downloads
  qbittorrent:
    volumes:
      - /srv/downloads:/downloads
```

The plugin may only add files from `/downloads`: that is the folder named at install, in the consent
list as **Add files under: /downloads**. There is no path-mapping setting. If the client saves to another
path, for example `/data/torrents`, Fliks cannot translate it and the import fails with
*is outside every configured ingest root*. Change the client's save path instead.

The Docker volume is described in [Installing with Docker](/install/docker#volumes). The folder needs
space for each download once, plus the copy Fliks makes into the library.

> [!NOTE]
> Fliks **copies** the file into the library, then leaves the original where it is so the client can keep
> seeding. The original goes away when it reaches its [seeding limit](/built-in-plugins/download-settings#seeding).
> Hard links and moves are not used.

## Edit or remove a client

Click a row to edit it. **Clear stored value** next to **Password** forgets the saved password.
**Delete** removes the client from Fliks. The torrents already inside it are not touched.
