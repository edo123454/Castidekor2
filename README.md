# Çastidekor — Website + Backend

Full site for Çastidekor: the public homepage (`public/index.html`) plus a
real backend (`server.js`) that saves every contact-form submission into a
database, and an admin page (`public/admin.html`) to view/delete them.

## What's inside
- `server.js` — Express server. Serves the site, saves submissions to SQLite,
  and has a password-protected admin API.
- `public/index.html` — the website.
- `public/admin.html` — password-protected dashboard to see every contact
  request (name, phone, event type, date, message).
- `data/castidekor.db` — the database file (created automatically on first run).

## Run it locally
```
npm install
cp .env.example .env      # then edit .env and set your own ADMIN_PASSWORD
npm start
```
Then open:
- Website: http://localhost:3000
- Admin panel: http://localhost:3000/admin.html

**Change the admin password before you go live** — edit `.env` (or the
platform's environment variables once deployed) and set `ADMIN_PASSWORD` to
something only you know. Never commit `.env` to a public repo.

## Getting it online (free, no credit card required)

The simplest path is **Render.com**. Steps:

1. Create a free account at https://render.com
2. Put this project in a GitHub repo (create a new repo, push these files).
3. In Render, click **New → Web Service**, connect your GitHub repo.
4. Settings:
   - Build command: `npm install`
   - Start command: `npm start`
5. Under **Environment**, add a variable `ADMIN_PASSWORD` with your real password.
6. Deploy. Render gives you a live URL like `https://castidekor.onrender.com`.
7. (Optional) Add a custom domain like `castidekor.com` in Render's settings —
   you'll need to buy the domain first (e.g. from Namecheap or Google Domains).

Alternatives that work the same way: **Railway.app**, **Fly.io**, or
**Google Cloud Run** if you specifically want it on Google's infrastructure
(more setup involved — needs a Google Cloud billing account and a Dockerfile;
ask if you want me to set that up too).

**Note on the database:** SQLite writes to a local file, which is fine for
getting started, but on some hosts (like Render's free tier) the filesystem
resets on redeploy. If you outgrow that, swap in a hosted database
(Render/Railway/Supabase all offer a free Postgres database) — the code
change is small since all DB calls go through the few `db.prepare(...)`
lines in `server.js`.

## Backing up your data
Your contacts live in `data/castidekor.db`. Copy that file anywhere to back
it up, or open it with any SQLite viewer (e.g. https://sqlitebrowser.org) to
browse it directly.
