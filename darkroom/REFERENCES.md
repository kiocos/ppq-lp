# References, re-opened for the darkroom page (Nov 13, 2026)

All five references were re-captured today with a headless browser at 1440 px: viewport-by-viewport screenshots plus computed type and colour (`research/*.png`, `research/*.json`). `research/vercel-design.md` is a fresh copy of vercel.com/design.md. The full teardown from the previous round is in `../uniform/REFERENCES.md`. This file records what changed since then and what matters for this direction.

## What's new and relevant to "darkroom"

| Site | Measured today | Take | Avoid |
| --- | --- | --- | --- |
| **Vercel** | #000 canvas. H1 is Geist 64/64, weight 400, −0.06em. H2 is 56 px/450. Ledes are 24 px #a1a1a1, two-tone. 1448 px max width. **The new hero is one black triangle backlit by a soft, grainy white glow**: one light source on black, and nothing else. | The proof that one light in the dark, with grain in its falloff, can carry a hero. The safelight is our version, in PPQ orange. Two-tone ledes, as before. | Copying the centred object. Our light falls on the product, not on a logo. |
| **Cursor** | Now serves dark by default: **warm near-black #14120b**, text #edecec, H1 only 26 px. Product windows float over paintings. It shows a cookie consent banner. | A warm black canvas. A darkroom isn't pure black either, and warm black reads as a lit room rather than the void. A small, calm H1 is allowed when the product is the hero. | The consent banner (PPQ's page loads no trackers, so it needs none). |
| **AI Hero** | #080808. Geist 700 at 76 px. Mono labels at 11 px uppercase with 1.3–1.8 px tracking. A mono stat row. One yellow CTA. **The hero portrait now sits on a grainy multicolour gradient.** "Agents" footer column. | A mono stat row for the catalogue numbers. One bright CTA colour (amber). Grain on the hero image, not on the chrome. | The multicolour gradient: we keep one hue. |
| **Command Code** | Black and indigo. **Grainy gradient bars are the illustration**, and the footer is a noise field. "//" mono labels. Tilted sticker cards. Grid lines everywhere. | Grain as the material of the illustration, in one committed colour. A noise field in the footer, which becomes our Shannon line. | Grid lines and boxed sections (the user dislikes them). Sticker cards. |
| **Fonts In Use** | Geist Sans is paired with Martian Mono + Geist Mono, Instrument Serif, Romie, F37 K9 Slab, Gregory Grotesk and CMM Coda. The technology gallery keeps two patterns: **grotesk + book serif** (Neue Montreal + Tiempos, Sita Sans + GT Alpina, Forma DJR + Times) and **grotesk + characterful mono** (Funnel Sans + Lo-Res, Family + Söhne Mono, Leif + Ja Mono, Fictional + Indicate Mono). | The three pairings below each take one of those patterns, with Geist doing the reading. | Instrument Serif (rejected earlier) and any italic emphasis. |

## Pairings on the darkroom page (press T)

1. **Geist + Geist Mono**: a superfamily. It's the calmest option; Vercel-native, lab-neutral. Wordmark in Geist SemiBold.
2. **Archivo Expanded + Geist**: width contrast. The wide display face carries the "instrument" stance and continues the old wordmark's width without the sci-fi letterforms (see `../uniform/logo-study.html`). Wordmark in Archivo Expanded Bold.
3. **Source Serif 4 + Geist**: grotesk + book serif, the most common technology pairing on Fonts In Use. It's upright, with no italics. Photography books and lab manuals are set this way, so it suits "the print". Wordmark in Geist SemiBold.

## Rules carried over

- From design.md: hierarchy comes from type before surfaces. Each section makes one evidence-bearing move, and identical section silhouettes are template noise. Motion explains a state change.
- From the user: neutrals plus PPQ orange, short pages, no italic emphasis, real logos, scoped privacy claims, no trackers, no "vs." table.
- Darkroom-specific: amber, never red. No film-strip, camera, aperture or lens imagery. Dark must read as a lab, not as hiding.
