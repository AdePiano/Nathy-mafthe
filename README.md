# መፍትሄ አለ ሆሳዕና | Mafithe Alle Hossana

Multi-service local marketplace for Hossana, Central Ethiopia — car rental & sales, house rental & sales, land sales, wedding suit rental, sound equipment rental, decoration, and makeup services.

## Features
- 9 service categories with an Amazon-inspired UI (navy header, orange accents, Ethiopian tricolor signature strip)
- Full Amharic / English bilingual support (switch with the language toggle in the header, or `?lang=am` / `?lang=en`)
- House & land listings capture subcity/kebele location and area size (km² / m² / hectare)
- Admin panel to add, edit, mark sold/rented, and delete listings — sold/rented items disappear from the public site immediately
- Manual payment workflow: customers submit a booking with their CBE or Telebirr transaction reference; you confirm it from the admin dashboard
- Admin tracks every booking/inquiry with status (pending / confirmed / rejected)
- Contact number +251926285799 shown site-wide
- JSON file storage — no database setup needed

## Local setup
```bash
npm install
cp .env.example .env
npm start
```
Visit http://localhost:3000. Admin panel: http://localhost:3000/admin/login

**Default admin login:**
- Username: `admin`
- Password: `hossana2026`

⚠️ Change this before going live — generate a new password hash with:
```bash
node utils/hash-password.js yourNewPassword
```
Then paste the printed hash into `.env` as `ADMIN_PASSWORD_HASH`.

## Editing payment details
Open `.env` and update:
- `CBE_ACCOUNT_NAME`, `CBE_ACCOUNT_NUMBER`
- `TELEBIRR_NUMBER`
- `CONTACT_PHONE`

## Deploying to Railway
1. Push this project to a GitHub repository (do **not** commit `.env` — it's already git-ignored).
2. In Railway: New Project → Deploy from GitHub repo → select this repo.
3. In Railway's Variables tab, add the same variables from `.env.example` (`SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `CONTACT_PHONE`, `CBE_ACCOUNT_NAME`, `CBE_ACCOUNT_NUMBER`, `TELEBIRR_NUMBER`). Railway sets `PORT` automatically.
4. Railway will run `npm install` then `npm start` automatically.
5. Because Railway's free tier can sleep the app, consider pointing an uptime monitor (e.g. UptimeRobot) at your deployed URL every 5 minutes to keep it responsive.

## Data storage note
Listings and bookings are stored in `data/listings.json` and `data/bookings.json`. On Railway's free tier the filesystem is ephemeral on redeploys, so back up these two files periodically (Admin → export, or just copy them from the Railway shell) if you add real listings before you're ready to move to a real database.

## Project structure
```
server.js              # App entry point
routes/main.js          # Public site routes (home, categories, listing detail, booking)
routes/admin.js         # Admin auth + listing/booking management
utils/db.js             # JSON file read/write helpers
utils/categories.js     # The 9 category definitions + Hossana area list
utils/i18n.js           # Amharic/English language middleware
views/                  # EJS templates
public/css/style.css    # Amazon-inspired styling
data/                   # JSON data store (listings.json, bookings.json)
```
