# PostPilot AI — Chrome Extension

Capture any selected text on the web straight into your PostPilot AI drafts.
Works on every plan — signs in with your normal PostPilot AI account and
reuses the existing `/api/drafts` endpoint, so there was zero backend work
needed to ship this.

## Try it now (no store approval needed)

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select this `extension/` folder
4. Pin the extension, click the icon, sign in with your PostPilot AI account

That's it — permanent on your machine from that point on. `config.js`
already has the real Supabase URL/anon key baked in (these are public,
client-safe values — identical to what already ships in the web app's own
JS bundle to every visitor), so there's nothing to fill in.

## How to use it

- **Toolbar icon**: click it any time — it auto-fills the content box with
  whatever text is currently selected on the page (if any), pick a platform,
  optionally add a topic, and save.
- **Right-click**: select text on any page → right-click → "Send selection
  to PostPilot AI". This opens the popup pre-filled with that selection.

## Publishing it for other people (this part needs you)

Loading unpacked only works on your own machine. To let anyone install it
from the Chrome Web Store:

1. Create a [Chrome Web Store developer account](https://chrome.google.com/webstore/devconsole) — one-time $5 fee
2. Zip the contents of this `extension/` folder (not the folder itself —
   `manifest.json` should be at the root of the zip)
3. Create a new item in the developer dashboard, upload the zip
4. Fill in the store listing: description, screenshots (at least one,
   1280x800 or 640x400), and a small promo tile if you want one
5. Submit for review — typically 1-3 business days

None of that can be done on your behalf — it needs your Google account,
your $5, and your own listing content/screenshots.

## Files

- `manifest.json` — Manifest V3 config
- `config.js` — public Supabase URL/anon key + app URL
- `auth.js` — signs in via Supabase's REST auth API directly (no SDK bundling needed), stores/refreshes the session in `chrome.storage.local`
- `popup.html` / `popup.css` / `popup.js` — the toolbar popup UI (sign-in view + capture view)
- `background.js` — registers the right-click "Send selection" context menu
- `icons/` — extension icons, rendered from the same brand logo (`public/logo-icon.svg`) used across the web app
