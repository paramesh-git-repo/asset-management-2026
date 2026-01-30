# Profile image upload (10MB) – live environment setup

If profile image upload works locally but returns **413 (Content Too Large)** in production (e.g. `https://demo-asset-accel.v-accel.ai`), the reverse proxy in front of your app is limiting request body size.

## 1. Redeploy app

- Deploy the **latest backend** (Express 10MB limit is in code).
- Deploy the **latest frontend** so the UI shows "Max size 10 MB" and JPEG/PNG/WEBP.

## 2. Allow 10MB in the reverse proxy (required)

Your live URL goes through a proxy (Nginx, Caddy, or similar). That proxy must allow request bodies up to **10MB** for the upload to reach the backend.

### Nginx

Edit the server block that handles `demo-asset-accel.v-accel.ai` (or your API host) and either:

**Option A – For the whole API:**

```nginx
location /api/ {
    client_max_body_size 10M;
    # ... existing proxy_pass and other directives ...
}
```

**Option B – Only for profile image upload:**

```nginx
location /api/v1/users/profile-image {
    client_max_body_size 10M;
    # ... existing proxy_pass and other directives ...
}
```

Then reload Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Other proxies

- **Caddy:** `client_max_body_size 10MB` in the relevant `handle` or route.
- **Cloudflare / other CDN:** Check their "max upload" or "request body size" and set to at least 10MB for the API path.

## 3. Verify

- Open Settings → Change Photo.
- Upload an image under 10MB (JPEG/PNG/WEBP). It should succeed.
- UI should show: "JPEG, PNG or WEBP • Max size 10 MB".

If 413 persists, the proxy in front of `https://demo-asset-accel.v-accel.ai/api/v1/users/profile-image` is still limiting the body; adjust that server’s config as above.
