---
title: Reverse proxy
description: Put Fliks behind nginx, Caddy or Traefik to expose it over HTTPS, with the settings streaming and authentication need to keep working.
---

## What the proxy needs to forward

Fliks doesn't use WebSockets; live updates (scan progress, new downloads, Live TV state) travel
over Server-Sent Events (SSE), a single long-lived HTTP response the server keeps writing to. In
practice this means:

- No `Upgrade`/`Connection` header dance to configure, unlike a typical WebSocket setup.
- The proxy must not buffer that response, or updates arrive in bursts instead of live. Disable
  response buffering for the API path.
- Forward `X-Forwarded-Proto` and `X-Forwarded-For` (or your proxy's equivalent). Fliks trusts
  proxy headers for the client's real IP, and needs `X-Forwarded-Proto: https` to know the
  connection is actually secure, without which its auth cookies fall back to a non-secure mode
  browsers still accept, but that you don't want on a public deployment.
- Raise the client body size limit. The largest legitimate upload is a manually imported IPTV
  playlist file, capped at 128 MB server-side; a default 1 MB proxy limit rejects it before
  Fliks ever sees it.
- Long timeouts on the streaming and SSE paths: a paused player, an idle Live TV tab, or a slow
  network can hold a connection open far longer than a typical API request.

## No subpath support

Fliks' web client is built with a fixed `/` base path. Serve it at the root of a (sub)domain
(`https://fliks.example.com/`), not under a path prefix (`https://example.com/fliks/`); the
latter breaks asset loading. A dedicated subdomain is the simplest way to get this right.

## Tell Fliks its public address

Set the **Public URL** under **Settings > General** to the address people actually use
(`https://fliks.example.com`). It's used to build stream URLs for Chromecast, which connects
directly to the server rather than through whatever device is casting; leave it blank and Fliks
falls back to guessing from the request's `Host` header, which is often wrong behind a proxy
(it sees the proxy's own address, not the public one).

## nginx

```nginx
server {
    listen 443 ssl;
    server_name fliks.example.com;

    ssl_certificate     /etc/letsencrypt/live/fliks.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fliks.example.com/privkey.pem;

    client_max_body_size 150m;

    location / {
        proxy_pass http://127.0.0.1:4848;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE / streaming: don't buffer, don't time out an idle player.
        proxy_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

## Caddy

Caddy disables response buffering and forwards proxy headers by default, so the config is
shorter:

```
fliks.example.com {
    reverse_proxy 127.0.0.1:4848 {
        transport http {
            read_timeout 3600s
        }
    }
    request_body {
        max_size 150MB
    }
}
```

## Traefik

```yaml
http:
  routers:
    fliks:
      rule: "Host(`fliks.example.com`)"
      service: fliks
      tls:
        certResolver: letsencrypt
  services:
    fliks:
      loadBalancer:
        servers:
          - url: "http://127.0.0.1:4848"
```

Traefik forwards `X-Forwarded-*` headers by default. If you front it with another proxy or a
CDN, raise the request size limit there too (Traefik itself has none by default), and make sure
nothing in the chain buffers the SSE responses.

## See also

- [Docker](/install/docker) for `network_mode: host`, needed if you also want Chromecast
  discovery to work from the same host.
- [Environment variables](/install/environment-variables) for `CORS_ORIGIN`, needed if the web
  client and the API end up served from different origins.
