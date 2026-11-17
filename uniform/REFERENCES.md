# Reference teardown (Nov 13, 2026)

Captured with a headless browser at 1440 px (computed styles plus scroll-by-scroll screenshots in `research/`). Values are measured, not estimated.

## Vercel — vercel.com and design.md

- **Canvas:** pure black (#000). Text is #ededed; secondary text is #a1a1a1.
- **Type:** Geist only, with Geist Mono for code and IDs.
  - H1: 64 px, weight 400, line-height 1.0, tracking −0.06em.
  - H2: 56 px, weight 450, tracking −0.06em.
  - Lede: 24 px, weight 450, tracking −0.04em.
- **Emphasis:** two tones in one sentence. The lead phrase is white and the rest grey ("Zapier serves over 100 million / monthly website visits on Vercel."). This is the emphasis-by-tone you already prefer.
- **Layout:** a 1448 px max width and very large gaps between sections (about 200 px). Each section has one focal object: a customer product shot plus a short feature list in 14 px text.
- **design.md rules worth keeping:**
  - Hierarchy comes from type before surfaces. No eyebrows, no em dashes, no decorative gradients or glows.
  - Motion only explains a state change.
  - One evidence-bearing move per section, and tables for exact values.
  - Avoid "identical section silhouettes" and "generic centered hero followed by a card grid".
  - "Create presence through commitment, not additional effects."
- **Tension with the video advice:** design.md rejects textures and glass; the video recommends them for depth. We kept texture inside motion pieces (grain) and out of the page chrome.

## Cursor — cursor.com

- **Canvas:** warm off-white (#f7f7f4 family), with dark text and orange as the only accent (for links).
- **Type:** CursorGothic for UI and headlines, Berkeley Mono, and EB Garamond inside product shots.
  - The H1 is small: 26 px on two lines.
  - Section titles are 22 px, weight 400, in two tones (dark title, grey sentence).
- **Star:** real product windows floating over impressionist landscape paintings. Each section is a tinted card with no border lines.
- **Rhythm:** alternating split cards, about 67 px of padding inside each card, and generous space between them. Testimonials sit in a simple grid of six.
- **Lesson:** the product is the hero, and atmosphere comes from one painterly layer behind it. Page 05 translates this into the night landscape.

## AI Hero — aihero.dev

- **Canvas:** #080808. Text is #f4f3f1, with the secondary at 72% opacity.
- **Type:** Geist Bold (700) for headlines: H1 76 px at −0.042em, H2 40–52 px. Labels are Geist Mono 11 px uppercase with 1.3–1.8 px tracking. Quotes are in Source Serif.
- **Details:**
  - Mono stats under the hero (135,400+ developers learning).
  - One yellow CTA.
  - Skill commands shown as code chips.
  - A footer column titled "Agents" with llms.txt and skills.md.
- **Lesson:** a bold sans with small mono metadata reads confident without being loud. We borrowed the "For agents" footer column on every page (PayPerQ publishes llms.txt).

## Command Code — commandcode.ai

- **Canvas:** black, with indigo (#4f46e5 family) as the one unusual colour.
- **Type:** Geist 52 px, weight 600. "// comment" section labels in mono. A version number (v1.89.0) is used as a display element.
- **Personality comes from:**
  - grainy gradient bars as illustrations,
  - a goat mascot,
  - tilted sticker cards in the testimonials,
  - an animated noise-field footer.
- **What you didn't like:** the grid lines and sections boxed in by rules. We used none of those.
- **Lesson:** personality can come from texture and one committed colour. Page 04 uses grainy ember bars, but each bar is real data (chat models per provider), and amber is PPQ's own warm range.

## Fonts In Use — technology topic and Geist pages

- **Geist Sans in use** is paired with Martian Mono + Geist Mono, Instrument Serif, Romie, F37 K9 Slab, Gregory Grotesk and CMM Coda.
- **The technology gallery** keeps landing on two patterns: a neutral grotesk with a book serif (Neue Montreal + Tiempos, Sita Sans + GT Alpina, Forma DJR + Times), or a grotesk with a characterful mono (Funnel Display + Funnel Sans + Lo-Res, Family + Söhne Mono, Leif + Ja Mono).
- **Pairings tested here** (all OFL, self-hosted). Each pairs one anchor with Geist, contrasting in width, construction or class:

| Page | Pairing 1 | Pairing 2 | Pairing 3 |
| --- | --- | --- | --- |
| 01 | Geist + Geist Mono | Geist + Martian Mono | Geist + IBM Plex Mono |
| 02 | Archivo Expanded + Geist | Hubot Sans Expanded + Geist | Michroma + Geist |
| 03 | Source Serif 4 + Geist | Newsreader + Geist | Geist + Source Serif 4 text |
| 04 | Martian Mono + Geist | JetBrains Mono + Geist | Departure Mono + Geist |
| 05 | Funnel Display + Geist | Mona Sans Wide + Geist Mono | Schibsted Grotesk + Geist |

- **Excluded:** Instrument Serif and italic emphasis, which you found hard to read.
