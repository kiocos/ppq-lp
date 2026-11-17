# Chat section studies (round 1, Nov 15, 2026)

`index.html` holds three directions for the Chat section of the Prometheus page (it replaces r7's Models block; page order becomes enclave, API, chat).

- **A, one stage, four steps (recommended):** a sticky product window changes with the scroll: model picker (zoomed), browser tab, install prompt into a PWA window with a dock icon, then the phone.
- **B, one card per way in:** heading, model strip, then three stacking cards (browser, computer/PWA, orange phone card).
- **C, light switcher (re-take):** one light screen with tabs: Browser, Computer, iPhone, Android.

Screens in `shots/` are the real app (build v0.75.0) from `../../darkroom/app-captures/`: written conversations, staged $18.42 balance. The phone shows the mobile **web** app; replace it with a native-app screenshot.

Checked in PPQdotAI: `public/manifest.json` (standalone, start_url /chat), "Your chats are saved only in this browser" (no account), `.well-known` files for `ai.ppq.mobile` (iOS + Android).
To confirm: store URLs, whether the native app routes through the enclave, whether it shares the web balance. Store buttons use Simple Icons marks; use the official App Store / Google Play badges before shipping.

Review: `cd ../tools && node chatshots.mjs` (1440 + 390 px into `review/`), `node chatm.mjs` for phone steps of A.

# Round 2 (Nov 16, 2026): composer on the page

`r2/index.html`. After "too big; the chat needs no explaining", the section is heading + one sentence + a working replica of the app's composer + one proof line, then a phone-app panel.
- A (recommended): problem-led heading, 3 switchable versions. B: "Some questions are nobody's business." with auto-typed sensitive questions.
- `r2/models.js`: the 388 chat models (name, provider, tier, price mark, popular, reasoning, vision) plus image/video/audio names, from `../facts/models-pricing.json`.
- Proposals not in the app: tier filter chips, $–$$$ price marks (median cost per message: <$0.01, <$0.06, above). Sending needs a new hand-off in PPQdotAI (open /chat with draft + model).
- Review: `cd ../tools && node chat2shots.mjs` → `review/r2/`.
