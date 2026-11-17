# PayPerQ landing studies: Uniform

Open `index.html`. Everything is local: no server, no third-party requests (fonts, logos and videos are in `assets/`).

## Folders

| Folder | What it holds |
| --- | --- |
| `r1/`, `r2/`, `r3/` | Five directions × three rounds. Round 3 is current. Press T on any page to cycle its type pairings. |
| `logo-study.html` | The wordmark in Orbitron and eight alternatives, with a recommendation. |
| `app-captures/` | Real chat app captures: 18 stills (dark and light, 2880 × 1800) and 3 videos (mp4, webm, poster). `_masters/` holds the 2880 px sources used by Remotion. |
| `assets/motion/` | Rendered Remotion pieces. The suffix is the round that introduced them; `-tall` files are phone cuts. |
| `motion/` | Remotion project (`src/`): Sealed, Wheel, Ledger, OneLine, Night, AppTour. |
| `tools/` | Capture scripts (Playwright): reference teardown, app capture, page screenshots. |
| `research/` | Reference screenshots and computed-style dumps. |
| `review/` | Page screenshots used in each review round. |
| `REFERENCES.md`, `REVIEW.md` | The teardown, and the critical review that drove each round. |

## Regenerate

- **App captures.** This needs the app running on localhost:3000. Run `cd tools && node app-capture.mjs stills|videos`. It reuses one guest profile (`tools/.chrome-profile`) and seeds conversations from `seed-data.mjs` into IndexedDB. The balance is staged by intercepting `/api/payments/account/*/credit`. Videos are recorded in 2.5× slow motion through a device-pixel screenshot loop, then sped back up, so the masters are true 2880 px at about 30 fps.
- **Motion.** Run `cd motion && npx remotion studio`, or use `render-all.sh`, `render-r2.sh` and `render-r3.sh`. Copy new app masters into `motion/public/app/` first.
- **Screens.** Run `cd tools && node pageshot.mjs ../r3/*.html` (1440 and 390 px, with a page-overflow check).

## Facts used (confirm before publishing)

Sources: `api.ppq.ai/models-pricing`, `ppq.ai/llms.txt`, the API docs page, the app's privacy panel, and `PayPerQ/ppq-enclave-proxy/attestation/published-pcr.json`. All values are as of Nov 13, 2026.

- **Catalogue.** 387 chat models from 66 providers, plus 96 image, video and audio models (llms.txt says "500+ models" overall). Privacy labels: 226 Anon, 155 ZDR, 6 E2E. 171 models are open-weight.
- **Median cost per chat message.** Claude Haiku 5.5 $0.0023 · Gemini 4 Argon $0.0139 · GPT-6 Luna $0.0176 · GLM 5.3 $0.0195 · Claude Sonnet 5.5 $0.0504 · Claude Opus 5.5 $0.1340. These are medians, so a real conversation can cost more.
- **Enclave.** Build v0.73.0, commit d47912c, PCR0 3ef8 468b feaf b866 … Verify with `gh attestation verify PCR.json --repo PayPerQ/ppq-enclave-proxy` and `npx ppq-private-mode` (repo PayPerQ/ppq-privacy-verifier).
- **Privacy panel.** PayPerQ can't read message contents; the provider doesn't get your IP; PayPerQ sees model, token counts and timing.
- **Scope.** Protection covers chat in the web app and the API; images, video and audio take other paths.
- **Payments.** Lightning top-ups are $0.10–$1,000. Also BTC on-chain, Monero, Litecoin, Liquid, USDT, USDC, NWC and card. No email required.
- **Sats.** Converted at $68,866 per BTC (mempool.space, Nov 13). The footer block height is 975,697.
- **Representative numbers.** Receipt lines and OneLine call costs are representative, not real usage. OneLine costs use 28 input and 42 output tokens at catalogue API prices.

## Credits

- Model logos come from the app's `pricing-icons` (Lobe Icons, MIT; Simple Icons, CC0); see `assets/logos/models/SOURCES.md`.
- Payment marks are from Wikimedia Commons: Bitcoin, Monero and Tether are public domain; USDC and the Lightning Network mark (Ole Henrik Skogstrøm) are CC BY-SA 4.0. Litecoin is from Simple Icons.
- Integration icons come from the app's `integration-icons`.
- Fonts are OFL, from Google Fonts, plus Departure Mono from GitHub and Geist from Vercel.
