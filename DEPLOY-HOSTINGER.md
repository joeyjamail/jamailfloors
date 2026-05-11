# Hostinger Deployment Guide — jamailfloors.com

This site is a static Astro build. Everything in `dist/` is what gets uploaded.

## 1. Set analytics IDs

Before building, create `.env` in the project root (or set them in your Hostinger build env):

```
PUBLIC_GA_ID=G-XXXXXXXXXX        # your real GA4 ID
PUBLIC_CLARITY_ID=wcnjrkr6l6     # or your real Clarity project ID
```

These are gated behind cookie consent and never load until the visitor clicks Accept.

## 2. Build

```bash
npm install
npm run build
```

Output goes to `dist/`. Current size: ~65 MB.

## 3. Upload to Hostinger

In hPanel → **File Manager** (or via FTP):

1. Open `public_html/`
2. **Upload the contents of `dist/`** (not the `dist` folder itself). The structure should be:
   ```
   public_html/
   ├── .htaccess
   ├── index.html
   ├── favicon.svg
   ├── robots.txt
   ├── sitemap-index.xml
   ├── sitemap-0.xml
   ├── _astro/
   ├── images/
   ├── about/
   ├── contact/
   ├── products/
   └── ...
   ```
3. Make sure hidden files are visible so `.htaccess` is uploaded.

Easiest way: zip `dist/` contents locally, upload the zip via File Manager, then "Extract" inside `public_html/`.

## 4. Domain & SSL

- Point `jamailfloors.com` (and `www.jamailfloors.com`) to Hostinger.
- In hPanel → **SSL**, enable "Force HTTPS". The `.htaccess` also force-redirects HTTP → HTTPS as a backup.
- Decide www vs apex. If you want www, uncomment the redirect block at the top of `.htaccess`.

## 5. The sample-request form

The form posts to `/.netlify/functions/send-sample-email`, which only runs on Netlify. **On Hostinger this endpoint does not exist.**

Pick one of these before launch:

**Option A — Formspree (5 minutes):** create a Formspree form, change the `fetch(...)` URL in [src/scripts/main.ts](src/scripts/main.ts) to your Formspree endpoint.

**Option B — EmailJS:** client-side library, no backend needed.

**Option C — Move Netlify Function elsewhere:** deploy [netlify/functions/send-sample-email.js](netlify/functions/send-sample-email.js) on Cloudflare Workers, Vercel, or AWS Lambda and point the `fetch` URL at it.

Until you pick one, the form will show "There was a problem sending your request."

## 6. Post-launch checklist

- [ ] Open `https://jamailfloors.com` in incognito — should be HTTPS, no console errors.
- [ ] Submit the sample form — confirm email arrives.
- [ ] Submit `https://jamailfloors.com/sitemap-index.xml` to Google Search Console.
- [ ] Run PageSpeed Insights on home + a product page. Target ≥90 mobile.
- [ ] Verify Google Business Profile is linked to jamailfloors.com.
- [ ] Set up 301 from any old domain (jamailhardwoods.com) → jamailfloors.com if you owned it.
