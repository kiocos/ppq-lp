# Forge study (Nov 16, 2026)

A standalone hero for PayPerQ. It answers the critique of `prometheus/r10` (a still baroque forge painting) by keeping the forge but turning it from a scene into the page's material. It is not linked into any landing page or the shared hub.

Open `index.html` directly. It needs a GPU; reduced motion, or `?static`, shows the settled frame.

- **Metal = build.** A WebGL steel bar (`#fs` shader) with a forged point on the left under the copy. It is cold at the point and hot under the product. Heat lives in a 1-D field that diffuses: tokens being written, the cursor and typing all add heat.
- **Hot tokens = AI.** Every streamed token arrives incandescent and cools to the text colour (`@keyframes cool`).
- **Hallmark = verifiable privacy.** Four punches are struck into the hot bar, one per check, before the message is sent: maker (PPQ), assay (AWS Nitro), standard (PCR0 `bd2b83ae…5de85c10`), date letter (v0.75.0). Hover a punch for its explanation.
- **One orange.** The shader's colour ramp passes through `#bf3c1b` at half heat, the same colour as the CTA.

Real: a replica of the app's composer, model names, the API base URL, and PCR0/v0.75.0 from `prometheus/facts/published-pcr.json` (updated 2026-11-13).
Staged: the answers (written, no model call) and the verification (a timed sequence). To ship, the check must run for real in the browser, which needs CORS on the attestation endpoint, or the punches must go.

Keys: R replays the opening, A toggles the anatomy. Captures: `cd tools && node shots.mjs r5` (Metal GPU; SwiftShader is too slow for the timeline) and `node video.mjs` (→ `review/opening.webm`; convert with ffmpeg).
