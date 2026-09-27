# Greetings

A mobile-first, multilingual greeting generator that opens from a QR code.

**Scan QR → Select language → Select occasion → Enter details → Upload photo/logo → Choose template → Preview → Generate → Download / Share**

- 27 Indian languages. The whole interface is translated, and language is always the first step.
- 99 occasions: national, pan-India and state/regional festivals, plus Birthday, Anniversary, Work Anniversary, Wedding, Congratulations, Thank You, Best Wishes and business occasions. The list is searchable and can be filtered by category, state and month.
- Form fields change with the occasion (festival, birthday, anniversary, work anniversary, and so on).
- 5 template styles per occasion (Traditional / Premium / Corporate / Minimal / Festive, or Celebratory / Elegant / Professional / Modern / Classic for personal occasions).
- Two output sizes: Post (1080 × 1080) and Status/Story (1080 × 1920), HD PNG.
- Sharing: Download, WhatsApp, native share sheet (Instagram, Telegram and others), Facebook, Email, Copy link.
- Dynamic QR: the printed QR always points to `/go`. You change where `/go` leads in `.env`, so you never need to reprint.
- Installable PWA, offline app shell, and "remember my details" on the device (optional).

---

## 1. What you need (one-time setup)

| Tool | Version | Download |
|---|---|---|
| **Node.js** | 22 LTS (recommended) or 20.19+ | https://nodejs.org → "LTS" button |
| **VS Code** | any recent | https://code.visualstudio.com |

After you install Node.js, open a new terminal and check it:

```bash
node -v     # should print v22.x.x (or v20.19+)
npm -v      # should print 10.x
```

> Windows: during the Node.js install, keep "Add to PATH" ticked. Restart VS Code after installing.

---

## 2. Run it in VS Code (development mode)

1. **Unzip** `greetings.zip` to a folder, e.g. `Documents/greetings`.
2. Open **VS Code**, choose **File → Open Folder…** and pick that folder.
3. Open the built-in terminal with **Terminal → New Terminal** (shortcut: <kbd>Ctrl</kbd> + <kbd>`</kbd>).
4. Install the dependencies. This is needed only the first time and takes 1–3 minutes:

   ```bash
   npm install
   ```

5. Create your settings file (optional, since defaults work without it):

   ```bash
   # macOS / Linux
   cp .env.example .env
   # Windows (PowerShell)
   copy .env.example .env
   ```

6. Start the app:

   ```bash
   npm run dev
   ```

   Wait until you see `serving on http://localhost:3000`.

7. Open **http://localhost:3000** in Chrome. Press <kbd>F12</kbd> and then <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd> to view it as a phone.

To stop the app, click inside the terminal and press <kbd>Ctrl</kbd> + <kbd>C</kbd>.

Code changes in `client/` reload in the browser straight away. After changes in `server/`, stop and re-run `npm run dev`.

### Test on your real phone (same Wi-Fi)

1. Find your computer's local IP. On Windows run `ipconfig` and look for "IPv4 Address", e.g. `192.168.1.20`. On macOS run `ipconfig getifaddr en0`.
2. On the phone, open `http://192.168.1.20:3000`.
3. If it doesn't load, allow Node.js through the Windows Firewall (the prompt appears the first time you run the app).

> Native "Share" and "Install app" need **HTTPS**, so they only work fully after deployment (step 5) or on `localhost`. Download and WhatsApp links work everywhere.

---

## 3. Production build (what you deploy)

```bash
npm run build     # builds the client to dist/public and the server to dist/index.cjs
npm start         # runs the optimized version on http://localhost:3000
```

Check for type errors at any time with:

```bash
npm run check
```

---

## 4. The QR code

1. Open **http://localhost:3000/#/qr** (on your live site: `https://your-domain/#/qr`).
2. Put your live domain in the box, e.g. `https://greetings.yourdomain.in/go`.
3. Download the **PNG (print)** file (2048 px, high error correction, logo in the centre) or the **SVG (vector)** file for the printer.
4. Print it on the desk item.

The QR encodes `…/go`. The server redirects `/go` to the value of `QR_TARGET` in `.env`, which is the language screen by default. To point the same printed QR at a Diwali campaign later, set for example:

```
QR_TARGET=/#/en/create/diwali
```

and restart the server. There is no reprint. The `/#/qr` page also shows scan counts, greetings generated, and the top occasions and languages since the server started.

---

## 5. Deploying (going live)

It's a standard Node.js app: **build command** `npm install && npm run build`, **start command** `npm start`. The platform provides `PORT` automatically.

| Option | Approx. cost | Notes |
|---|---|---|
| **Render.com** web service | Free tier (sleeps) / ~US$7 per month always-on | Connect GitHub repo → New Web Service → set commands above |
| **Railway / Fly.io** | ~US$5 per month | Same commands |
| **VPS** (Hostinger, DigitalOcean, AWS Lightsail) | ~₹600–1,000 per month | `git clone`, `npm install`, `npm run build`, run with `pm2 start dist/index.cjs --name qrm`, Nginx + Let's Encrypt for HTTPS |

Set these environment variables on the host:

```
QR_TARGET=/
PUBLIC_URL=https://greetings.yourdomain.in
```

Then point your domain (DNS A/CNAME record) at the host and turn on HTTPS.

---

## 6. Project structure

```
greetings/
├─ client/                       ← the website (React + Vite + Tailwind)
│  ├─ index.html
│  ├─ public/
│  │  ├─ art/                    ← template background artwork (*-sq square, *-st story, *-th thumbnail)
│  │  ├─ icons/                  ← PWA / app icons
│  │  ├─ manifest.webmanifest    ← PWA manifest
│  │  └─ sw.js                   ← service worker (offline + caching)
│  └─ src/
│     ├─ pages/
│     │  ├─ LanguagePage.tsx     ← step 1: choose language
│     │  ├─ HomePage.tsx         ← step 2: choose occasion (search, filters)
│     │  ├─ CreatePage.tsx       ← steps 3–6: details, photo, template, preview
│     │  ├─ ResultPage.tsx       ← step 7: download & share
│     │  └─ QrAdminPage.tsx      ← /#/qr – printable QR + stats
│     ├─ data/
│     │  ├─ occasions.ts         ← ALL festivals & occasions (edit here)
│     │  └─ fields.ts            ← which form fields each occasion type shows
│     ├─ i18n/
│     │  ├─ languages.ts         ← language list + fonts per script
│     │  ├─ ui-en.json           ← all English interface text (source)
│     │  └─ locales/*.json       ← translations (one file per language)
│     └─ lib/
│        ├─ render.ts            ← the greeting image renderer (canvas + templates)
│        ├─ i18n.tsx             ← translation hook t("key")
│        ├─ store.tsx            ← form state + "remember me"
│        └─ persist.ts           ← localStorage helpers
├─ server/
│  ├─ index.ts                   ← Express server start
│  ├─ routes.ts                  ← /go, /api/greetings, /api/track, /api/stats
│  ├─ static.ts                  ← serves the built site in production
│  └─ vite.ts                    ← dev-mode hot reload
├─ script/build.ts               ← production build script
├─ .env.example                  ← settings template
└─ package.json                  ← scripts & dependencies
```

---

## 7. Common changes

### Add a festival or occasion
Open `client/src/data/occasions.ts` and copy an existing line:

```ts
{ id: "harela", name: "Harela", headline: "Happy Harela",
  message: "May the green of Harela bring fresh hope…",
  category: "regional",          // national | festival | regional | occasion | business
  fieldSet: "festival",          // festival | birthday | anniversary | wedding | work | business | personal | general
  theme: "harvest",              // art: diwali holi harvest lotus eid christmas newyear birthday anniversary devotional floral national royal toran
  months: [7],                   // months it usually falls in (drives "Upcoming")
  regions: ["Uttarakhand"],      // states (drives the state filter)
  keywords: ["kumaon"] },        // extra search words
```

New entries appear in English right away. For other languages, add `occ.<id>.name`, `occ.<id>.headline` and `occ.<id>.message` to each `client/src/i18n/locales/<code>.json`. Missing keys fall back to English automatically.

### Change interface text or a translation
Edit `client/src/i18n/locales/<code>.json` (for example `mr.json` for Marathi). Keep the `{placeholders}` exactly as they are.

### Add a language
1. Add an entry to `LANGUAGES` in `client/src/i18n/languages.ts` (code, English name, native name, script).
2. Copy `client/src/i18n/locales/en.json` to `<code>.json` and translate the values.

### Change the form fields for an occasion type
Edit `FIELD_SETS` in `client/src/data/fields.ts`.

### Change colours or fonts of the app
`client/src/index.css` (CSS variables) and `tailwind.config.ts`.

### Add or modify template styles
`client/src/lib/render.ts`:
- `templatesFor()` lists the templates shown per occasion.
- `paintBackground()` draws each style (art, premium, corporate, minimal).
- Add artwork as `client/public/art/<theme>-sq.jpg` (1080×1080), `<theme>-st.jpg` (1080×1920) and `<theme>-th.jpg` (small thumbnail).

---

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| `'npm' is not recognized` | Node.js isn't installed or VS Code was open during the install. Install Node LTS, then restart VS Code. |
| `Error: listen EADDRINUSE :3000` | Port 3000 is busy. Set `PORT=3001` in `.env` (or stop the other app), then run again. |
| `npm install` fails with network errors | Check your internet or proxy. Delete `node_modules` and `package-lock.json`, then run `npm install` again. |
| PowerShell: "running scripts is disabled" | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use **Command Prompt** as the VS Code terminal. |
| Fonts look plain in some languages | Fonts load from Google Fonts on first use, so the device needs internet the first time. |
| Share button only downloads | The browser doesn't support sharing files (desktop browsers, older iOS). The image is downloaded instead, and the user can attach it manually. |
| Old version shows after deploy | The service worker is caching it. Reload twice, or bump `CACHE` in `client/public/sw.js`. |

---

## 9. Scripts

| Command | What it does |
|---|---|
| `npm install` | Installs dependencies (first time, or after `package.json` changes) |
| `npm run dev` | Development server with hot reload on http://localhost:3000 |
| `npm run build` | Production build into `dist/` |
| `npm start` | Runs the production build |
| `npm run check` | TypeScript type check |

---

Translations were machine-generated and should be reviewed by native speakers before launch.
