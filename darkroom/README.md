# PayPerQ landing study: darkroom safelight

Open `../uniform/index.html`, the shared study hub (card 06). `index.html` here only redirects there. Everything is local: no server, and no third-party requests.

| Path | What it holds |
| --- | --- |
| `r1/`, `r2/`, `r3/` | Three rounds. Round 3 is current. `index.html` is the dark page; `print.html` (rounds 2–3) is the daylight re-take. Press T to cycle the type pairings. |
| `REVIEW.md` | The critique that drove each round, and the round-3 outcome. |
| `REFERENCES.md`, `research/` | The references, re-opened and re-captured on Nov 13, 2026. |
| `app-captures/` | Real chat captures (2880 px desktop, 1200 px phone) and `_masters/` recordings. |
| `motion/` | The Remotion project: `Develop` (hero), `DevelopPhone`, `PickerDevelop`, plus `DevelopR1` for the round-1 render. `render-r1.sh`, `render-r2.sh` and `render-r3.sh` reproduce each round's files. |
| `assets/` | Fonts, real logos, page stills, the grain tile and rendered motion. |
| `facts/` | `models-pricing.json` and `published-pcr.json` as fetched on Nov 13, 2026. |
| `tools/` | Capture, crop, screenshot and check scripts (they reuse `../uniform/tools/node_modules`). |

## Regenerate

- **Captures.** These need the app on localhost:3000. First copy `facts/models-pricing.json` to `/tmp/ppq-models.json`. Then run `cd tools && node capture.mjs dark`, `node capture-mobile.mjs dark` and `node capture-m-answer.mjs`. They reuse the uniform guest profile, so no new anonymous accounts are created. The conversation is seeded into IndexedDB and never sent. `mock-greeting.mjs` pins the new-chat greeting.
- **Motion.** Copy new captures into `motion/public/app/`, then run `motion/render-r3.sh`.
- **Screens and checks.** Run `cd tools && node pageshot.mjs ../r3/index.html ../r3/print.html`, `node foldshots.mjs ../r3/index.html r3` and `node checks.mjs`.
