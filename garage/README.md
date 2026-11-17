# PayPerQ landing: garage door

The studies are listed in the shared hub, `../uniform/index.html` (card 07 Garage); `index.html` here redirects there. Round 3, `r3/garage.html`, is the recommendation. Everything is local: no server, no third-party requests (fonts, logos and videos are in `assets/`). Press **T** on any page to cycle its type pairings.

## Folders

| Path | What it holds |
| --- | --- |
| `BRIEF.md` | The page brief (message, four ideas, approved copy, art direction). |
| `REFERENCES.md` | Teardown of Vercel, Cursor, AI Hero, Command Code and Fonts In Use, re-captured on Nov 13, 2026. |
| `REVIEW.md` | Critique of each round with a fix per finding. |
| `assets/mocks/` | The four hero mocks made before round 1 (A–D; B was chosen). |
| `r1/`, `r2/`, `r3/` | Pages per round. `garage.html` is the door direction; `threshold.html` (from round 2) is the re-take. |
| `motion/` | Remotion project (`src/Door.tsx` is the door, light and floor; `src/Scenes.tsx` holds the compositions; `src/Mock.tsx` the hero mocks). |
| `assets/motion/` | Rendered pieces. The suffix is the round (`-r1`, `-r2`…); `-tall` files are phone cuts. |
| `app-captures/` | Fresh captures of the real chat from today (privacy pane, verify recording showing build v0.75.0). |
| `facts/` | The raw sources the numbers come from, fetched on Nov 13, 2026. |
| `research/` | Reference screenshots (desktop `-d`, phone `-m`) and computed-style dumps. |
| `review/` | Page captures for each round (full page, per-viewport, phone sheets). |
| `tools/` | Capture and check scripts (Playwright, sharp). |

## Regenerate

- **References:** `cd tools && node teardown.mjs`.
- **App captures:** needs the PPQ app running on `localhost:3000`. `cd tools && node capture.mjs [stills|verify]`. It reuses the uniform study's persistent guest profile (`uniform/tools/.chrome-profile`), so no new account is created, and seeds conversations into IndexedDB. The balance ($18.42) is staged by intercepting the credit endpoint.
- **Motion:** `cd motion && npx remotion studio` to preview, `./render.sh 3` to render a round (writes `assets/motion/*-r3.*`). The search footage comes from the uniform study (`motion/public/app/video-picker-search-master.mp4`, recorded earlier on Nov 13); the verify footage was recorded for this page.
- **Review captures:** `cd tools && node pageshot.mjs ../r3/garage.html` (1440 and 390 px; reports overflow, errors and any external request), then `node sheet.mjs r3-garage-390` for the phone sheets. `python3 check-assets.py` checks every local reference.

## Facts used (confirm before publishing)

Sources in `facts/`: `api.ppq.ai/models-pricing`, `PayPerQ/ppq-enclave-proxy` `attestation/published-pcr.json`, `ppq.ai/llms.txt`, `mempool.space`. All values are from Nov 13, 2026.

- **Catalogue:** 388 chat models from 66 providers; privacy labels 226 Anon, 156 ZDR, 6 E2E; 172 open-weight; 96 image, video and audio models (38 + 53 + 5).
- **Median cost of one chat message:** Claude Haiku 5.5 $0.0023 · Gemini 4 Argon $0.0140 · GPT-6 Luna $0.0177 · GLM 5.3 $0.0193 · Claude Sonnet 5.5 $0.0512 · Claude Opus 5.5 $0.1339. Most-used model per provider (largest median sample): GPT-4o-mini $0.0001, Opus 5.5, Gemini 4 Argon, DeepSeek V4.1 Flash $0.0111, GLM 5.3, Qwen3.8 Max $0.0525, Kimi K3 $0.0380, Grok 4.6 $0.0518, Tinfoil's private DeepSeek V4.1 Flash $0.0178.
- **Enclave:** build v0.75.0, commit ea20ad8, published Nov 13, 2026. PCR0 `bd2b83ae…5de85c10` (96 hex digits, shown in full on the page). The app's privacy panel confirmed "Build v0.75.0 matches GitHub" at capture time. Earlier studies used v0.73.0; it rolled over today.
- **Payments:** Lightning top-ups $0.10–$1,000 (llms.txt). Sats at $67,830 per BTC. Footer block height 975,723.
- **Staged in the footage:** the conversations are written for the capture, and the $18.42 balance is stubbed.

## Credits

Model logos come from the app's `pricing-icons` (Lobe Icons, MIT; Simple Icons, CC0; Tinfoil's own mark). Payment marks are from Wikimedia Commons (Bitcoin, Monero, Tether public domain; USDC and the Lightning Network mark CC BY-SA 4.0) and Simple Icons (Litecoin). Fonts: Geist and Geist Mono (OFL, Vercel), Barlow Condensed and Archivo (OFL, Google Fonts).
